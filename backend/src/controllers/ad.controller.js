const Ad = require('../models/Ad');
const { flagUser } = require('../services/fraud.service');
const RULES = require('../constants/fraudRules');

// SUBMIT AD REQUEST
exports.createAd = async (req, res) => {
  try {
    // FRAUD CHECK: Rapid ad submissions
    const recentAds = await Ad.countDocuments({
    createdBy: req.user.id,
    createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
    });

    if (recentAds >= RULES.RAPID_AD_SUBMISSIONS.limit) {
      await flagUser({
      userId: req.user.id,
      reason: RULES.RAPID_AD_SUBMISSIONS.reason,
      severity: RULES.RAPID_AD_SUBMISSIONS.severity
    });
    
    const ad = await Ad.create({
      title: req.body.title,
      description: req.body.description,
      businessName: req.body.businessName,
      website: req.body.website,
      createdBy: req.user.id
    });
    
    res.status(201).json(ad);

  }

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET APPROVED ADS (PUBLIC)
exports.getApprovedAds = async (req, res) => {
  try {
    const ads = await Ad.find({ status: 'APPROVED' })
      .sort({ isFeatured: -1, createdAt: -1 });

    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
