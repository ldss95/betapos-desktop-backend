import { Request, Response } from 'express';
import moment from 'moment';
import { fn, col } from 'sequelize'

import { Shift } from './model';
import { Ticket } from '../tickets/model'
import { CashFlow } from '../cash-flow/model'
import { sendToAPI } from '../sync/controller'

export default {
	create: (req: Request, res: Response) => {
		const { amount } = req.body;

		Shift.create({ startAmount: amount, userId: req.session!.user.id })
			.then((results) => {
				res.status(201).send(results)

				const shift = results.get({ plain: true })
				shift.shopId = req.session!.shopId
				shift.startTime = moment(shift.startTime).format('HH:mm:ss')
				shift.startCash = shift.startAmount

				sendToAPI({
					path: '/shifts',
					data: { shift },
					reTry: true,
					method: 'POST',
					attemp: 1,
					isNew: true,
					callback: () => { }
				})
			})
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
	getOne: (req: Request, res: Response) => {
		const { id } = req.params;
		const query = `SELECT
				(SELECT SUM(amount) FROM Tickets WHERE shiftId = '${id}') AS total,
				(SELECT SUM(discount) FROM Tickets WHERE shiftId = '${id}') AS discounts,
				(SELECT SUM(amount) FROM CashFlows WHERE shiftId = '${id}' AND type = 'IN') AS cashIn,
				(SELECT SUM(amount) FROM CashFlows WHERE shiftId = '${id}' AND type = 'OUT') AS cashOut
			`;

		Shift.sequelize
			?.query(query, { plain: true })
			.then((results) => {
				res.status(200).send(results);
			})
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
	},
	finishShift: async (req: Request, res: Response) => {
		try {
			const { id, endAmount, cashDetail } = req.body;
			const endTime = moment().format('HH:mm:ss')

			await Shift.update(
				{
					endAmount,
					cashDetail,
					endTime
				},
				{ where: { id } }
			)

			res.sendStatus(204)

			const sold: any = await Ticket.findOne({
				where: { shiftId: id },
				attributes: [
					[fn('coalesce', fn('sum', col('amount')), 0), 'sold'],
					[fn('coalesce', fn('sum', col('discount')), 0), 'discount']
				],
				raw: true
			})

			const _in: any = await CashFlow.findOne({
				where: { shiftId: id, type: 'IN' },
				attributes: [
					[fn('coalesce', fn('sum', col('amount')), 0), 'income']
				],
				raw: true
			})

			const _out: any = await CashFlow.findOne({
				where: { shiftId: id, type: 'OUT' },
				attributes: [
					[fn('coalesce', fn('sum', col('amount')), 0), 'expenses']
				],
				raw: true
			})

			const shift = {
				id,
				endCash: endAmount,
				cashDetail,
				cashIn: _in.income,
				cashOut: _out.expenses,
				totalSold: sold.sold - sold.discount,
				endTime
			}

			sendToAPI({
				path: '/shifts',
				method: 'PUT',
				data: { shift },
				attemp: 1,
				reTry: true,
				isNew: true,
				callback: () => { }
			})
		} catch (error) {
			res.sendStatus(500);
			throw error;
		}
	}
};
