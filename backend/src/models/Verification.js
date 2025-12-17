const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup'
  },
  level: {
    type: String,
    enum: ['IDEA', 'PROTOTYPE', 'MARKET'],
    required: true
  },
  documents: [String],
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  remarks: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Verification', verificationSchema);
