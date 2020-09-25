import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';

import { Product } from './model';
import { sequelize } from '../../lib/connection';

export default {
	create: (req: Request, res: Response) => {},
	getAll: (req: Request, res: Response) => {
		Product.findAll()
			.then((products) => res.status(200).send(products))
			.catch((error) => {
				res.sendStatus(500);
				throw error;
			});
	},
	getOne: (req: Request, res: Response) => {
		const { id } = req.params;

		const query = `SELECT
				p.*,
				b.barcode
			FROM
				products p
			INNER JOIN
				barcodes b ON b.productId = p.id
			WHERE
				p.id = '${id}' OR
				p.reference = '${id}' OR 
				b.barcode = '${id}'
			LIMIT 1`;

		sequelize
			?.query(query, { plain: true })
			.then((product) => res.status(200).send(product))
			.catch((error) => {
				res.sendStatus(500);
				throw error;
			});
	}
};
