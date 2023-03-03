import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  fileUrl: { type: String, required: true },
  managers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Manager' }],
  approvals: [{
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
    approved: { type: Boolean, required: true },
    comment: { type: String }
  }]
});

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
