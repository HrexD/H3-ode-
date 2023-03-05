import { Router } from 'express'
import adminRoute from '../Auth/AuthController'
import artistRoute from './artistController'
import managerRoute from './managerController'

const router = Router()

// Middleware pour vérifier si l'utilisateur est authentifié
router.use((req, res, next) => {
    if (!(req.session as any).user || !(req.session as any).user.id) {
      return res.status(401).json({ message: "Vous devez vous connecter pour accéder à cette ressource." });
    }
    next();
});

router.use(adminRoute);
router.use(artistRoute);
router.use(managerRoute);

export default router