import { Router } from 'express'
const router: Router = Router()

import controller from './controller'

router.get('/', controller.getAll)

export default router