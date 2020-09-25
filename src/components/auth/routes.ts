import { Router } from 'express'
const router: Router = Router()

import controller from './controller'

router.post('/login', controller.login)
router.post('/logout', controller.isLoggedIn, controller.verifyToken, controller.logout)
router.get('/is-logged-in', controller.isLoggedIn, (req, res) => res.sendStatus(200))

export default router