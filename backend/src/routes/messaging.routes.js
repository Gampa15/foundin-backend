const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth.middleware');
const {
  createConversation,
  getMyConversations,
  sendMessage,
  getMessages,
  markMessagesSeen
} = require('../controllers/messaging.controller');

router.post('/conversation', auth, createConversation);
router.get('/conversations', auth, getMyConversations);
router.post('/message', auth, sendMessage);
router.get('/messages/:conversationId', auth, getMessages);
router.post('/messages/:conversationId/seen', auth, markMessagesSeen);

module.exports = router;
