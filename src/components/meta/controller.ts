import { Request, Response } from 'express'

import { Meta } from './model'

export default {
	get: (req: Request, res: Response) => {
		Meta.findOne()
			.then((meta) => res.status(200).send(meta))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	},
	update: (req: Request, res: Response) => {
		Meta.update(req.body, { where: {} })
			.then(() => res.sendStatus(204))
			.catch(error => {
				res.sendStatus(500)
				throw error
			})
	}
}