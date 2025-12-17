const Startup = require('../models/Startup');
const Profile = require('../models/Profile');

// CREATE STARTUP
exports.createStartup = async (req, res) => {
  try {
    // Ensure profile exists
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(400).json({ message: 'Create profile first' });
    }

    const startup = await Startup.create({
      owner: req.user.id,
      name: req.body.name,
      domain: req.body.domain,
      stage: req.body.stage,
      description: req.body.description,
      website: req.body.website
    });

    res.status(201).json(startup);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET MY STARTUPS
exports.getMyStartups = async (req, res) => {
  try {
    const startups = await Startup.find({ owner: req.user.id });
    res.json(startups);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET STARTUP BY ID (PUBLIC)
exports.getStartupById = async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id)
      .populate('owner', 'email role');

    if (!startup) {
      return res.status(404).json({ message: 'Startup not found' });
    }

    res.json(startup);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE STARTUP (OWNER ONLY)
exports.updateStartup = async (req, res) => {
  try {
    const startup = await Startup.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      {
        name: req.body.name,
        domain: req.body.domain,
        stage: req.body.stage,
        description: req.body.description,
        website: req.body.website
      },
      { new: true }
    );

    if (!startup) {
      return res.status(403).json({ message: 'Not authorized or not found' });
    }

    res.json(startup);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
