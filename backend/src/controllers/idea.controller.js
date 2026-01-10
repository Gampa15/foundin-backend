const Idea = require('../models/Idea');
const Startup = require('../models/Startup');

// CREATE IDEA
exports.createIdea = async (req, res) => {
  try {
    const startup = await Startup.findOne({
      _id: req.body.startupId,
      owner: req.user.id
    });

    if (!startup) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const idea = await Idea.create({
      startup: req.body.startupId,
      owner: req.user.id,
      title: req.body.title,
      description: req.body.description,
      visibility: req.body.visibility,
      mediaUrl: req.file ? req.file.path : null,
      mediaType: req.file ? req.file.mimetype.startsWith('video') ? 'VIDEO' : 'IMAGE' : null
    });

    res.status(201).json(idea);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find({ owner: req.user.id })
      .populate('startup', 'name');

    res.json(ideas);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


// PUBLIC FEED
exports.getPublicIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find({ visibility: 'PUBLIC' })
      .populate('startup', 'name stage')
      .populate('owner', 'email');

    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// STARTUP IDEAS
exports.getIdeasByStartup = async (req, res) => {
  try {
    const ideas = await Idea.find({ startup: req.params.startupId });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// LIKE IDEA
exports.likeIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    if (!idea.likes.includes(req.user.id)) {
      idea.likes.push(req.user.id);
      await idea.save();
    }

    res.json({ likes: idea.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
