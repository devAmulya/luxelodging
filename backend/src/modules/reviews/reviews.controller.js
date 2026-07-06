const { addReview, getPropertyReviews } = require('./reviews.service');
const { success, error } = require('../../utils/response');

const create = async (req, res) => {
  try {
    const { propertyId, bookingId, rating, comment } = req.body;

    if (!propertyId || !bookingId || !rating) {
      return error(res, 400, 'propertyId, bookingId, and rating are required');
    }

    const review = await addReview(req.user.id, { propertyId, bookingId, rating, comment });

    return success(res, 201, 'Review added successfully', review);
  } catch (err) {
    return error(res, 400, err.message);
  }
};

const getByProperty = async (req, res) => {
  try {
    const result = await getPropertyReviews(req.params.propertyId);
    return success(res, 200, 'Reviews fetched', result);
  } catch (err) {
    return error(res, 400, err.message);
  }
};

module.exports = { create, getByProperty };