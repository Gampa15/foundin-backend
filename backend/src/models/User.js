const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

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

    /* -------- TRUST & AUTHENTICITY -------- */
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

    lastFraudAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

/* -------- INDEXES -------- */
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

module.exports = mongoose.model('User', userSchema);
