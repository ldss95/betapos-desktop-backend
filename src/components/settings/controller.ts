import { Request, Response } from 'express';
import axios from 'axios';

import { db } from '../../db/connection';
import { Product } from '../products/model';
import { Barcode } from '../products/model';
import { User } from '../users/model';
import { Meta } from '../meta/model';

let timer: any;

function clearTimer() {
	if (timer)
		clearTimeout(timer)
}

function sendMessageToClient(res: Response, message: string) {
	res.write(message);

	clearTimer()
	timer = setTimeout(() => {
		sendMessageToClient(res, message)
	}, 30 * 1000)
}

export default {
	setShop: async (req: Request, res: Response) => {
		try {
			const { shopId } = req.params;
			const API_URL = process.env.API_URL;

			//Set headers for SSE
			res.setHeader('Cache-Control', 'no-cache');
			res.setHeader('Content-Type', 'text/event-stream');
			res.setHeader('Connection', 'keep-alive');
			res.flushHeaders();

			sendMessageToClient(res, 'data: Limpiando base de datos\n\n')
			await db.query('SET FOREIGN_KEY_CHECKS = 0');
			await db.sync({ force: true, alter: true });
			await db.query('SET FOREIGN_KEY_CHECKS = 1');

			sendMessageToClient(res, 'data: Descargando lista de productos\n\n')
			const productsRes = await axios.get(
				`${API_URL}/products/shop/${shopId}`
			);

			sendMessageToClient(res, 'data: Guardando lista de productos\n\n')
			await Product.bulkCreate(productsRes.data.products);

			res.write('data: Guardando codigos de barras\n\n');
			await Barcode.bulkCreate(productsRes.data.barcodes);

			sendMessageToClient(res, 'data: Descargando lista de usuarios\n\n')
			const usersRes = await axios.get(`${API_URL}/users`);
			sendMessageToClient(res, 'data: Guardando lista de usuarios\n\n')
			await User.bulkCreate(usersRes.data);
			
			sendMessageToClient(res, 'data: Onteniendo ultimo Ticket Number\n\n')
			const ticketRes = await axios.get(`${API_URL}/tickets/last/${shopId}`);
			sendMessageToClient(res, 'data: Guardando ultimo Ticket Number\n\n')
			const { lastTicketNumber } = ticketRes.data
			await Meta.create({ shopId, lastTicketNumber })

			res.write('data: done\n\n');
			res.end();
			clearTimer()	

			res.on('close', () => {
				res.end()
				clearTimer()
			});
		} catch (error) {
			res.write('data: error\n\n');

			clearTimer()
			res.end();
			throw error;
		}
	}
};
