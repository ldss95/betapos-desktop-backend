import { Request, Response } from 'express'

import { Client } from './model'

export default {
	getAll: (req: Request, res: Response) => {
		Client.findAll()
			.then((clients) => res.status(200).send(clients))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
}
