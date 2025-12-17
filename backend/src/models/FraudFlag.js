const mongoose = require('mongoose');

const fraudFlagSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: String,
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'LOW'
  },
  actionTaken: String
}, { timestamps: true });

module.exports = mongoose.model('FraudFlag', fraudFlagSchema);
