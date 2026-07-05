const express = require('express');
const router = express.Router();
const upload = require('../../middleware/upload.middleware');
const { create, getById, getMine, update, remove, uploadImages, deleteImage, search,  } = require('./property.controller');
const { protect, authorizeRoles } = require('../../middleware/auth.middleware');

// Public route
router.get('/search', search);
router.get('/:id', getById);

// Protected routes (host only)
router.post('/', protect, authorizeRoles('host'), create);
router.get('/host/mine', protect, authorizeRoles('host'), getMine);
router.put('/:id', protect, authorizeRoles('host'), update);
router.delete('/:id', protect, authorizeRoles('host'), remove);
router.delete('/:id/images/:imageId', protect, authorizeRoles('host'), deleteImage);
router.post('/:id/images', protect, authorizeRoles('host'), upload.array('images', 10), uploadImages);

module.exports = router;