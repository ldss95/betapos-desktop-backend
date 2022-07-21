import { Request, Response } from 'express';
import moment from 'moment';
import 'moment/locale/es'
import { fn, col, Op } from 'sequelize'
import axios from 'axios'

import { Shift } from './model';
import { Ticket } from '../tickets/model'
import { Meta } from '../meta/model'
import { CashFlow } from '../cash-flow/model'
import { sendToAPI } from '../sync/controller'
import { printShift } from '../printer'
import { TicketPayment } from '../ticket-payments/model';
import { TicketPaymentType } from '../ticket-payments-types/model';

moment.locale('es')

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { amount } = req.body;

			const results = await Shift.create({ startAmount: amount, userId: req.session!.user.id })
			res.status(201).send(results)

			const shift = results.get({ plain: true })
			shift.startTime = moment(shift.startTime).format('HH:mm:ss')
			shift.startCash = shift.startAmount
			const meta = await Meta.findOne();
			sendToAPI({
				deviceId: meta?.device?.deviceId!,
				path: '/shifts',
				data: { shift },
				reTry: true,
				method: 'POST',
				attemp: 1,
				isNew: true,
				callback: () => { }
			})
		} catch (error) {
			res.sendStatus(500);
			throw error;
		}
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
		let resWasSended = false
		try {
			const { shift: { id }, endAmount, cashDetail } = req.body;

			const shift = await Shift.findByPk(id);
			if (!shift) {
				return res.status(400).send({
					message: 'Turno no encontrado'
				})
			}

			const endTime = moment().format('HH:mm:ss')
			await shift.update({
				endAmount,
				cashDetail,
				endTime
			})

			/**
				Get Shift data
			*/
			const { sold, discount }: any = await Ticket.findOne({
				where: {
					[Op.and]: [
						{ shiftId: shift.id },
						{ status: 'DONE' }
					]
				},
				attributes: [
					[fn('coalesce', fn('sum', col('amount')), 0), 'sold'],
					[fn('coalesce', fn('sum', col('discount')), 0), 'discount']
				],
				raw: true
			})

			const payments = await TicketPayment.findAll({
				include: {
					model: Ticket,
					as: 'ticket',
					where: {
						[Op.and]: [
							{ shiftId: shift.id },
							{ status: 'DONE' }
						]
					},
					required: true
				}
			})
	
			const paymentTypes = await TicketPaymentType.findAll();
			const PAYMENT_ID: any = {
				'Efectivo': '',
				'Tarjeta': '',
				'Fiao': ''
			}
			for (const { name, id } of paymentTypes){
				PAYMENT_ID[name] = id;
			}

			const cashFlow = await CashFlow.findAll({ where: { shiftId: shift.id }, raw: true })
			const amounts = {
				expenses: cashFlow.filter(item => item.type == 'OUT').reduce((sum, item) => sum + item.amount, 0),
				income: cashFlow.filter(item => item.type == 'IN').reduce((sum, item) => sum + item.amount, 0),
				cash: payments
					.filter(({ typeId }) => typeId == PAYMENT_ID.Efectivo)
					.reduce((total, { amount }) => total + amount, 0),
				credit: payments
					.filter(({ typeId }) => typeId == PAYMENT_ID.Fiao)
					.reduce((total, { amount }) => total + amount, 0),
				card: payments
					.filter(({ typeId }) => typeId == PAYMENT_ID.Tarjeta)
					.reduce((total, { amount }) => total + amount, 0)
			}

			const results = (shift.endAmount || 0) - (shift.startAmount + amounts.cash - discount + amounts.income - amounts.expenses);

			res.status(200).send({
				results,
				...(results > 0) && {
					mainClass: 'info',
					mainTitle: 'Sobrante'
				},
				...(results < 0) && {
					mainClass: 'danger',
					mainTitle: 'Faltante'
				},
				...(results == 0) && {
					mainTitle: 'Sin Diferencias'
				},
				sold,
				discount,
				expenses: amounts.expenses,
				income: amounts.income,
				amount: endAmount
			})
			resWasSended = true

			const meta = await Meta.findOne();
			sendToAPI({
				deviceId: meta?.device?.deviceId!,
				path: '/shifts',
				method: 'PUT',
				data: {
					shift: {
						id: shift.id,
						endAmount,
						cashDetail,
						cashIn: amounts.income,
						cashOut: amounts.expenses,
						totalSold: sold - discount,
						endTime
					}
				},
				attemp: 1,
				reTry: true,
				isNew: true,
				callback: () => { }
			})
		} catch (error) {
			if (!resWasSended) {
				res.sendStatus(500);
			}

			if(!axios.isAxiosError(error)) {
				throw error;
			}
		}
	},
	print: (req: Request, res: Response) => {
		const { id } = req.params;
		printShift(id);
		res.sendStatus(204);
	}
};
