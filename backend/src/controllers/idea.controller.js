const Idea = require('../models/Idea');
const Startup = require('../models/Startup');
const User = require('../models/User');
const mongoose = require('mongoose');
const { cloudinaryEnabled, uploadBuffer } = require('../utils/cloudinary');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const extractCommentUserIds = (comments = []) => {
  const ids = [];
  comments.forEach((comment) => {
    if (comment?.user && isValidObjectId(comment.user)) {
      ids.push(comment.user.toString());
    }
    if (Array.isArray(comment?.replies)) {
      comment.replies.forEach((reply) => {
        if (reply?.user && isValidObjectId(reply.user)) {
          ids.push(reply.user.toString());
        }
      });
    }
  });
  return [...new Set(ids)];
};

const hydrateComments = (comments = [], usersById = new Map(), viewerId = '') => (
  comments.map((comment) => {
    const commentUserId = comment?.user ? comment.user.toString() : '';
    const commentUser = usersById.get(commentUserId) || null;
    const likes = Array.isArray(comment?.likes) ? comment.likes.map((id) => id.toString()) : [];
    const replies = Array.isArray(comment?.replies) ? comment.replies.map((reply) => {
      const replyUserId = reply?.user ? reply.user.toString() : '';
      const replyUser = usersById.get(replyUserId) || null;
      const replyLikes = Array.isArray(reply?.likes) ? reply.likes.map((id) => id.toString()) : [];
      return {
        _id: reply?._id,
        text: reply?.text || '',
        createdAt: reply?.createdAt || null,
        user: replyUser ? { _id: replyUser._id, name: replyUser.name, email: replyUser.email } : null,
        likesCount: replyLikes.length,
        isLiked: viewerId ? replyLikes.includes(viewerId) : false
      };
    }) : [];

    return {
      _id: comment?._id,
      text: comment?.text || '',
      createdAt: comment?.createdAt || null,
      user: commentUser ? { _id: commentUser._id, name: commentUser.name, email: commentUser.email } : null,
      likesCount: likes.length,
      isLiked: viewerId ? likes.includes(viewerId) : false,
      replies
    };
  })
);

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
    })
      .populate('startup', 'name stage sector')
      .populate('owner', 'name email role authenticityScore trustTier')
      .populate('comments.user', 'name email');

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
      .populate('startup', 'name stage sector')
      .populate('owner', 'name email role authenticityScore trustTier');

    res.json(ideas);
  } catch (error) {
    console.error('Get my ideas error:', error);
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
      .populate('owner', 'name email role authenticityScore trustTier');

    res.json(ideas);
  } catch (error) {
    console.error('Get public ideas error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   STARTUP IDEAS
========================= */
exports.getIdeasByStartup = async (req, res) => {
  try {
    const ideas = await Idea.find({ startup: req.params.startupId })
      .populate('startup', 'name stage sector')
      .populate('owner', 'name email role authenticityScore trustTier');
    res.json(ideas);
  } catch (error) {
    console.error('Get ideas by startup error:', error);
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

/* =========================
   GET IDEA COMMENTS
========================= */
exports.getIdeaComments = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id)
      .select('visibility owner comments')
      .lean();

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    const isOwner = idea.owner?.toString() === req.user.id;
    if (idea.visibility !== 'PUBLIC' && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view comments for this idea' });
    }

    const rawComments = Array.isArray(idea.comments) ? idea.comments : [];
    const userIds = extractCommentUserIds(rawComments);
    const users = userIds.length > 0
      ? await User.find({ _id: { $in: userIds } }).select('name email').lean()
      : [];
    const usersById = new Map(users.map((user) => [user._id.toString(), user]));
    const comments = hydrateComments(rawComments, usersById, req.user.id);

    res.json({
      comments,
      commentsCount: comments.length
    });
  } catch (error) {
    console.error('Get idea comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   SAVE IDEA (TOGGLE)
========================= */
exports.toggleSaveIdea = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id).select('savedBy');
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    const hasSaved = Array.isArray(idea.savedBy)
      && idea.savedBy.map((id) => id.toString()).includes(req.user.id);

    if (hasSaved) {
      await Idea.updateOne(
        { _id: req.params.id },
        { $pull: { savedBy: req.user.id } }
      );
    } else {
      await Idea.updateOne(
        { _id: req.params.id },
        { $addToSet: { savedBy: req.user.id } }
      );
    }

    const refreshed = await Idea.findById(req.params.id).select('savedBy').lean();
    const savesCount = Array.isArray(refreshed?.savedBy) ? refreshed.savedBy.length : 0;

    res.json({
      saved: !hasSaved,
      savesCount
    });
  } catch (error) {
    console.error('Toggle save idea error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   ADD IDEA VIEW
========================= */
exports.addIdeaView = async (req, res) => {
  try {
    const idea = await Idea.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true, select: 'views' }
    );

    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    res.json({ views: typeof idea.views === 'number' ? idea.views : 0 });
  } catch (error) {
    console.error('Add idea view error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   COMMENT IDEA
========================= */
exports.addComment = async (req, res) => {
  try {
    const text = (req.body?.text || '').trim();
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const idea = await Idea.findById(req.params.id).select('visibility owner');
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    const isOwner = idea.owner?.toString() === req.user.id;
    if (idea.visibility !== 'PUBLIC' && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to comment on this idea' });
    }

    const writeResult = await Idea.updateOne(
      { _id: req.params.id },
      {
        $push: {
          comments: {
            user: req.user.id,
            text,
            createdAt: new Date()
          }
        }
      }
    );

    if (!writeResult?.matchedCount) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    if (!writeResult?.modifiedCount) {
      console.error('Add comment write did not modify document', {
        ideaId: req.params.id,
        userId: req.user.id
      });
      return res.status(500).json({ message: 'Comment could not be saved' });
    }

    const refreshed = await Idea.findById(req.params.id).select('comments').lean();
    const comments = Array.isArray(refreshed?.comments) ? refreshed.comments : [];
    const latestComment = comments[comments.length - 1] || null;

    if (!latestComment) {
      console.error('Add comment read-after-write found no comments', {
        ideaId: req.params.id,
        userId: req.user.id
      });
      return res.status(500).json({ message: 'Comment saved state could not be verified' });
    }

    const user = await User.findById(req.user.id).select('name email').lean();

    res.status(201).json({
      comment: {
        _id: latestComment._id,
        text: latestComment.text,
        createdAt: latestComment.createdAt,
        user: user ? { _id: user._id, name: user.name, email: user.email } : null,
        likesCount: 0,
        isLiked: false,
        replies: []
      },
      commentsCount: comments.length
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   LIKE COMMENT
========================= */
exports.toggleCommentLike = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    if (!isValidObjectId(id) || !isValidObjectId(commentId)) {
      return res.status(400).json({ message: 'Invalid identifiers' });
    }

    const idea = await Idea.findById(id).select('visibility owner comments._id comments.likes');
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    const isOwner = idea.owner?.toString() === req.user.id;
    if (idea.visibility !== 'PUBLIC' && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to like this comment' });
    }

    const currentComment = idea.comments.find((comment) => comment._id.toString() === commentId);
    if (!currentComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const hasLiked = Array.isArray(currentComment.likes)
      && currentComment.likes.map((like) => like.toString()).includes(req.user.id);

    await Idea.updateOne(
      { _id: id, 'comments._id': commentId },
      hasLiked
        ? { $pull: { 'comments.$.likes': req.user.id } }
        : { $addToSet: { 'comments.$.likes': req.user.id } }
    );

    const refreshed = await Idea.findById(id).select('comments').lean();
    const refreshedComments = Array.isArray(refreshed?.comments) ? refreshed.comments : [];
    const updatedComment = refreshedComments.find((comment) => comment?._id?.toString() === commentId);
    const likesCount = Array.isArray(updatedComment?.likes) ? updatedComment.likes.length : 0;

    res.json({
      liked: !hasLiked,
      likesCount
    });
  } catch (error) {
    console.error('Toggle comment like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* =========================
   REPLY TO COMMENT
========================= */
exports.replyToComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const text = (req.body?.text || '').trim();
    if (!text) {
      return res.status(400).json({ message: 'Reply text is required' });
    }
    if (!isValidObjectId(id) || !isValidObjectId(commentId)) {
      return res.status(400).json({ message: 'Invalid identifiers' });
    }

    const idea = await Idea.findById(id).select('visibility owner comments._id');
    if (!idea) {
      return res.status(404).json({ message: 'Idea not found' });
    }

    const isOwner = idea.owner?.toString() === req.user.id;
    if (idea.visibility !== 'PUBLIC' && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to reply on this comment' });
    }

    const hasComment = idea.comments.some((comment) => comment._id.toString() === commentId);
    if (!hasComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const createdAt = new Date();
    const replyId = new mongoose.Types.ObjectId();
    await Idea.updateOne(
      { _id: id, 'comments._id': commentId },
      {
        $push: {
          'comments.$.replies': {
            _id: replyId,
            user: req.user.id,
            text,
            createdAt
          }
        }
      }
    );

    const user = await User.findById(req.user.id).select('name email').lean();
    res.status(201).json({
      reply: {
        _id: replyId,
        text,
        createdAt,
        user: user ? { _id: user._id, name: user.name, email: user.email } : null,
        likesCount: 0,
        isLiked: false
      }
    });
  } catch (error) {
    console.error('Reply comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



