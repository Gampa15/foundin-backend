const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportedIdea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['OPEN', 'REVIEWED', 'DISMISSED'],
    default: 'OPEN'
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
