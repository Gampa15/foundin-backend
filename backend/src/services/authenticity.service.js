const User = require('../models/User');

const clamp = (value) => Math.max(0, Math.min(100, value));

const calculateTier = (score) => {
  if (score >= 80) return 'PLATINUM';
  if (score >= 60) return 'GOLD';
  if (score >= 40) return 'SILVER';
  return 'BRONZE';
};

exports.adjustScore = async (userId, delta, reason = '') => {
  const user = await User.findById(userId);
  if (!user) return;

  user.authenticityScore = clamp(user.authenticityScore + delta);
  user.trustTier = calculateTier(user.authenticityScore);

  if (delta < 0) {
    user.negativeFlags += 1;
  }

  await user.save();
};
