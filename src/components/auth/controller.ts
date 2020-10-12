import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { User } from '../users/model';

export default {
	login: (req: Request, res: Response) => {
		const { nickName, password } = req.body;

		User.findOne({
			raw: true,
			attributes: ['id', 'name', 'password', 'role', 'isActive'],
			where: { nickName }
		})
			.then((user: any) => {
				if (!user) {
					res.status(401).send({
						error: 'Nick',
						message: 'El usuario ingresao no existe.'
					});
					return;
				}

				if (!user.isActive) {
					res.status(401).send({
						error: 'User',
						message: `El usuario ${nickName} ha sido desabilitado por la administracion.`
					});
					return;
				}

				if (!bcrypt.compareSync(password, user.password!)) {
					res.status(401).send({
						error: 'Password',
						message: 'Contraseña incorrecta.'
					});
					return;
				}

				delete user.password;

				const payload = {
					iss: '20&10-Caja',
					aud: 'web',
					iat: new Date().getTime() / 1000,
					user: [user.id, user.name, user.nickName, user.role]
				};

				const token = jwt.sign(payload, `${process.env.SECRET_TOKEN}`, {
					expiresIn: '24h'
				});
				req.session!.user = { ...user, token };
				res.status(200).send({
					isLoggedIn: true,
					token: token,
					nickName,
					name: user.name,
					role: user.role,
					phone: user.phone,
					dui: user.dui,
					id: user.id
				});
			})
			.catch((error) => {
				res.sendStatus(500);
				throw error;
			});
	},
	logout: (req: Request, res: Response) => {
		req.session!.destroy((error) => {
			if (error) {
				res.sendStatus(500);
				throw error;
			}

			res.sendStatus(200);
		});
	},
	verifyToken: (req: Request, res: Response, next: NextFunction) => {
		const bearerHeader = req.headers.authorization;

		if (!bearerHeader) {
			res.status(403).send('No se encontro el token');
			return;
		}

		const bearer = bearerHeader.split(' ');
		const token = bearer[1];
		jwt.verify(token, `${process.env.SECRET_TOKEN}`, (error) => {
			if (error) res.status(403).send('Token invalido');
			else next();
		});
	},
	isLoggedIn: (req: Request, res: Response, next: NextFunction) => {
		if (!req.session!.user) {
			res.status(401).send('Ninguna sesion iniciada');
			return;
		}

		next();
	},
	isAdmin: (req: Request, res: Response, next: NextFunction) => {
		if (req.session!.user.role == 'ADMIN') next();
		else
			res.status(403).send(
				'Se requieren privilegios de administrador para continuar.'
			);
	}
};
