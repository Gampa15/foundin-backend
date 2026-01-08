const Profile = require('../models/Profile');

/**
 * CREATE PROFILE (one-time manual creation)
 * Usually not needed because profile is auto-created
 */
exports.createProfile = async (req, res) => {
  try {
    const exists = await Profile.findOne({ user: req.user.id });
    if (exists) {
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
    console.error('Create profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET MY PROFILE (PRIVATE — MERGED USER + PROFILE)
 */
exports.getMyProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id })
      .populate('user', 'name email role status trustTier authenticityScore');

    // Self-healing profile
    if (!profile) {
      profile = await Profile.create({
        user: req.user.id,
        fullName: '',
        bio: '',
        skills: []
      });

      profile = await Profile.findOne({ user: req.user.id })
        .populate('user', 'name email role status trustTier authenticityScore');
    }

    // ✅ ADD THIS EXACTLY HERE
    const isProfileComplete =
      Boolean(profile.fullName) &&
      Boolean(profile.bio) &&
      Array.isArray(profile.skills) &&
      profile.skills.length > 0;

    // ✅ FINAL RESPONSE
    res.json({
      id: profile.user._id,
      name: profile.user.name,
      email: profile.user.email,
      role: profile.user.role,
      status: profile.user.status,
      trustTier: profile.user.trustTier,
      authenticityScore: profile.user.authenticityScore,

      fullName: profile.fullName,
      bio: profile.bio,
      skills: profile.skills,

      isProfileComplete
    });

  } catch (err) {
    console.error('Get my profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET PROFILE BY USER ID (PUBLIC VIEW)
 */
exports.getProfileByUserId = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId })
      .populate(
        'user',
        'name role trustTier authenticityScore'
      );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({
      name: profile.user.name,
      role: profile.user.role,
      trustTier: profile.user.trustTier,
      authenticityScore: profile.user.authenticityScore,

      fullName: profile.fullName || '',
      bio: profile.bio || '',
      skills: profile.skills || []
    });
  } catch (err) {
    console.error('Get profile by user ID error:', err);
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
    ).populate(
      'user',
      'name email role status trustTier authenticityScore'
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({
      name: profile.user.name,
      email: profile.user.email,
      role: profile.user.role,
      status: profile.user.status,
      trustTier: profile.user.trustTier,
      authenticityScore: profile.user.authenticityScore,

      fullName: profile.fullName || '',
      bio: profile.bio || '',
      skills: profile.skills || []
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
