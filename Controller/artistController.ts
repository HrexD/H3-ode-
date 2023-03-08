import { Router } from 'express'
const Joi = require('joi');  
import { Model, CreateModelSchema, UpdateModelSchema, removeApprovals } from '../Models/Model';
import { User, CreateUserSchema, UpdateUserInfoSchema, removePassword } from '../Models/User';
import { hashPassword } from '../Services/HashService';

const router = Router()

// Middleware pour vérifier si l'utilisateur possede le role "admin" ou "artist"
router.use((req, res, next) => {
  if (!(req.session as any).user || (req.session as any).user.role !== 'admin' && (req.session as any).user.role !== 'artist') {
    return res.status(401).json({ message: "Vous n'avez pas les droits nécessaires pour accéder à cette resource (artist)." });
  }
  next();
});

// Patch/Update des infos de l'artiste
router.patch('/updateInfo', async (req, res) => {
  
  if ((req.session as any).user.role !== 'artist') {
    return res.status(401).json({ message: "Votre compte ne vous permet pas d'accéder à cette fonctionnalité." });
  }

  const { error } = UpdateUserInfoSchema.validate(req.body);

  if(req.body.password) {
    req.body.password = hashPassword(req.body.password);
  }
  const user = await User.findByIdAndUpdate((req.session as any).user._id, req.body, {new: true});

  if (user == null) {
      return res.status(404).json({ error: `Utilisateur avec l'ID ${(req.session as any).user._id} introuvable.` });
  }
  
  return res
      .status(200)
      .json(removePassword(user.toObject()));
})

// Recherche toute les maquettes d'un artiste
router.get('/models', async (req, res) => {
  const artist = (req.session as any).user
  const models = await Model.find({ artistId: artist._id });
  // console.log((req as any).auth);
  if (models == null) {
    return res.status(200).json({ error: `Artiste avec l'ID ${artist._id} ne possede pas de maquette.` });
  }

  const modelsWithoutApprovals = removeApprovals(models.map((model: typeof Model) => removeApprovals(model.toObject())));

  return res
    .status(200)
    .json(modelsWithoutApprovals);
});

// Création d'une nouvelle maquette pour un artiste 
// + Middleware => Vérification si c'est bien un artiste qui fait la requete de création
router.post('/models', async (req, res) => {
 
  if ((req.session as any).user.role !== 'artist') {
    return res.status(401).json({ message: "Vous n'avez pas l'autorisation de créer une maquette, seulement un artiste peut le faire." });
  }
  
  const { error } = CreateModelSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  
  const artist = (req.session as any).user
  
  if (artist.isBanned !== false) {
    return res.status(401).json({ message: "Vous avez été banni vous ne pouvez plus poster de maquette pour le moment." });
  }

  const model = new Model({
    artistId: artist._id,
    ...req.body,
    approvals: [],
  });
  await model.save();

  const modelWithoutApprovals = removeApprovals(model.toObject());

  return res
    .status(201)
    .json(modelWithoutApprovals)

});

// Recherche d'une maquette par l'id de la maquette
router.get('/models/:modelId', async (req, res) => {
  const artist = (req.session as any).user
  const { modelId } = req.params
  const model = await Model.findOne({ _id: modelId });
  if (!model) return res.status(404).json({ error: `La maquette possedant l'ID ${modelId} est introuvable.` });

  if (model.artistId !== artist._id)
    return res.status(404).json({ error: `Vous ne pouvez pas acceder à une maquette qui n'est pas la votre.` });

  const modelWithoutApprovals = removeApprovals(model.toObject());

  return res
    .status(200)
    .json(modelWithoutApprovals);
});

// Update une maquette par l'ID de la maquette et de l'artiste
router.put('/models/:modelId', async (req, res) => {
  
  const { error } = CreateModelSchema.validate(req.body);

  if ((req.session as any).user.role !== 'artist') {
    return res.status(401).json({ message: "Vous n'avez pas l'autorisation de modifier cette maquette, seulement l'artiste créateur peut le faire." });
  }

  const { modelId } = req.params;
  const model = await Model.findOneAndUpdate(
    { _id: modelId, artistId: (req.session as any).user._id },
    req.body,
    { new: true }
  );
  
  if (!model) {
    return res.status(404).json({ message: `La maquette possedant l'ID ${modelId}  est introuvable.` });
  }

  const modelsWithoutApprovals = removeApprovals(model.toObject());

  return res.status(200).json(modelsWithoutApprovals);
});

// Suppression d'une maquette pour un artiste en fonction d'un ID
router.delete('/models/:modelId', async (req, res) => {
  const { modelId } = req.params;
  const artist = (req.session as any).user;

  const model = await Model.findOneAndDelete({
    _id: modelId, 
    artistId: artist._id
  });
  if (!model) {
    return res.status(404).json({ message: `La maquette possedant l'ID ${modelId} est introuvable.` });
  }
  return res.status(200).json(`La maquette possedant l'ID ${modelId} a été supprimée avec succès.`);
});

export default router;