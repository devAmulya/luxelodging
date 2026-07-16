const express = require('express');
const router = express.Router();
const { create, getByProperty, remove } = require('./reviews.controller');
const { protect, authorizeRoles } = require('../../middleware/auth.middleware');

router.get('/:propertyId', getByProperty); // public
router.delete('/:reviewId', protect, authorizeRoles('guest'), remove);
router.post('/', protect, authorizeRoles('guest'), create);

module.exports = router;