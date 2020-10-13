import { Router } from 'express'
const router: Router = Router()

import auth from '../auth/controller'
import { sync, getUnsynchronized } from './controller'

router.route('/')
    .get(auth.isLoggedIn, auth.verifyToken, auth.isAdmin, getUnsynchronized)
    .post(sync)

export default router