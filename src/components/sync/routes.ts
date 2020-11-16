import { Router } from 'express'
const router: Router = Router()

import { isLoggedIn, checkToken, isAdmin } from '../../middlewares/auth';
import { sync, getUnsynchronized } from './controller'

router.route('/')
    .get(isLoggedIn, checkToken, isAdmin, getUnsynchronized)
    .post(sync)

export default router