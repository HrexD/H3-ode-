import { Router } from 'express'
import { Model } from '../Models/Model';
import { User, CreateUserSchema, UpdateArtistSchema, removePassword, UpdateUserInfoSchema, UpdateArtistbannedSchema } from '../Models/User'
import { hashPassword } from '../Services/HashService';

const router = Router()
const routeAdmin = "/admin"

// Middleware pour vérifier si l'utilisateur possede le role "admin"
router.use((req, res, next) => {
  if (!(req.session as any).user || (req.session as any).user.role !== 'admin') {
    return res.status(401).json({ message: "Vous n'avez pas les droits nécessaires pour accéder à cette resource." });
  }
  next();
});

// Affiche tout les utlisateurs (sans exceptions et sans leur mot de passe)
router.get(routeAdmin + '/users', async (req, res) => {
    const users = await User.find();
    console.log((req as any).auth);
    return res
        .status(200)
        .json(removePassword(users.map((user) => removePassword(user.toObject()))));
})

// Création d'un manager
router.post(routeAdmin + '/addManager', async (req, res) => {
  const { error } = CreateUserSchema.validate(req.body);
  if (error) return res.status(400).json({error : error.details[0].message });

  if (req.body.role !== 'manager') return res.status(404).json({error : `Vous ne pouvez pas créer autre chose qu'un manager.` });

  const isUserAlreadyExist = await User.findOne({ email: req.body.email, userName: req.body.username });
  if (isUserAlreadyExist) return res.status(400).json({ error: 'Utilisateur déja existant.' });

  const user = new User({
    ...req.body,
    password: hashPassword(req.body.password),
  });
  await user.save();

  return res
    .status(201)
    .json(removePassword(user.toObject()));
 
});

// Recherche d'un utilisateur par son id
router.get(routeAdmin +'/users/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user == null) {
        return res.status(404).json({ error: `Utilisateur avec l'ID ${req.params.id} introuvable.` });
    }
    return res
        .status(200)
        .json(removePassword(user.toObject()));
})

// Patch/Update des infos de l'admin
router.patch(routeAdmin +'/updateInfo', async (req, res) => {

    const { error } = UpdateUserInfoSchema.validate(req.body);

    if(req.body.password) {
      req.body.password = hashPassword(req.body.password);
    }
    const user = await User.findByIdAndUpdate((req.session as any).user.id, req.body, {new: true});

    if (user == null) {
        return res.status(404).json({ error: `Utilisateur avec l'ID ${req.params.id} introuvable.` });
    }
    
    return res
        .status(200)
        .json(removePassword(user.toObject()));
})

// Update d'un artist => banir un artiste
router.put(routeAdmin +'/users/:id', async (req, res) => {

  const { error } = UpdateArtistbannedSchema.validate(req.body);

  const user = await User.findById(req.params.id);

  if (user == null) {
      return res.status(404).json({ error: `Utilisateur avec l'ID ${req.params.id} introuvable.` });
  }

  if (user.role !== 'artist') {
    return res.status(401).json({ message: "Vous ne pouvez pas banir quelqu'un qui n'est pas un artiste." });
  }

  user.set(req.body);
  await user.save();
 
  return res
      .status(200)
      .json(removePassword(user.toObject()));
})

// Suppression d'un utilisateur par son id
router.delete(routeAdmin +'/users/:id', async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user == null) {
        return res.status(404).json({ error: `Utilisateur avec l'ID ${req.params.id} introuvable.` });
    }

    if(parseInt(req.params.id) === 1) {
      return res.status(404).json({ error: `Vous ne pouvez pas vous supprimer vous même.` });
    }

    return res
        .status(204)
        .json(`Utilisateur avec l'ID ${req.params.id} supprimé avec succès.`);
})


// Rechercher toutes les maquettes avec toutes les appobations disponibles
router.get(routeAdmin + '/models', async (req, res) => {
  const models = await Model.find();
  res.status(200).json(models);
});

export default router