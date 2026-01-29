
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'buyer', 'problem_solver'],
    default: 'problem_solver',
  },
  profile_info: {
    type: Object,
    default: {},
  },
}, {
  timestamps: true, 
});


userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
