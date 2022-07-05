import { Request, Response } from 'express';

import { Product } from '../products/model';
import { Ticket } from './model';
import { TicketProduct } from '../ticket-products/model';
import { Meta } from '../meta/model';
import { sendToAPI } from '../sync/controller'
import { TicketPayment } from '../ticket-payments/model';
import { printTicket } from '../printer';

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { ticket, products, payments } = req.body;
			ticket.userId = req.session!.user.id;

			const results = await Ticket.create({ ...ticket, products, payments }, {
				include: [
					{ model: TicketProduct, as: 'products' },
					{ model: TicketPayment, as: 'payments' }
				]
			});

			const savedTicket = results.get({ plain: true })

			const ticketNumberStr = savedTicket.ticketNumber.toString()
			const ticketNumberPaded = ticketNumberStr.padStart(8, '0')
			savedTicket.ticketNumber = `D-${ticketNumberPaded}`;

			const meta = await Meta.findOne();
			sendToAPI({
				deviceId: meta?.device?.deviceId!,
				path: '/sales',
				data: { ticket: savedTicket },
				reTry: true,
				method: 'POST',
				attemp: 1,
				isNew: true,
				callback: () => { }
			});

			res.status(201).send({
				id: results.id
			});
		} catch (error) {
			res.sendStatus(500);
			throw error;
		}
	},
	getOne: (req: Request, res: Response) => {
		const { ticketNumber } = req.params;

		Ticket.findOne({
			where: { ticketNumber },
			include: [
				{
					model: TicketProduct,
					as: 'products',
					include: [{ model: Product, as: 'product' }]
				}
			]
		})
			.then((ticket) => res.status(200).send(ticket))
			.catch((error) => {
				res.sendStatus(500);
				throw error;
			});
	},
	print: (req: Request, res: Response) => {
		const { id } = req.params;
		printTicket(id);
		res.sendStatus(204);
	}
};
