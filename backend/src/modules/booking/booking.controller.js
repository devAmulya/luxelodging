const { checkAvailability, getPropertyCalendar } = require('./booking.service');
const { success, error } = require('../../utils/response');
const { createBooking, getMyBookings, getHostBookings } = require('./booking.service');

const checkDates = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return error(res, 400, 'checkIn and checkOut dates are required');
    }

    const result = await checkAvailability(propertyId, checkIn, checkOut);
    return success(res, 200, 'Availability checked', result);
  } catch (err) {
    return error(res, 400, err.message);
  }
};

const getCalendar = async (req, res) => {
  try {
    const result = await getPropertyCalendar(req.params.propertyId);
    return success(res, 200, 'Calendar fetched', result);
  } catch (err) {
    return error(res, 400, err.message);
  }
};

const book = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, numberOfGuests } = req.body;

    if (!propertyId || !checkIn || !checkOut || !numberOfGuests) {
      return error(res, 400, 'All fields are required');
    }

    const result = await createBooking(req.user.id, { propertyId, checkIn, checkOut, numberOfGuests });
    return success(res, 201, 'Booking confirmed', result);
  } catch (err) {
    return error(res, 400, err.message);
  }
};

const myBookings = async (req, res) => {
  try {
    const bookings = await getMyBookings(req.user.id);
    return success(res, 200, 'Your bookings fetched', bookings);
  } catch (err) {
    return error(res, 400, err.message);
  }
};

const hostBookings = async (req, res) => {
  try {
    const bookings = await getHostBookings(req.user.id);
    return success(res, 200, 'Bookings on your properties fetched', bookings);
  } catch (err) {
    return error(res, 400, err.message);
  }
};

module.exports = { checkDates, getCalendar, book, myBookings, hostBookings };