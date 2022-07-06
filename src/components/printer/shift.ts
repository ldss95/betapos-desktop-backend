import axios from 'axios';
import { fn, col, Op } from 'sequelize';

import { Shift } from '../shifts/model';
import { Business } from '../business/model';
import { User } from '../users/model';
import { Ticket } from '../tickets/model';
import { CashFlow } from '../cash-flow/model';
import { TicketPaymentType } from '../ticket-payments-types/model';
import { TicketPayment } from '../ticket-payments/model';

/**
 * Metodo para imprimir un turno
 * @param id ID del turno a imprimir
 */
async function printShift (id: string) {
	try {
		if (!id) {
			throw new Error('El id de la factura es requerido');
		}

		const shift = await Shift.findByPk(id, {
			include: [
				{
					model: User,
					as: 'user'
				}
			]
		});

		if (!shift) {
			throw new Error('Turno no encontrado')
		}

		/**
			Get Shift data
		*/
		const { sold, discount }: any = await Ticket.findAll({
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

		const business = await Business.findOne()!;
		
		await axios.post('http://localhost/modulos/ventas/print_shift.php', {
			business: {
				name: business?.name,
				address: business?.address,
				phone: business?.phone,
				rnc: business?.rnc
			},
			user: {
				name: `${shift.user.firstName} ${shift.user.lastName}`
			},
			date: shift.date,
			startTime: shift.startTime,
			endTime: shift.endTime,
			amounts: {
				shiftStart: shift.startAmount,
				shiftEnd: shift.endAmount,
				totalSold: sold,
				...amounts
			},
			results
		})
	} catch (error) {
		throw error;
	}
}

export { printShift }