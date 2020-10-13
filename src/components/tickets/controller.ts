import { Request, Response } from 'express';

import { Product } from '../products/model';
import { Ticket } from './model';
import { TicketProduct } from '../ticket-product/model';
import { sendToAPI } from '../sync/controller'

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { ticket, products, shop } = req.body;
			ticket.userId = req.session!.user.id;

			const results = await Ticket.create({
				...ticket,
				TicketProducts: products
			}, {
				include: [TicketProduct],
				
			});

			const savedTicket = results.get({ plain: true })
			const prefix = 'D-' + shop.prefix
			const ticketNumberStr = savedTicket.ticketNumber.toString()
			const ticketNumberPaded = ticketNumberStr.padStart(8, '0')
			savedTicket.ticketNumber = `${prefix}-${ticketNumberPaded}`;
			savedTicket.shopId = shop.id

			sendToAPI({
				path: '/tickets', data: { ticket: savedTicket },
				reTry: true,
				attemp: 1,
				isNew: true,
				callback: () => {}
			});
			
			res.sendStatus(201);
		} catch (error) {
			res.sendStatus(500);
			throw error;
		}
	},
	getOne: async (req: Request, res: Response) => {
		const { ticketNumber } = req.params;

		Ticket.findOne({
			where: { ticketNumber },
			include: [
				{
					model: TicketProduct,
					include: [Product]
				}
			]
		})
			.then((ticket) => res.status(200).send(ticket))
			.catch((error) => {
				res.sendStatus(500);
				throw error;
			});
	}
};
