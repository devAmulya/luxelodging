const express = require('express');
const router = express.Router();
const { create, getById, getMine, update, remove } = require('./property.controller');
const { protect, authorizeRoles } = require('../../middleware/auth.middleware');

// Public route
router.get('/:id', getById);

// Protected routes (host only)
router.post('/', protect, authorizeRoles('host'), create);
router.get('/host/mine', protect, authorizeRoles('host'), getMine);
router.put('/:id', protect, authorizeRoles('host'), update);
router.delete('/:id', protect, authorizeRoles('host'), remove);

module.exports = router;