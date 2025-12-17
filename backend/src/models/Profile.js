const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  fullName: String,
  bio: String,
  skills: [String],
  authenticityScore: { type: Number, default: 50 },
  trustTier: {
    type: String,
    enum: ['BRONZE', 'SILVER', 'GOLD'],
    default: 'BRONZE'
  }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
