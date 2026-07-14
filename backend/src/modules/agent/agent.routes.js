const express = require('express');
const router = express.Router();
const { sendMessage } = require('./agent.controller');
const { protect } = require('../../middleware/auth.middleware');

router.post('/chat', protect, sendMessage);

module.exports = router;