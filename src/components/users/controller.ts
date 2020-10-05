import { Request, Response } from 'express';
import { User } from './model'

export default {
	getAll: (req: Request, res: Response) => {
	   User.findAll()
		.then(users => {
			res.status(200).send(users)
		}).catch(error => {
			res.sendStatus(500)
			throw error
		})
	}
	}