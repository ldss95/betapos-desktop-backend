import { Request, Response } from 'express';
import moment from 'moment';

import { Shift } from './model';

export default {
	create: (req: Request, res: Response) => {
		const { amount } = req.body;

		Shift.create({ startAmount: amount, userId: req.session!.user.id })
			.then(() => res.sendStatus(201))
			.catch((error) => {
				res.sendStatus(500);
				throw error;
			});
	},
	getAll: (req: Request, res: Response) => {
		const user = req.session!.user.id;
		Shift.findAll({
			where: { user }
		})
			.then((shifts) => res.status(200).send(shifts))
			.catch((error) => {
				res.sendStatus(500);
				throw error;
			});
	},
	getCurrentShift: (req: Request, res: Response) => {
		const today = moment().format('YYYY-MM-DD');
		Shift.findOne({
			where: {
				userId: req.session!.user.id,
				date: today,
				endTime: null,
				endAmount: null
			}
		})
			.then((shift) => res.status(200).send(shift))
			.catch((error) => {
				res.sendStatus(500);
				throw error;
			});
	}
};
