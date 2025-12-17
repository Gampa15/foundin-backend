const Verification = require('../models/Verification');
const Startup = require('../models/Startup');

// APPLY FOR VERIFICATION
exports.applyVerification = async (req, res) => {
  try {
    const { level, startupId } = req.body;

    const verification = await Verification.create({
      user: req.user.id,
      startup: startupId || null,
      level,
      documents: req.files ? req.files.map(f => f.path) : []
    });

    res.status(201).json({
      message: 'Verification request submitted',
      verification
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET MY VERIFICATIONS
exports.getMyVerifications = async (req, res) => {
  try {
    const verifications = await Verification.find({ user: req.user.id })
      .populate('startup', 'name stage');

    res.json(verifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ADMIN: GET ALL PENDING
exports.getPendingVerifications = async (req, res) => {
  try {
    const requests = await Verification.find({ status: 'PENDING' })
      .populate('user', 'email role')
      .populate('startup', 'name');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ADMIN: REVIEW VERIFICATION
exports.reviewVerification = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const verification = await Verification.findById(req.params.id);
    if (!verification) {
      return res.status(404).json({ message: 'Request not found' });
    }

    verification.status = status;
    verification.remarks = remarks;
    verification.reviewedBy = req.user.id;
    await verification.save();

    if (status === 'APPROVED' && verification.startup) {
      await Startup.findByIdAndUpdate(
        verification.startup,
        { verifiedLevel: verification.level }
      );
    }

    res.json({ message: 'Verification updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
