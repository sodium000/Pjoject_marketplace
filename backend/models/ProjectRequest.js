

const mongoose = require('mongoose');

const projectRequestSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  solver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

projectRequestSchema.index({ project_id: 1, solver_id: 1 }, { unique: true });
projectRequestSchema.index({ project_id: 1 });
projectRequestSchema.index({ solver_id: 1 });

module.exports = mongoose.model('ProjectRequest', projectRequestSchema);
