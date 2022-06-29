import { Request, Response } from 'express'

import { TicketPaymentType } from './model'

export default {
	getAll: (req: Request, res: Response) => {
		TicketPaymentType.findAll({ order: [['name', 'ASC']] })
			.then((types) => res.status(200).send(types))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	}
}
