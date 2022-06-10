import { Request, Response } from 'express';
import { fn, col } from 'sequelize'
import moment from 'moment'

import { CashFlow } from './model';
import { Ticket } from '../tickets/model'
import { sendToAPI } from '../sync/controller'
import { Meta } from '../meta/model'

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { id } = req.session!.user;
			const { amount, description, type, shiftId, cashDetail } = req.body;

			const data = { userId: id, amount, description, type, shiftId, cashDetail };
			let cashFlow: any = await CashFlow.create(data)

			/*
				Send To API
			*/
			cashFlow = cashFlow.get()
			cashFlow.createdAt = moment(cashFlow.createdAt).format('YYYY-MM-DD HH:mm:ss')
			cashFlow.updatedAt = moment(cashFlow.updatedAt).format('YYYY-MM-DD HH:mm:ss')
			const meta = await Meta.findOne();
			sendToAPI({
				deviceId: meta?.device?.deviceId!,
				path: '/cash-flow',
				method: 'POST',
				data: { cashFlow },
				isNew: true,
				attemp: 1,
				reTry: true,
				callback: () => { }
			})
			/* */

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
