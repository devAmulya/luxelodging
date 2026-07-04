const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  propertyId: {
    type: Number,        // References MySQL property.id
    required: true,
    index: true
  },
  guestId: {
    type: Number,        // References MySQL user.id
    required: true
  },
  guestName: {
    type: String,        // Denormalized for fast display (avoid MySQL join)
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', reviewSchema);