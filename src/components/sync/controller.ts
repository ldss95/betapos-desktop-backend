import { Request, Response } from 'express'
import http from 'http';

import { Sync } from './model'

const sync = (req: Request, res: Response) => {
	Sync.findAll({ where: { status: 'PENDING' } })
		.then(records => {
			records.forEach(record => {
				sendToAPI({
					path: record.path,
					data: record.data,
					isNew: false,
					attemp: 1,
					callback: (isSaved: boolean) => {
						if (isSaved) {
							record.update({ status: 'DONE' })
								.catch(error => {
									throw error
								})
						}
					}
				})
			})

			res.sendStatus(204)
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
	attemp: number,
	callback: CallableFunction
}

const sendToAPI = (input: SendToApiInput) => {
	const { path, data, isNew, callback, attemp } = input

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
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	};

	const req = http.request(options, (res) => {
		const { statusCode } = res
		callback((statusCode == 201) ? true: false)

		res.on('data', (d) => {
			process.stdout.write(d);
		});
	});

	req.on('error', (error) => {
		if (attemp < 3) {
			setTimeout(() => {
				sendToAPI({
					...input,
					attemp: attemp + 1
				})
			}, 1000 * 60 * 2)

			return
		}

		if (isNew) {
			Sync.create({ path, data })
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