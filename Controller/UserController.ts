import { Router } from 'express'
import adminRoute from './adminController'
import artistRoute from './artistController'
import managerRoute from './managerController'
import { User, removePassword, CreateUserSchema } from '../Models/User'
import { hashPassword } from '../Services/HashService'
import { verifyUniqueUser } from '../Services/VerifyUniqueUserService'

const router = Router()
const routeAdmin = "/admin"
const routeArtist = "/artist"
const routeManager = "/manager"


// Enregistrer un nouvel artiste
router.post('/register', async (req, res) => {
    const { error } = CreateUserSchema.validate(req.body);
    const role = "artist";

    if (error) return res.status(400).json({error : error.details[0].message });

    // to remove after test
    // if (req.body.role !== 'artist') return res.status(404).json({error : `Vous ne pouvez pas créer autre chose qu'un artiste.` });
  
    if (!await verifyUniqueUser(req.body.userName, req.body.email)) {
        return res.status(400).json({ error: 'Utilisateur déja existant.' });
    }
  
    const user = new User({
      ...req.body,
      password: hashPassword(req.body.password),
      role: role
    });
    await user.save();
  
    return res
      .status(201)
      .json(removePassword(user.toObject()));
   
  });

  // Middleware pour vérifier si l'utilisateur est authentifié
    router.use((req, res, next) => {
    
    if (!(req.session as any).user || !(req.session as any).user._id) {
      return res.status(401).json({ message: "Vous devez vous connecter pour accéder à cette ressource." });
    }
    next();
    });

router.use(routeAdmin, adminRoute);
router.use(routeArtist, artistRoute);
router.use(routeManager, managerRoute);

export default router