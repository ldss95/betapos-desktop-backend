import { Router } from 'express'
const router: Router = Router()

import controller from './controller'
import { isLoggedIn, checkToken } from '../../middlewares/auth'

router.post('/login', controller.login)
router.post('/authorize', isLoggedIn, checkToken, controller.adminAuthorization)
router.post('/logout', isLoggedIn, checkToken, controller.logout)
router.get('/is-logged-in', isLoggedIn, (req, res) => res.sendStatus(200))

export default router