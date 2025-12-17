const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  stage: {
    type: String,
    enum: ['IDEA', 'PROTOTYPE', 'MARKET'],
    default: 'IDEA'
  },
  verifiedLevel: {
    type: String,
    enum: ['NONE', 'IDEA', 'PROTOTYPE', 'MARKET'],
    default: 'NONE'
  },

  description: String,
  website: String
}, { timestamps: true });

module.exports = mongoose.model('Startup', startupSchema);
