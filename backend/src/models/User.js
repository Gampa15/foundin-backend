const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['FOUNDER', 'INVESTOR', 'MENTOR', 'PROFESSIONAL', 'ADMIN'],
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'DELETED'],
    default: 'ACTIVE'
  },
  authenticityScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  trustTier: {
    type: String,
    enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'],
    default: 'BRONZE'
  },
  negativeFlags: {
    type: Number,
    default: 0
  },
  fraudFlags: {
    type: Number,
    default: 0
  },
  lastFraudAt: Date


}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
