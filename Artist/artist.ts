import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  registrationDate: { type: Date, default: Date.now },
  isBanned: { type: Boolean, default: false },
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }]
});

const Artist = mongoose.model('Artist', artistSchema);

export default Artist;
