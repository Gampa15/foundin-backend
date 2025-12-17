const User = require('../models/User');
const FraudReport = require('../models/FraudReport');
const { adjustScore } = require('./authenticity.service');
const SCORE = require('../constants/scoreEvents');

const THRESHOLDS = {
  FLAGS_WARNING: 2,
  FLAGS_CRITICAL: 4
};

exports.flagUser = async ({
  userId,
  reason,
  severity = 'LOW',
  source = 'SYSTEM',
  reportedBy = null
}) => {
  const user = await User.findById(userId);
  if (!user) return;

  user.fraudFlags += 1;
  user.lastFraudAt = new Date();
  await user.save();

  await FraudReport.create({
    reportedUser: userId,
    reportedBy,
    reason,
    severity,
    source
  });

  // Immediate penalty
  await adjustScore(userId, SCORE.SPAM_ACTIVITY);

  // Escalation logic
  if (user.fraudFlags >= THRESHOLDS.FLAGS_CRITICAL) {
    await adjustScore(userId, SCORE.FRAUD_CONFIRMED);
    user.isBanned = true;
    await user.save();
  }
};
