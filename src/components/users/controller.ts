import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { ValidationError } from 'sequelize';

import { User } from './model';
import { listen } from './updates_listener'

listen()

export default {
	update: (req: Request, res: Response) => {
		const { id } = req.session!.user;
		const user = req.body;
		if (user.password) user.password = bcrypt.hashSync(user.password, 13);

		User.update(user, { where: { id } })
			.then(() => res.sendStatus(204))
			.catch((error) => {
				if (error instanceof ValidationError) {
					res.status(400).send('Cedula Invalida');
					return;
				}
				res.sendStatus(500);
				throw error;
			});
	}
};
