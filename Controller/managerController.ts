import { Router } from 'express'
import { Approval } from '../Models/approval';
const Joi = require('joi');  
import { Model, CreateModelSchema, UpdateModelSchema, removeApprovals } from '../Models/Model';
import { User, CreateUserSchema, UpdateUserInfoSchema, removePassword } from '../Models/User';
import { hashPassword } from '../Services/HashService';

const router = Router()

// Middleware pour vérifier si l'utilisateur possede le role "admin" ou "manager"
router.use((req, res, next) => {
  if (!(req.session as any).user || (req.session as any).user.role !== 'admin' || (req.session as any).user.role !== 'manager') {
    return res.status(401).json({ message: "Vous n'avez pas les droits nécessaires pour accéder à cette resource (manager)." });
  }
  next();
});

// Patch/Update des infos de l'artiste
router.patch('/updateInfo', async (req, res) => {

  if ((req.session as any).user.role !== 'manager') {
    return res.status(401).json({ message: "Vous n'avez pas l'autorisation de modifier le profil." });
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


// Rechercher toutes les maquettes
router.get('/models', async (req, res) => {
  const models = await Model.find();
  res.status(200).json(removeApprovals(models.map((model: typeof Model) => removeApprovals(model.toObject()))));
});

// Rechercher toutes les maquettes auquels le manager a participé
router.get('/models', async (req, res) => {
  const models = await Model.find( {approval: { managerId: (req.session as any).user.id }} );
  res.status(200).json(removeApprovals(models.map((model: typeof Model) => removeApprovals(model.toObject()))));
});

// Rechercher toutes les maquettes auquels le manager n'a pas participé
router.get('/models', async (req, res) => {
  const models = await Model.find( {approval: { managerId: !(req.session as any).user.id }} );
  res.status(200).json(removeApprovals(models.map((model: typeof Model) => removeApprovals(model.toObject()))));
});

// Recherche une maquette en fonction de son ID
router.get('/models/:modelId', async (req, res) => {
  const model = await Model.findById(req.params.modelId);
  if (!model) {
    return res.status(404).json({ message: 'Submission not found' });
  }
  res.json(removeApprovals(model.toObject()));
});

// Approuver ou non une maquette en fonction de l'ID de la maquette
router.put('/models/:modelId/approval', async (req, res) => {

  if ((req.session as any).user.role !== 'manager') {
    return res.status(401).json({ message: "Vous n'avez pas l'autorisation d'accepter ou non cette maquette." });
  }

  const model = await Model.findById(req.params.modelId);
  if (!model) {
    return res.status(404).json({ message: 'Maquette introuvable.' });
  }

  const { approval, comment } = req.body;

  if (!approval || approval !== false || approval !== true) {
    return res.status(403).json({ message: "Vous n'avez pas renseigné de valeur correcte pour l'abbrobation." });
  }

  const newApproval = new Approval({
    modelId: model._id,
    artistId: model.artistId,
    managerId: (req.session as any).user.id,
    approval: approval ? 'approved' : 'rejected',
    comment: comment,
  });

  await newApproval.save();

  let nbApproved; 
  let isApproved;
  const manager = await User.find({role: "manager"});
  if (model.approvals.length + 1 == manager.length && model.isApproved !== 'pending') {
    nbApproved = model.approvals.filter((approval: typeof Approval) => approval.approved === 'approved').length;
    isApproved = nbApproved >= (manager.length/2) ? true : false;
    model.isApproved.push(isApproved ? 'approved' : 'rejected');
  }

  model.approvals.push(newApproval._id);
  await model.save();

  res.status(201).json(newApproval);
});

export default router;