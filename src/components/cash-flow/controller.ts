import { Request, Response } from 'express';
import { fn, col, where } from 'sequelize'

import { CashFlow } from './model';
import { Ticket } from '../tickets/model'

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { id } = req.session!.user;
			const { amount, description, type, shiftId, cashDetail } = req.body;

			const cashFlow = { userId: id, amount, description, type, shiftId, cashDetail };
			await CashFlow.create(cashFlow)

			if (type == 'CHECK') {
				const sold: any = await Ticket.findOne({
					where: { shiftId },
					attributes: [
						[fn('sum', col('amount')), 'sold'],
						[fn('sum', col('discount')), 'discount']
					],
					raw: true
				})

				const _in: any = await CashFlow.findOne({
					where: { shiftId, type: 'IN' },
					attributes: [
						[fn('sum', col('amount')), 'income']
					],
					raw: true
				})

				const _out: any = await CashFlow.findOne({
					where: { shiftId, type: 'OUT' },
					attributes: [
						[fn('sum', col('amount')), 'expenses']
					],
					raw: true
				})

				res.status(200).send({
					sold: sold.sold || 0,
					discount: sold.discount || 0,
					income: _in.income || 0,
					expenses: _out.expenses || 0,
					amount
				})
				return
			}

			res.sendStatus(204)
		} catch (error) {
			res.sendStatus(500);
			throw error;
		}
	}
};
