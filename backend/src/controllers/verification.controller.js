const Verification = require('../models/Verification');
const Startup = require('../models/Startup');
const { cloudinaryEnabled, uploadBuffer } = require('../utils/cloudinary');

// APPLY FOR VERIFICATION
exports.applyVerification = async (req, res) => {
  try {
    const { level, startupId } = req.body;

    let documents = [];

    if (req.files && req.files.length > 0) {
      if (!cloudinaryEnabled) {
        return res.status(500).json({
          message: 'Cloudinary is not configured'
        });
      }

      const missingBuffer = req.files.some(file => !file.buffer);
      if (missingBuffer) {
        return res.status(400).json({
          message: 'Document upload failed (missing file buffer)'
        });
      }

      try {
        const uploads = await Promise.all(
          req.files.map(file =>
            uploadBuffer(file.buffer, {
              resource_type: 'auto',
              folder: process.env.CLOUDINARY_FOLDER || 'foundin'
            })
          )
        );
        documents = uploads.map(result => result.secure_url);
      } catch (err) {
        console.error('Cloudinary upload failed:', err);
        return res.status(500).json({
          message: 'Cloudinary upload failed',
          error: err.message
        });
      }
    }

    const verification = await Verification.create({
      user: req.user.id,
      startup: startupId || null,
      level,
      documents
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
