const Idea = require('../models/Idea');
const Startup = require('../models/Startup');

/* =========================
   CREATE IDEA
========================= */
exports.createIdea = async (req, res) => {
  try {
    // Ensure startup belongs to user
    const startup = await Startup.findOne({
      _id: req.body.startupId,
      owner: req.user.id
    });

    if (!startup) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const idea = await Idea.create({
      /* relations */
      startup: startup._id,
      owner: req.user.id,

      /* idea basics */
      title: req.body.title,
      description: req.body.description || '',
      visibility: req.body.visibility || 'PUBLIC',
      isDraft: req.body.isDraft || false,

      /* snapshot from startup */
      sector: startup.sector,
      stage: startup.stage || 'IDEA',

      /* problem & solution */
      problem: req.body.problem || '',
      solution: req.body.solution || '',
      targetAudience: req.body.targetAudience || '',
      marketSize: req.body.marketSize || 'UNKNOWN',
      differentiation: req.body.differentiation || '',

      /* traction */
      traction: req.body.traction || '',

      /* team */
      teamSize: req.body.teamSize || 1,
      missingSkills: req.body.missingSkills || [],

      /* ask / intent */
      ask: Array.isArray(req.body.ask) ? req.body.ask : [],

      /* media */
      mediaUrl: req.file ? req.file.path : null,
      mediaType: req.file
        ? req.file.mimetype.startsWith('video')
          ? 'VIDEO'
          : req.file.mimetype.startsWith('image')
          ? 'IMAGE'
          : 'DOC'
        : null
    });

    res.status(201).json(idea);
  } catch (error) {
    console.error('Create idea error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   GET MY IDEAS
========================= */
exports.getMyIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find({ owner: req.user.id })
      .populate('startup', 'name stage sector');

    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   PUBLIC FEED
========================= */
exports.getPublicIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find({ visibility: 'PUBLIC', isDraft: false })
      .populate('startup', 'name stage sector')
      .populate('owner', 'email');

    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   STARTUP IDEAS
========================= */
exports.getIdeasByStartup = async (req, res) => {
  try {
    const ideas = await Idea.find({ startup: req.params.startupId });
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   LIKE IDEA
========================= */
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
