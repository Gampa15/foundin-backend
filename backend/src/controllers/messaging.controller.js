const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { flagUser } = require('../services/fraud.service');
const RULES = require('../constants/fraudRules');

// CREATE OR GET DIRECT CONVERSATION
exports.createConversation = async (req, res) => {
  try {
    const { userId } = req.body;

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
    }).populate('members', 'email role');

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// SEND MESSAGE
exports.sendMessage = async (req, res) => {
  try {
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

    const { conversationId, content } = req.body;

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
      content
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET MESSAGES
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId
    }).populate('sender', 'email role');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
