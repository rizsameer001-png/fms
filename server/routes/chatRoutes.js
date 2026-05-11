const express = require('express');
const router = express.Router();
const {
  getChatGroups,
  getMessages,
  sendMessage,
  createGroup,
  getOrCreateDirectChat
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/groups', protect, getChatGroups);
router.post('/groups', protect, createGroup);
router.post('/direct', protect, getOrCreateDirectChat);
router.get('/groups/:groupId/messages', protect, getMessages);
router.post('/groups/:groupId/messages', protect, sendMessage);

module.exports = router;
