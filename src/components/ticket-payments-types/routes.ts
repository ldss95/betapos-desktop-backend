import { Router } from 'express'
const routes: Router = Router()

import controller from './controller'
import { isLoggedIn,checkToken } from '../../middlewares/auth'

routes.route('/').get(isLoggedIn, checkToken, controller.getAll)

export default routes
