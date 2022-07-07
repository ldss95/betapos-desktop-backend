import { Router } from 'express';
const router: Router = Router();

import { isLoggedIn, checkToken } from '../../middlewares/auth';
import controller from './controller';

router.route('/')
	.post(isLoggedIn, checkToken, controller.create)
	.get(isLoggedIn, checkToken, controller.getAll4Shift);

router.post('/print/:id', isLoggedIn, checkToken, controller.print)

router.get(
	'/by-id/:id',
	isLoggedIn,
	checkToken,
	controller.getOne
);

router.get(
	'/:ticketNumber',
	isLoggedIn,
	checkToken,
	controller.getOne
);

export default router;
