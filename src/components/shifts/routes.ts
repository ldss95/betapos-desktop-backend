import { Router } from 'express';
const router: Router = Router();

import { isLoggedIn, checkToken } from '../../middlewares/auth';
import controller from './controller';

router
	.route('/')
	.post(isLoggedIn, checkToken, controller.create)
	.get(isLoggedIn, checkToken, controller.getAll)
	.put(isLoggedIn, checkToken, controller.finishShift);

router.get(
	'/current',
	isLoggedIn,
	checkToken,
	controller.getCurrentShift
);

router.get('/:id', isLoggedIn, checkToken, controller.getOne);

export default router;
