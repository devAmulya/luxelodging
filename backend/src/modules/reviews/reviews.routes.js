const express = require('express');
const router = express.Router();
const { create, getByProperty } = require('./reviews.controller');
const { protect, authorizeRoles } = require('../../middleware/auth.middleware');

router.get('/:propertyId', getByProperty); // public
router.post('/', protect, authorizeRoles('guest'), create);

module.exports = router;