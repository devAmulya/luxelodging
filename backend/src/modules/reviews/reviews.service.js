const Review = require('../../models/mongo/review.model');
const { findBookingById } = require('../../models/mysql/booking.model');
const { findUserById } = require('../../models/mysql/user.model');
const { deleteCache } = require('../../utils/cache');

const addReview = async (guestId, { propertyId, bookingId, rating, comment, guestName }) => {
  // Verify booking exists and belongs to this guest
  const booking = await findBookingById(bookingId);

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.guest_id !== guestId) {
    throw new Error('You can only review your own bookings');
  }

  if (booking.property_id !== Number(propertyId)) {
    throw new Error('Booking does not match this property');
  }

  if (booking.status !== 'completed') {
    throw new Error('You can only review completed stays');
  }

  // Check for existing review on this booking
  const existingReview = await Review.findOne({ bookingId });
  if (existingReview) {
    throw new Error('You have already reviewed this booking');
  }

  const guest = await findUserById(guestId);

  const review = await Review.create({
    propertyId,
    guestId,
    guestName: guest.name,
    bookingId,
    rating,
    comment
  });

  await deleteCache(`review-summary:${propertyId}`);

  return review;
};

const getPropertyReviews = async (propertyId) => {
  const reviews = await Review.find({ propertyId: Number(propertyId) }).sort({ createdAt: -1 });

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return {
    averageRating: Number(averageRating),
    totalReviews: reviews.length,
    reviews
  };
};

module.exports = { addReview, getPropertyReviews };