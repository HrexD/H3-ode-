import { Router } from 'express'
const Joi = require('joi');  
import { Model, CreateModelSchema, UpdateModelSchema, removeApprovals } from '../Models/Model';
import { User, CreateUserSchema, UpdateUserInfoSchema, removePassword } from '../Models/User';
import { hashPassword } from '../Services/HashService';

const router = Router()
const routeArtist = "/artist"

// Middleware pour vérifier si l'utilisateur possede le role "admin" ou "artist"
router.use((req, res, next) => {
  if (!(req.session as any).user || (req.session as any).user.role !== 'admin' || (req.session as any).user.role !== 'artist') {
    return res.status(401).json({ message: "Vous n'avez pas les droits nécessaires pour accéder à cette resource." });
  }
  next();
});

// Enregistrer un nouvel artiste
router.post(routeArtist + '/register', async (req, res) => {
  const { error } = CreateUserSchema.validate(req.body);
  if (error) return res.status(400).json({error : error.details[0].message });

  if (req.body.role !== 'artist') return res.status(404).json({error : `Vous ne pouvez pas créer autre chose qu'un artiste.` });

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

// Patch/Update des infos de l'artiste
router.patch(routeArtist +'/updateInfo', async (req, res) => {

  if ((req.session as any).user.role !== 'artist') {
    return res.status(401).json({ message: "Vous n'avez pas l'autorisation de modifier le profil." });
  }

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

// Recherche toute les maquettes d'un artiste
router.get(routeArtist + '/:id/models', async (req, res) => {
  const models = await Model.find({ artist: req.params.id });
  console.log((req as any).auth);
  if (models == null) {
    return res.status(404).json({ error: `Artiste avec l'ID ${req.params.id} ne possede pas de maquette.` });
  }

  const modelsWithoutApprovals = removeApprovals(models.map((model: typeof Model) => removeApprovals(model.toObject())));

  return res
    .status(200)
    .json(modelsWithoutApprovals);
});


// Recherche d'une maquette par l'id de l'artiste et de l'id de la maquette
router.get(routeArtist + '/:id/models/:modelId', async (req, res) => {
  const model = await Model.findOne({ _id: req.params.modelId, artist: { id: req.params.id } });
  if (!model) return res.status(404).json({ error: `La maquette possedant l'ID ${req.params.modelId} avec l'artiste possedant l'ID ${req.params.id} est introuvable.` });

  const modelsWithoutApprovals = removeApprovals(model.map((model: typeof Model) => removeApprovals(model.toObject())));

  return res
    .status(200)
    .json(modelsWithoutApprovals);
});

// Création d'une nouvelle maquette pour un artiste 
// + Middleware => Vérification si c'est bien un artiste qui fait la requete de création
router.post(routeArtist + '/:id/models', async (req, res) => {
 
  if ((req.session as any).user.role !== 'artist') {
    return res.status(401).json({ message: "Vous n'avez pas l'autorisation de créer une maquette, seulement un artiste peut le faire." });
  }
  
  const { error } = CreateModelSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send(`Artiste avec l'ID ${req.params.id} introuvable.`);
  
  if ((req.session as any).user.isBanned !== false) {
    return res.status(401).json({ message: "Vous avez été banni vous ne pouvez plus poster de maquette pour le moment." });
  }

  const model = new Model({
    ...req.body,
    artist: {
      ...user
    },
    approvals: [],
  });
  await model.save();

  const modelsWithoutApprovals = removeApprovals(model.map((model: typeof Model) => removeApprovals(model.toObject())));

  return res
    .status(201)
    .json(modelsWithoutApprovals)

});

// Update une maquette par l'ID de la maquette et de l'artiste
router.put(routeArtist + '/:id/models/:modelId', async (req, res) => {
  
  const { error } = CreateModelSchema.validate(req.body);

  const { id, modelId } = req.params;
  const model = await Model.findOneAndUpdate(
    { _id: modelId, artist: { id: id } },
    req.body,
    { new: true }
  );
  if (!model) {
    return res.status(404).json({ message: `La maquette possedant l'ID ${req.params.modelId} avec l'artiste possedant l'ID ${req.params.id} est introuvable.` });
  }

  const modelsWithoutApprovals = removeApprovals(model.map((model: typeof Model) => removeApprovals(model.toObject())));

  return res.status(200).json(modelsWithoutApprovals);
});

// Suppression d'une maquette pour un artiste en fonction d'un ID
router.delete(routeArtist + '/:id/models/:modelId', async (req, res) => {
  const { id, modelId } = req.params;
  const model = await Model.findOneAndDelete({
    _id: modelId,
    artistId: id,
  });
  if (!model) {
    return res.status(404).json({ message: `La maquette possedant l'ID ${req.params.modelId} avec l'artiste possedant l'ID ${req.params.id} est introuvable.` });
  }
  return res.status(204).json(`La maquette possedant l'ID ${req.params.modelId} avec l'artiste possedant l'ID ${req.params.id} a été supprimée avec succès.`);
});

export default router;