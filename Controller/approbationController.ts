import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema({
  managerId: { type: mongoose.Types.ObjectId, required: true },
  maquetteId: { type: mongoose.Types.ObjectId, required: true },
  isPositive: { type: Boolean, required: true },
  comment: { type: String },
});

const Approval = mongoose.model('Approval', approvalSchema);

export default Approval;
