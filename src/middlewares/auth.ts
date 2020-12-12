import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

function checkToken(req: Request, res: Response, next: NextFunction){
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
}

function isLoggedIn(req: Request, res: Response, next: NextFunction){
	if (!req.session!.isLoggedIn) {
		res.status(401).send('Ninguna sesion iniciada');
		return;
	}

	next();
}

function isAdmin(req: Request, res: Response, next: NextFunction){
	if (req.session!.user.role == 'ADMIN') next();
	else
		res.status(403).send(
			'Se requieren privilegios de administrador para continuar.'
		);
}

export { checkToken, isAdmin, isLoggedIn }