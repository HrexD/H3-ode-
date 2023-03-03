import mongoose from 'mongoose';

const managerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
});

const Manager = mongoose.model('Manager', managerSchema);

export default Manager;
