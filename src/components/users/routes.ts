import { Router } from 'express';
const router: Router = Router();

import controller from './controller';

router.route('/').put(controller.update);

export default router;
