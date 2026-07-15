const express = require('express');
const router = express.Router();
const { sendMessage, generateListingDescription, getReviewSummary } = require('./agent.controller');
const { protect, authorizeRoles } = require('../../middleware/auth.middleware');

router.post('/chat', protect, sendMessage);
router.post('/generate-description', protect, authorizeRoles('host'), generateListingDescription);
router.get('/review-summary/:propertyId', getReviewSummary); // public, same as reviews themselves

module.exports = router;