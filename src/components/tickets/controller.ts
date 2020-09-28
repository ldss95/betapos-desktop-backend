import { Request, Response } from 'express';
import axios from 'axios';

import { Ticket, TicketProduct } from './model';
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
	}
};
