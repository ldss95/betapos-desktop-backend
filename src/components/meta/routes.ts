import { Router } from 'express'
const router: Router = Router()

import { isLoggedIn, checkToken, isAdmin } from '../../middlewares/auth';
import controller from './controller'

router.route('/')
    .get(isLoggedIn, checkToken, controller.get)
    .put(isLoggedIn, checkToken, isAdmin, controller.update)

export default router