import { Router } from 'express';
const router: Router = Router();

import auth from '../auth/controller';
import controller from './controller';

router
	.route('/')
	.post(auth.isLoggedIn, auth.verifyToken, controller.create)
	.get(auth.isLoggedIn, auth.verifyToken, controller.getAll);

router.get(
	'/current',
	auth.isLoggedIn,
	auth.verifyToken,
	controller.getCurrentShift
);

export default router;
