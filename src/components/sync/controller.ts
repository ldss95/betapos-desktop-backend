import { Request, Response } from 'express'
import http from 'http';

import { Sync } from './model'

const sync = (req: Request, res: Response) => {
	const { wait } = req.body
	let responseIsSend = false

	Sync.findAll({ where: { status: 'PENDING' } })
		.then(records => {
			records.forEach(record => {
				sendToAPI({
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
								records = records.filter(item => item.id != record.id)

								if (records.length == 0) {
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
			}
		}).catch(error => {
			res.sendStatus(500)
			throw error
		})
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
	attemp: number,
	method: 'POST' | 'PUT';
	callback: CallableFunction
}

const sendToAPI = (input: SendToApiInput) => {
	const { path, data, isNew, callback, reTry, attemp, method } = input

	const hostname = (process.env.NODE_ENV == 'production')
		? process.env.API_URL
		: 'localhost'

	const port = (process.env.NODE_ENV == 'production')
		? 80
		: 4012

	const options = {
		hostname,
		port,
		path,
		method,
		headers: {
			'Content-Type': 'application/json'
		}
	};

	const req = http.request(options, (res) => {
		const { statusCode } = res
		callback((statusCode == 201) ? true : false)

		res.on('data', (d) => {
			process.stdout.write(d);
		});
	});

	req.on('error', () => {
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
	});

	req.write(JSON.stringify(data));
	req.end();
}

export { create, sendToAPI, sync, getUnsynchronized }