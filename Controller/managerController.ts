import { Router } from 'express'
const Joi = require('joi');  
import { Model, CreateModelSchema, UpdateModelSchema, removeApprovals } from '../Models/Model';
import { User, CreateUserSchema, UpdateUserInfoSchema, removePassword } from '../Models/User';
import { Approval, CreateApprovalSchema } from '../models/approval';
import { hashPassword } from '../Services/HashService';

const router = Router()

// Middleware pour vérifier si l'utilisateur possede le role "admin" ou "manager"
router.use((req, res, next) => {
  if (!(req.session as any).user || (req.session as any).user.role !== 'admin' && (req.session as any).user.role !== 'manager') {
    return res.status(401).json({ message: "Vous n'avez pas les droits nécessaires pour accéder à cette resource (manager)." });
  }
  next();
});

// Patch/Update des infos du manager
router.patch('/updateInfo', async (req, res) => {

  if ((req.session as any).user.role !== 'manager') {
    return res.status(401).json({ message: "Votre compte ne vous permet pas d'accéder à cette fonctionnalité." });
  }

  const { error } = UpdateUserInfoSchema.validate(req.body);

  if(req.body.password) {
    req.body.password = hashPassword(req.body.password);
  }
  const manager = await User.findByIdAndUpdate((req.session as any).user._id, req.body, {new: true});

  if (manager == null) {
      return res.status(404).json({ error: `Utilisateur avec l'ID ${(req.session as any).user._id} introuvable.` });
  }
  
  return res
      .status(200)
      .json(removePassword(manager.toObject()));
})


// Rechercher toutes les maquettes
router.get('/models', async (req, res) => {
  const models = await Model.find();
  res.status(200).json(removeApprovals(models.map((model: typeof Model) => removeApprovals(model.toObject()))));
});

// Approuver ou non une maquette en fonction de l'ID de la maquette
router.put('/models/approval/:modelId', async (req, res) => {

  if ((req.session as any).user.role !== 'manager') {
    return res.status(401).json({ message: "Vous n'avez pas l'autorisation d'accepter ou non cette maquette." });
  }

  const { error } = CreateApprovalSchema.validate(req.body);
  
  const { modelId } = req.params
  const { approved, comment } = req.body;
  const manager = (req.session as any).user

  const model = await Model.findById(modelId);
  if (!model) {
    return res.status(404).json({ message: 'Maquette introuvable.' });
  }
  
  if (approved !== false && approved !== true) {
    return res.status(403).json({ message: "Vous n'avez pas renseigné de valeur correcte pour l'approbation." });
  }
  
  const approvals = await Approval.find({modelId: model._id})
  const hasParticipated = approvals.filter((approval: typeof Approval) => approval.managerId === manager._id);
  
  if (hasParticipated.length > 0) {
    return res.status(404).json({ message: 'Vous avez déja voté, vous ne pouvez pas le faire une nouvelle fois.' });
  }
  
  const newApproval = new Approval({
    modelId: model._id,
    artistId: model.artistId,
    managerId: manager._id,
    approved: approved ? 'approved' : 'rejected',
    comment: comment,
  });

  await newApproval.save();

  let nbApproved; 
  let isApproved;
  const managers = await User.find({role: "manager"});
  
  if (model.approvals.length + 1 == managers.length && model.isApproved === 'pending') {
    nbApproved = approvals.filter((approval: typeof Approval) => approval.approved === 'approved').length;
    isApproved = nbApproved >= (managers.length/2) ? true : false;
    model.isApproved = isApproved ? 'approved' : 'rejected';
  }

  model.approvals.push(newApproval);
  await model.save();

  res.status(201).json(newApproval);
});

export default router;