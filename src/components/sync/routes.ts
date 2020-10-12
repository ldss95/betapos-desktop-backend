import { Router } from 'express'
const router: Router = Router()

import { sync } from './controller'

router.route('/').post(sync)

export default router