import { Router } from 'express';
const router: Router = Router();

import { isLoggedIn, checkToken } from '../../middlewares/auth';
import controller from './controller';

router.route('/').post(isLoggedIn, checkToken, controller.create);

router.get(
	'/:ticketNumber',
	isLoggedIn,
	checkToken,
	controller.getOne
);

export default router;
