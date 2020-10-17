import { Request, Response } from 'express';

import { CashFlow } from './model';

export default {
	create: (req: Request, res: Response) => {
		const { id } = req.session!.user;
		const { amount, description, type, shiftId, cashDetail } = req.body;

		const cashFlow = { userId: id, amount, description, type, shiftId, cashDetail };
		CashFlow.create(cashFlow)
			.then(() => res.sendStatus(204))
			.catch(error => {
				res.sendStatus(500);
				throw error;
			})
	}
};
