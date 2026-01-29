

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  deadline: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'submitted', 'completed', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

taskSchema.index({ project_id: 1 });

module.exports = mongoose.model('Task', taskSchema);
