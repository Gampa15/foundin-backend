module.exports = {
  RAPID_AD_SUBMISSIONS: {
    limit: 3,
    windowMinutes: 10,
    reason: 'Multiple ad submissions in short time',
    severity: 'MEDIUM'
  },
  MESSAGE_SPAM: {
    limit: 10,
    windowMinutes: 5,
    reason: 'Spam messaging detected',
    severity: 'LOW'
  },
  FAKE_CLAIMS: {
    reason: 'Unverified or misleading claims',
    severity: 'HIGH'
  }
};
