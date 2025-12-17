const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  website: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rejectionReason: String
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);
