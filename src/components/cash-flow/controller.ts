import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

import { CashFlow } from './model';
import { User } from '../users/model';

export default {
	create: async (req: Request, res: Response) => {
		try {
			const { id } = req.session!.user;
			const { amount, description, password, type, shiftId } = req.body;
			const user = await User.findOne({ where: { id } });

			if (!bcrypt.compareSync(password, `${user?.password}`)) {
				res.status(400).send('Contraseña incorrecta.');
				return;
			}

			const cashFlow = { userId: id, amount, description, type, shiftId };
			await CashFlow.create(cashFlow);
			res.sendStatus(204);
		} catch (error) {
			res.sendStatus(500);
			throw error;
		}
	}
};
