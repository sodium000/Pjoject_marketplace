

const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  file_path: {
    type: String,
    required: true,
  },
  original_filename: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending_review', 'accepted', 'rejected'],
    default: 'pending_review',
  },
  review_notes: {
    type: String,
    trim: true,
  },
  submitted_at: {
    type: Date,
    default: Date.now,
  },
  reviewed_at: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});


submissionSchema.index({ task_id: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
