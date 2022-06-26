import { Router } from 'express'
const routes: Router = Router()

import { isLoggedIn } from '../../middlewares/auth'
import controller from './controller'

routes
	.route('/')
	.get(isLoggedIn, controller.getAll)

export default routes
