const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { flagUser } = require('../services/fraud.service');
const RULES = require('../constants/fraudRules');

// CREATE OR GET DIRECT CONVERSATION
exports.createConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'Target user is required' });
    }
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    const targetUser = await User.findById(userId).select('_id');
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    let conversation = await Conversation.findOne({
      type: 'DIRECT',
      members: { $all: [req.user.id, userId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        type: 'DIRECT',
        members: [req.user.id, userId]
      });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET MY CONVERSATIONS
exports.getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: req.user.id
    })
      .sort({ updatedAt: -1 })
      .populate('members', 'name email role');

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// SEND MESSAGE
exports.sendMessage = async (req, res) => {
  try {
     const { conversationId, content } = req.body;
     const normalizedContent = typeof content === 'string' ? content.trim() : '';
     if (!conversationId || !normalizedContent) {
      return res.status(400).json({ message: 'conversationId and content are required' });
     }

     // FRAUD CHECK: Message spam
     const recentMessages = await Message.countDocuments({
       sender: req.user.id,
       createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
     });

     if (recentMessages >= RULES.MESSAGE_SPAM.limit) {
        await flagUser({
         userId: req.user.id,
         reason: RULES.MESSAGE_SPAM.reason,
         severity: RULES.MESSAGE_SPAM.severity
        });
     }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: req.user.id
    });

    if (!conversation) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      content: normalizedContent
    });
    await Conversation.findByIdAndUpdate(conversationId, { $set: { updatedAt: new Date() } });

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name email role');
    const io = req.app.get('io');
    if (io) {
      io.to(conversationId.toString()).emit('message:new', populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET MESSAGES
exports.getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      members: req.user.id
    }).select('_id');

    if (!conversation) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({
      conversation: req.params.conversationId
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email role');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// MARK MESSAGES AS SEEN
exports.markMessagesSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      members: req.user.id
    }).select('_id');

    if (!conversation) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user.id },
        readBy: { $ne: req.user.id }
      },
      { $addToSet: { readBy: req.user.id } }
    );

    const seenMessages = await Message.find({
      conversation: conversationId,
      sender: { $ne: req.user.id },
      readBy: req.user.id
    }).select('_id sender');

    const seenMessageIds = seenMessages.map((message) => message._id.toString());

    const io = req.app.get('io');
    if (io && seenMessageIds.length > 0) {
      io.to(conversationId.toString()).emit('message:seen', {
        conversationId,
        userId: req.user.id,
        messageIds: seenMessageIds
      });
    }

    res.json({ seenMessageIds });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
