

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  status: {
    type: String,
    enum: ['open', 'assigned', 'completed', 'cancelled'],
    default: 'open',
  },
  assigned_solver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});


projectSchema.index({ buyer_id: 1 });
projectSchema.index({ assigned_solver_id: 1 });
projectSchema.index({ status: 1 });

module.exports = mongoose.model('Project', projectSchema);
