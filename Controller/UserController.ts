import { Router } from 'express'
import adminRoute from './adminController'
import artistRoute from './artistController'
import managerRoute from './managerController'

const router = Router()

router.use(adminRoute);
router.use(artistRoute);
router.use(managerRoute);

export default router