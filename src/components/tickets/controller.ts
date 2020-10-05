import { Request, Response } from 'express';
import axios from 'axios';

import { Product } from '../products/model';
import { Ticket } from './model';
import { TicketProduct } from '../ticket-product/model';
const API_URL = process.env.API_URL;

export default {
	create: (req: Request, res: Response) => {
		const { ticket, products } = req.body;
		ticket.userId = req.session!.user.id;

		Ticket.create(
			{ ...ticket, TicketProducts: products },
			{ include: [TicketProduct], raw: true }
		)
			.then((results) => {
				res.sendStatus(201);
				//axios.post(API_URL + '/')
			})
			.catch((error) => {
				res.sendStatus(500);
				throw error;
			});
	},
	getOne: async (req: Request, res: Response) => {
		try {
			const { ticketNumber } = req.params;

			const ticket = await Ticket.findOne({
				raw: true,
				where: { ticketNumber }
			});

			if (!ticket) {
				res.sendStatus(204);
				return;
			}

			ticket.TicketProducts = await TicketProduct.findAll({
				where: { ticketId: ticket!.id },
				include: [Product]
			});

			res.status(200).send(ticket);
		} catch (error) {
			res.sendStatus(500);
			throw error;
		}
	}
};
