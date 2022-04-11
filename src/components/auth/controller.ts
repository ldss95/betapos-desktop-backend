import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy'

import { User } from '../users/model';
import { Meta } from '../meta/model'

export default {
	login: async (req: Request, res: Response) => {
		try {
			const { nickName, password } = req.body;

			const results = await User.findOne({
				attributes: ['id', 'name', 'password', 'role', 'isActive', 'tfa', 'tfaCode'],
				where: { nickName }
			})

			
			if (!results) {
				res.status(401).send({
					error: 'Nick',
					message: 'El usuario ingresao no existe.'
				});
				return;
			}
			
			
			const user = results.get({ plain: true })
			if (!user.isActive) {
				res.status(401).send({
					error: 'Nick',
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

			const isLoggedIn = !user.tfa
			req.session!.isLoggedIn = isLoggedIn
			req.session!.user = { ...user, token }

			const meta = await Meta.findOne()
			req.session!.shopId = meta?.shopId

			res.status(200).send({
				isLoggedIn,
				tfa: user.tfa,
				token: token,
				nickName,
				name: user.name,
				role: user.role,
				phone: user.phone,
				dui: user.dui,
				id: user.id
			});
		} catch (error) {
			res.sendStatus(500);
			throw error;
		}
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
	adminAuthorization: (req: Request, res: Response) => {
		const { nickName, password, token } = req.body;

		User.findOne({
			raw: true,
			attributes: ['id', 'name', 'password', 'role', 'isActive', 'tfa', 'tfaCode'],
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
						error: 'Nick',
						message: `El usuario ${nickName} ha sido desabilitado por la administracion.`
					});
					return;
				}

				if (password && !bcrypt.compareSync(password, user.password!)) {
					res.status(401).send({
						error: 'Password',
						message: 'Contraseña incorrecta.'
					});
					return;
				}

				if (user.role != 'ADMIN') {
					return res.sendStatus(403)
				}

				const tokenIsValid = speakeasy.totp.verify({
					secret: user.tfaCode,
					encoding: 'base32',
					token
				})

				if (!tokenIsValid) {
					res.status(401).send({
						error: 'Token',
						message: 'Token Invalido.'
					})
					return
				}

				res.sendStatus(204)
			})
			.catch((error) => {
				res.sendStatus(500);
				throw error;
			});
	},
	tfaAuthetication: (req: Request, res: Response) => {
		const { token } = req.body
		const isValid = speakeasy.totp.verify({
			secret: req.session!.user.tfaCode,
			encoding: 'base32',
			token
		})

		if (isValid)
			req.session!.isLoggedIn = true
		
		res.status(200).send({ isValid })
	}
};
