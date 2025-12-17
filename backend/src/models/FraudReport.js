const mongoose = require('mongoose');

const fraudReportSchema = new mongoose.Schema({
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // null = system
  },
  reason: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['SYSTEM', 'USER'],
    default: 'SYSTEM'
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'LOW'
  },
  resolved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('FraudReport', fraudReportSchema);
