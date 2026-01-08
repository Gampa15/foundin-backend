const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['FOUNDER', 'INVESTOR', 'MENTOR', 'PROFESSIONAL'],
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
  },
  { timestamps: true }
);

// explicit indexes (ONLY ONCE)
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
