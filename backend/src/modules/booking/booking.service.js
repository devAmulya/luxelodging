const { isRangeAvailable, getBookedDates } = require('../../models/mysql/availability.model');
const { findPropertyById } = require('../../models/mysql/property.model');
const { getConnection } = require('../../config/mysql');
const { lockAndCheckAvailability, markDatesAsBooked, releaseDates } = require('../../models/mysql/availability.model');
const { insertBooking, findBookingsByGuest, findBookingsByHost, findBookingById, updatePaymentStatus, autoCompletePastBookings } = require('../../models/mysql/booking.model');
const { deleteCacheByPattern } = require('../../utils/cache');
const razorpay = require('../../config/razorpay');
const crypto = require('crypto');


const checkAvailability = async (propertyId, checkIn, checkOut) => {
  const property = await findPropertyById(propertyId);
  if (!property) {
    throw new Error('Property not found');
  }

  if (new Date(checkIn) >= new Date(checkOut)) {
    throw new Error('Check-out date must be after check-in date');
  }

  if (new Date(checkIn) < new Date().setHours(0, 0, 0, 0)) {
    throw new Error('Check-in date cannot be in the past');
  }

  const available = await isRangeAvailable(propertyId, checkIn, checkOut);
  return { available, checkIn, checkOut };
};

const getPropertyCalendar = async (propertyId) => {
  const property = await findPropertyById(propertyId);
  if (!property) {
    throw new Error('Property not found');
  }
  const bookedDates = await getBookedDates(propertyId);
  return { propertyId, bookedDates };
};

const createBooking = async (guestId, { propertyId, checkIn, checkOut, numberOfGuests }) => {
  const propertyPreCheck = await findPropertyById(propertyId);
  if (!propertyPreCheck) {
    throw new Error('Property not found');
  }
  if (numberOfGuests > propertyPreCheck.guests_allowed) {
    throw new Error(`This property allows maximum ${propertyPreCheck.guests_allowed} guests`);
  }
  if (new Date(checkIn) >= new Date(checkOut)) {
    throw new Error('Check-out date must be after check-in date');
  }

  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    // Lock the property row itself — this serializes ALL booking attempts
    // for this specific property, regardless of whether availability rows exist yet
    const [propertyRows] = await connection.query(
      'SELECT id, price_per_night FROM properties WHERE id = ? FOR UPDATE',
      [propertyId]
    );

    if (propertyRows.length === 0) {
      throw new Error('Property not found');
    }

    const property = propertyRows[0];

    const isAvailable = await lockAndCheckAvailability(connection, propertyId, checkIn, checkOut);
    if (!isAvailable) {
      throw new Error('Selected dates are no longer available');
    }

    const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
    const totalPrice = nights * property.price_per_night;

    // Create Razorpay order (amount in paise, hence * 100)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalPrice * 100),
      currency: 'INR',
      receipt: `booking_${Date.now()}`
    });

    await markDatesAsBooked(connection, propertyId, checkIn, checkOut);

    const booking = await insertBooking(connection, {
      guestId, propertyId, checkIn, checkOut, numberOfGuests, totalPrice,
      razorpayOrderId: razorpayOrder.id
    });

    await connection.commit();
    await deleteCacheByPattern('search:*');

    return { ...booking, totalPrice, nights, checkIn, checkOut,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID // frontend needs this to open checkout
     };

  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const verifyPayment = async (guestId, bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const booking = await findBookingById(bookingId);

  if (!booking) {
    throw new Error('Booking not found');
  }
  if (booking.guest_id !== guestId) {
    throw new Error('You do not have permission to verify this booking');
  }
  if (booking.razorpay_order_id !== razorpayOrderId) {
    throw new Error('Order does not match this booking');
  }

  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  const isValid = expectedSignature === razorpaySignature;

  if (!isValid) {
    throw new Error('Payment verification failed — signature mismatch');
  }

  await updatePaymentStatus(bookingId, 'paid', razorpayOrderId, razorpayPaymentId);

  return { message: 'Payment verified successfully', status: 'paid' };
};

const getMyBookings = async (guestId) => {
  await autoCompletePastBookings();
  return await findBookingsByGuest(guestId);
};

const getHostBookings = async (hostId) => {
  await autoCompletePastBookings();
  return await findBookingsByHost(hostId);
};

const cancelBooking = async (guestId, bookingId) => {
  const booking = await findBookingById(bookingId);

  if (!booking) {
    throw new Error('Booking not found');
  }
  if (booking.guest_id !== guestId) {
    throw new Error('You do not have permission to cancel this booking');
  }
  if (booking.status === 'cancelled') {
    throw new Error('This booking is already cancelled');
  }
  if (booking.payment_status !== 'pending') {
    throw new Error('Only unpaid bookings can be cancelled this way — paid bookings require a refund request');
  }

  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    // Same property-row lock pattern as booking creation — keeps this
    // consistent with every other write that touches availability
    await connection.query('SELECT id FROM properties WHERE id = ? FOR UPDATE', [booking.property_id]);

    await releaseDates(connection, booking.property_id, booking.check_in, booking.check_out);

    await connection.query(`UPDATE bookings SET status = 'cancelled' WHERE id = ?`, [bookingId]);

    await connection.commit();
    await deleteCacheByPattern('search:*');

    return { message: 'Booking cancelled successfully' };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

module.exports = {
  checkAvailability, getPropertyCalendar, createBooking, getMyBookings, getHostBookings, verifyPayment, cancelBooking
};