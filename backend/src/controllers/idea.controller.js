const Idea = require('../models/Idea');
const Startup = require('../models/Startup');
const { cloudinaryEnabled, uploadBuffer } = require('../utils/cloudinary');

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

    let mediaUrl = null;
    let mediaType = null;

    if (req.file) {
      if (!cloudinaryEnabled) {
        return res.status(500).json({
          message: 'Cloudinary is not configured'
        });
      }

      if (!req.file.buffer) {
        return res.status(400).json({
          message: 'Media upload failed (missing file buffer)'
        });
      }

      try {
        const result = await uploadBuffer(req.file.buffer, {
          resource_type: 'auto',
          folder: process.env.CLOUDINARY_FOLDER || 'foundin'
        });
        mediaUrl = result.secure_url;
      } catch (err) {
        console.error('Cloudinary upload failed:', err);
        return res.status(500).json({
          message: 'Cloudinary upload failed',
          error: err.message
        });
      }

      mediaType = req.file.mimetype.startsWith('video')
        ? 'VIDEO'
        : req.file.mimetype.startsWith('image')
        ? 'IMAGE'
        : 'DOC';
    }

    const updatedSector = req.body.sector || startup.sector;
    const updatedStage = req.body.stage || startup.stage || 'IDEA';

    if (updatedSector !== startup.sector || updatedStage !== startup.stage) {
      await Startup.updateOne(
        { _id: startup._id },
        { sector: updatedSector, stage: updatedStage }
      );
    }

    const earlyStages = ['IDEA', 'PROTOTYPE'];
    const sanitizedTraction = earlyStages.includes(updatedStage)
      ? ''
      : (req.body.traction || '');

    const missingSkills = req.body.missingSkills;
    const normalizedMissingSkills = Array.isArray(missingSkills)
      ? missingSkills.filter(Boolean)
      : (typeof missingSkills === 'string' && missingSkills)
      ? [missingSkills]
      : [];

    const ask = req.body.ask;
    const normalizedAsk = Array.isArray(ask)
      ? ask.filter(Boolean)
      : (typeof ask === 'string' && ask)
      ? [ask]
      : [];

    const idea = await Idea.create({
      /* relations */
      startup: startup._id,
      owner: req.user.id,

      /* idea basics */
      title: req.body.title || `${updatedStage} Stage`,
      description: req.body.description || '',
      visibility: req.body.visibility || 'PUBLIC',
      isDraft: req.body.isDraft || false,

      /* snapshot from startup */
      sector: updatedSector,
      stage: updatedStage,

      /* problem & solution */
      problem: req.body.problem || '',
      solution: req.body.solution || '',
      targetAudience: req.body.targetAudience || '',
      marketSize: req.body.marketSize || 'UNKNOWN',
      differentiation: req.body.differentiation || '',

      /* traction */
      traction: sanitizedTraction,

      /* team */
      teamSize: req.body.teamSize || 1,
      missingSkills: normalizedMissingSkills,

      /* ask / intent */
      ask: normalizedAsk,

      /* media */
      mediaUrl,
      mediaType
    });

    res.status(201).json(idea);
  } catch (error) {
    console.error('Create idea error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   GET IDEA BY ID (OWNER)
========================= */
exports.getIdeaById = async (req, res) => {
  try {
    const idea = await Idea.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('startup', 'name stage sector');

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    res.json(idea);
  } catch (error) {
    console.error('Get idea error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   UPDATE IDEA (OWNER)
========================= */
exports.updateIdea = async (req, res) => {
  try {
    const idea = await Idea.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('startup', 'sector stage');

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    const updatedSector = req.body.sector || idea.sector;
    const updatedStage = req.body.stage || idea.stage || 'IDEA';

    if (
      idea.startup &&
      (updatedSector !== idea.startup.sector || updatedStage !== idea.startup.stage)
    ) {
      await Startup.updateOne(
        { _id: idea.startup._id },
        { sector: updatedSector, stage: updatedStage }
      );
    }

    if (req.file) {
      if (!cloudinaryEnabled) {
        return res.status(500).json({
          message: 'Cloudinary is not configured'
        });
      }

      if (!req.file.buffer) {
        return res.status(400).json({
          message: 'Media upload failed (missing file buffer)'
        });
      }

      try {
        const result = await uploadBuffer(req.file.buffer, {
          resource_type: 'auto',
          folder: process.env.CLOUDINARY_FOLDER || 'foundin'
        });
        idea.mediaUrl = result.secure_url;
        idea.mediaType = req.file.mimetype.startsWith('video')
          ? 'VIDEO'
          : req.file.mimetype.startsWith('image')
          ? 'IMAGE'
          : 'DOC';
      } catch (err) {
        console.error('Cloudinary upload failed:', err);
        return res.status(500).json({
          message: 'Cloudinary upload failed',
          error: err.message
        });
      }
    }

    idea.visibility = req.body.visibility || idea.visibility || 'PUBLIC';
    idea.sector = updatedSector;
    idea.stage = updatedStage;
    idea.problem = req.body.problem ?? idea.problem;
    idea.solution = req.body.solution ?? idea.solution;
    idea.targetAudience = req.body.targetAudience ?? idea.targetAudience;
    idea.marketSize = req.body.marketSize || idea.marketSize || 'UNKNOWN';
    idea.differentiation = req.body.differentiation ?? idea.differentiation;
    idea.traction = req.body.traction ?? idea.traction;
    idea.teamSize = req.body.teamSize || idea.teamSize || 1;

    const missingSkills = req.body.missingSkills;
    if (Array.isArray(missingSkills)) {
      idea.missingSkills = missingSkills.filter(Boolean);
    } else if (typeof missingSkills === 'string') {
      idea.missingSkills = missingSkills ? [missingSkills] : [];
    }

    const ask = req.body.ask;
    if (Array.isArray(ask)) {
      idea.ask = ask.filter(Boolean);
    } else if (typeof ask === 'string') {
      idea.ask = ask ? [ask] : [];
    }

    await idea.save();

    res.json(idea);
  } catch (error) {
    console.error('Update idea error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   DELETE IDEA (OWNER)
========================= */
exports.deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    res.json({ message: 'Idea deleted' });
  } catch (error) {
    console.error('Delete idea error:', error);
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
