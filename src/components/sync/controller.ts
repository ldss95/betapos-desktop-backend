import { Request, Response } from 'express'

import http from 'http';
import https from 'https';
import { Sync } from './model'
import { listen } from '../../utils/listener'
import { Meta } from '../meta/model';

const sync = async (req: Request, res: Response) => {
	try {
		listen()
		const { wait } = req.body
		let responseIsSend = false

		const meta = await Meta.findOne();

		if (!meta) {
			console.error('No device ID found')
			return res.sendStatus(500)
		}

		const { device: { deviceId } } = meta
		let pending = await Sync.findAll({ where: { status: 'PENDING' } })
		pending.forEach(record => {
			sendToAPI({
				deviceId,
				path: record.path,
				data: record.data,
				isNew: false,
				method: record.method,
				reTry: (wait) ? false : true, //If client is waiting for response, no re try send to api when fail.
				attemp: 1,
				callback: (isSaved: boolean) => {
					if (!isSaved && !responseIsSend) {
						res.status(200).send({ allIsDone: false })
						responseIsSend = true
						return
					}

					if (isSaved) {
						record.update({ status: 'DONE' })
							.catch(error => {
								throw error
							})

						/*
							If the client is waiting response,
							verify if all done, then send response.
						*/
						if (wait) {
							pending = pending.filter(item => item.id != record.id)

							if (pending.length == 0) {
								res.status(200).send({ allIsDone: true })
							}
						}
					}
				}
			})
		})

		/*
			If the client is not waiting response,
			end http request and continue process
		*/
		if (!wait) {
			res.sendStatus(202)
			responseIsSend = true
		}
	}catch(error) {
		res.sendStatus(500)
		throw error
	}
}

const create = (url: string, data: object) => {
	Sync.create({ url, data }).catch(error => {
		throw error
	})
}

const getUnsynchronized = (req: Request, res: Response) => {
	Sync.findAll({ where: { status: 'PENDING' } })
		.then(records => res.status(200).send(records))
		.catch(error => {
			res.sendStatus(500)
			throw error
		})
}

interface SendToApiInput {
	path: string;
	data: object;
	isNew: boolean,
	reTry: boolean;
	attemp: number;
	method: 'POST' | 'PUT';
	callback: CallableFunction;
	deviceId: string;
}

const sendToAPI = (input: SendToApiInput) => {
	const API_URL = process.env.API_URL
	const isProduction = (process.env.NODE_ENV == 'production')

	const { path, data, isNew, callback, reTry, attemp, method, deviceId } = input

	/**
		Determine which client to use, depending on whether we are in production or not. While in a development environment http will be used, in production https will be used
	*/
	const client = (isProduction) ? https : http;
	
	// Get hostname, remove protocol and separate port from hostname
	let hostname = API_URL!
		.replace('https://', '')
		.replace('http://', '')
		.replace('/api', '')
	let port: number;
	if (hostname.includes(':')) {
		const portIndicatorIndex = hostname.indexOf(':')
		port = Number(hostname.substr(portIndicatorIndex + 1))
		hostname = hostname.substr(0, portIndicatorIndex)
	} else {
		port = (API_URL!.includes('https')) ? 443: 80
	}

	const options = {
		hostname,
		port,
		path: '/api' + path,
		method,
		headers: {
			'Content-Type': 'application/json',
			merchantId: process.env.MERCHANT_ID,
			deviceId
		}
	};

	const req = client.request(options, (res) => {
		const { statusCode } = res
		if (statusCode! > 299) {
			return onError()
		}

		callback((statusCode == 201 || 204) ? true : false)

		res.on('data', (d) => {
			process.stdout.write(d);
		});
	});

	req.on('error', onError);

	function onError(){
		if (reTry && attemp < 3) {
			setTimeout(() => {
				sendToAPI({
					...input,
					attemp: attemp + 1
				})
			}, 1000 * 60 * 2)

			return
		}

		if (isNew) {
			Sync.create({ path, data, method })
				.catch(error => {
					throw error
				})
		}

		callback(false)
	}

	req.write(JSON.stringify(data));
	req.end();
}

export { create, sendToAPI, sync, getUnsynchronized }