const Profile = require('../models/Profile');
const User = require('../models/User');

/**
 * CREATE PROFILE (one-time)
 */
exports.createProfile = async (req, res) => {
  try {
    const existing = await Profile.findOne({ user: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    const profile = await Profile.create({
      user: req.user.id,
      fullName: req.body.fullName || '',
      bio: req.body.bio || '',
      skills: req.body.skills || []
    });

    res.status(201).json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET MY PROFILE (MERGED USER + PROFILE)
 */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      'email role status authenticityScore trustTier'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profile = await Profile.findOne({ user: user._id });

    // Auto-create profile if missing
    if (!profile) {
      profile = await Profile.create({ user: user._id });
    }

    res.json({
      email: user.email,
      role: user.role,
      status: user.status,
      authenticityScore: profile.authenticityScore ?? user.authenticityScore,
      trustTier: profile.trustTier ?? user.trustTier,
      fullName: profile.fullName || '',
      bio: profile.bio || '',
      skills: profile.skills || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET PROFILE BY USER ID (PUBLIC VIEW)
 */
exports.getProfileByUserId = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      'email role authenticityScore trustTier'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await Profile.findOne({ user: user._id });

    res.json({
      email: user.email,
      role: user.role,
      authenticityScore: profile?.authenticityScore ?? user.authenticityScore,
      trustTier: profile?.trustTier ?? user.trustTier,
      fullName: profile?.fullName || '',
      bio: profile?.bio || '',
      skills: profile?.skills || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * UPDATE MY PROFILE
 */
exports.updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      {
        fullName: req.body.fullName,
        bio: req.body.bio,
        skills: req.body.skills
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
