import { Router } from 'express';
const router: Router = Router();

import { isLoggedIn, checkToken } from '../../middlewares/auth';
import controller from './controller';

router
	.route('/')
	.post(isLoggedIn, checkToken, controller.create)
	.get(isLoggedIn, checkToken, controller.getAll);

router.get(
	'/table',
	isLoggedIn,
	checkToken,
	controller.getAllForTable
);
router.get('/:id', isLoggedIn, checkToken, controller.getOne);

export default router;
