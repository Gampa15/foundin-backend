const Ad = require('../models/Ad');

exports.reviewAd = async (req, res) => {
  try {
    const { status, rejectionReason, isFeatured } = req.body;

    const ad = await Ad.findByIdAndUpdate(
      req.params.id,
      {
        status,
        rejectionReason,
        isFeatured
      },
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    res.json(ad);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
