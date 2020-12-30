import { Request, Response } from 'express';
import { Op } from 'sequelize';

import { Product, Barcode } from './model';
import { db } from '../../db/connection';

export default {
	create: (req: Request, res: Response) => {},
	getAll: (req: Request, res: Response) => {
		Product.findAll({
			include: { model: Barcode, as: 'barcodes' }
		})
			.then((products) => res.status(200).send(products))
			.catch((error) => {
				res.sendStatus(500);
				throw error;
			});
	},
	getAllForTable: (req: Request, res: Response) => {
		const pagination = JSON.parse(`${req.query.pagination}`);
		const { price, search } = JSON.parse(`${req.query.filters}`);

		let where;
		if (search || price) {
			const and: any = [];
			if (price) {
				and.push({ price });
			}

			if (search) {
				and.push({
					[Op.or]: [
						{
							name: {
								[Op.like]: `%${search}%`
							}
						},
						{ id: search }
					]
				});
			}

			where = {
				[Op.and]: and
			};
		}

		Product.findAndCountAll({
			include: { model: Barcode, as: 'barcodes' },
			limit: pagination.pageSize,
			offset: (pagination.current - 1) * pagination.pageSize,
			where
		})
			.then((results) => {
				res.status(200).send({
					products: results.rows,
					pagination: { ...pagination, total: results.count }
				});
			})
			.catch((error) => {
				res.sendStatus(500);
				throw error;
			});
	},
	find: (req: Request, res: Response) => {
		const { id } = req.params;

		const query = `SELECT
				p.*,
				b.barcode
			FROM
				Products p
			INNER JOIN
				Barcodes b ON b.productId = p.id
			WHERE
				(p.id = ? AND ? REGEXP '^[0-9]+$') OR
				p.reference = ? OR 
				b.barcode = ?
			GROUP BY p.id`;

		db
			?.query(query, { type: 'SELECT', replacements: [ id, id, id, id ] })
			.then((products) => res.status(200).send(products))
			.catch((error) => {
				res.sendStatus(500);
				throw error;
			});
	}
};
