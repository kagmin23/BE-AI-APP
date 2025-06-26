const express = require('express');
const router = express.Router();
const {
  getChatHistory,
  sendPromptToAI,
} = require('../controllers/textChat.controller');

// Route GET /text-to-text
router.get('/text-to-text', getChatHistory);

// Route POST /text-to-text
router.post('/text-to-text', sendPromptToAI);

module.exports = router;