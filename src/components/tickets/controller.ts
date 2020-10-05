import { Request, Response } from 'express';
import axios from 'axios';
import http from 'http';

import { Product } from '../products/model';
import { Ticket } from './model';
import { TicketProduct } from '../ticket-product/model';
const API_URL = process.env.API_URL;

function sendToAPI(ticket: any, shop: any) {
	ticket = JSON.parse(JSON.stringify(ticket));

	ticket.ticketNumber = `D-${
		shop.prefix
	}-${ticket.ticketNumber.toString().padStart(8, '0')}`;
	ticket.shopId = shop.id;
	const strTicket = JSON.stringify({ ticket });

	const options = {
		hostname: 'localhost',
		port: 4012,
		path: '/tickets',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	};

	const req = http.request(options, (res) => {
		console.log(`statusCode: ${res.statusCode}`);

		res.on('data', (d) => {
			process.stdout.write(d);
		});
	});

	req.on('error', (error) => {
		console.error(error);
	});

	req.write(strTicket);
	req.end();
}

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { ticket, products, shop } = req.body;
			ticket.userId = req.session!.user.id;

			const savedTicket = await Ticket.create(
				{ ...ticket, TicketProducts: products },
				{ include: [TicketProduct], raw: true }
			);
			sendToAPI(savedTicket, shop);
			res.sendStatus(201);
		} catch (error) {
			res.sendStatus(500);
			throw error;
		}
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
