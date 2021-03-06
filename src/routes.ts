import { Router, Request, Response } from 'express';
const router: Router = Router();

import auth from './components/auth/routes';
import products from './components/products/routes';
import shifts from './components/shifts/routes';
import tickets from './components/tickets/routes';
import users from './components/users/routes';
import clients from './components/clients/routes';
import cashFlow from './components/cash-flow/routes';
import sync from './components/sync/routes';
import meta from './components/meta/routes';
import paymentTypes from './components/ticket-payments-types/routes';

router.use('/auth', auth);
router.use('/products', products);
router.use('/shifts', shifts);
router.use('/tickets', tickets);
router.use('/users', users);
router.use('/clients', clients);
router.use('/cash-flow', cashFlow);
router.use('/sync', sync);
router.use('/meta', meta);
router.use('/payment-types', paymentTypes);

router.all('*', (req: Request, res: Response) => res.sendStatus(404));

export default router;
