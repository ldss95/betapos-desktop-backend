import { Router } from 'express'
const router: Router = Router()

import auth from '../auth/controller'
import controller from './controller'

router.route('/')
    .get(auth.isLoggedIn, auth.verifyToken, controller.get)
    .put(auth.isLoggedIn, auth.verifyToken, auth.isAdmin, controller.update)

export default router