import { Request, Response } from 'express';
import moment from 'moment';
import 'moment/locale/es'
import { fn, col } from 'sequelize'
import path from 'path'
import sid from 'shortid'

import { Shift } from './model';
import { Ticket } from '../tickets/model'
import { CashFlow } from '../cash-flow/model'
import { Meta } from '../meta/model'
import { sendToAPI } from '../sync/controller'
import { sendMessage, format, generatePdf } from '../../utils/helpers';

moment.locale('es')

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
			const { shift, endAmount, cashDetail, shopName, sellerName } = req.body;
			const todayDate = moment().format('YYYY-MM-DD')
			const endTime = moment().format('HH:mm:ss')

			await Shift.update(
				{
					endAmount,
					cashDetail,
					endTime
				},
				{ where: { id: shift.id } }
			)

			res.sendStatus(204)

			/**
				Get Shift data
			*/
			const sold: any = await Ticket.findOne({
				where: { shiftId: shift.id },
				attributes: [
					[fn('coalesce', fn('sum', col('amount')), 0), 'sold'],
					[fn('coalesce', fn('sum', col('discount')), 0), 'discount']
				],
				raw: true
			})

			const cashFlow = await CashFlow.findAll({ where: { shiftId: shift.id }, raw: true })
			const incomeAmount = cashFlow.filter(item => item.type == 'IN').reduce((sum, item) => sum + item.amount, 0)
			const expensesAmount = cashFlow.filter(item => item.type == 'OUT').reduce((sum, item) => sum + item.amount, 0)

			sendToAPI({
				path: '/shifts',
				method: 'PUT',
				data: {
					shift: {
						id: shift.id,
						endCash: endAmount,
						cashDetail,
						cashIn: incomeAmount,
						cashOut: expensesAmount,
						totalSold: sold.sold - sold.discount,
						endTime
					}
				},
				attemp: 1,
				reTry: true,
				isNew: true,
				callback: () => { }
			})

			/**
				Send Email with pdf
			*/
			
			const fileName = `Cierre ${shopName} ${sid.generate()}.pdf`
			const filePath = path.join(__dirname, `../../reports/${fileName}`)
			const mismatch = endAmount - (sold.sold - sold.discount + shift.startAmount + incomeAmount- expensesAmount)

			await generatePdf({
				templatePath: path.join(__dirname, '../../templates/shift_end.hbs'),
				outputPath: filePath,
				templateContext: {
					shopName,
					date: moment().format('dddd DD MMMM YYYY'),
					sellerName,
					startTime: moment(shift.startTime).format('hh:mm:ss A'),
					endTime: moment(`${todayDate} ${endTime}`).format('hh:mm:ss A'),
					currentShift: {
						totalSold: format.cash(sold.sold - sold.discount),
						startCash: format.cash(shift.startAmount),
						cashIn: format.cash(incomeAmount),
						cashOut: format.cash(expensesAmount),
						endAmount: format.cash(endAmount),
						mismatch: format.cash(mismatch),
						...(mismatch) && {
							mismatchSymbol: (mismatch < 0) ? '-': '+',
							mismatchClass: (mismatch < 0) ? 'missing': 'surplus'
						}
					},
					...(incomeAmount) && {
						income: {
							total: format.cash(incomeAmount),
							records: cashFlow.filter(item => item.type == 'IN').map(item => ({ ...item, amount: format.cash(item.amount) }))
						}
					},
					...(expensesAmount) && {
						expenses: {
							total: format.cash(expensesAmount),
							records: cashFlow.filter(item => item.type == 'OUT').map(item => ({ ...item, amount: format.cash(item.amount) }))
						}
					}
				}
			})

			const meta = await Meta.findOne({ attributes: ['sendEmails'] })

			sendMessage({
				html: '',
				to: meta!.sendEmails.join(','),
				subject: `${shopName} ${moment().format('DD / MMMM / YYYY')}`,
				attachments: [{
					filename: fileName,
					path: filePath
				}]
			})
		} catch (error) {
			res.sendStatus(500);
			throw error;
		}
	}
};
