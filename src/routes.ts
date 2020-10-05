import { Router, Request, Response } from 'express';
const router: Router = Router();

import auth from './components/auth/routes';
import products from './components/products/routes';
import shifts from './components/shifts/routes';
import tickets from './components/tickets/routes';
import users from './components/users/routes';
import settings from './components/settings/routes';

router.use('/auth', auth);
router.use('/products', products);
router.use('/shifts', shifts);
router.use('/tickets', tickets);
router.use('/users', users);
router.use('/settings', settings);

router.all('*', (req: Request, res: Response) => res.sendStatus(404));

export default router;
