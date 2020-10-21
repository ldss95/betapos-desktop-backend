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
						[fn('coalesce', fn('sum', col('amount')), 0), 'sold'],
						[fn('coalesce', fn('sum', col('discount')), 0), 'discount']
					],
					raw: true
				})

				const _in: any = await CashFlow.findOne({
					where: { shiftId, type: 'IN' },
					attributes: [
						[fn('coalesce', fn('sum', col('amount')), 0), 'income']
					],
					raw: true
				})

				const _out: any = await CashFlow.findOne({
					where: { shiftId, type: 'OUT' },
					attributes: [
						[fn('coalesce', fn('sum', col('amount')), 0), 'expenses']
					],
					raw: true
				})

				res.status(200).send({
					sold: sold.sold,
					discount: sold.discount,
					income: _in.income,
					expenses: _out.expenses,
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
