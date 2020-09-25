import { Router } from 'express'
const router: Router = Router()

import controller from './controller'

router.get('/shop/:shopId', controller.setShop)

export default router