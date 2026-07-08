const express = require('express');
const router = express.Router();
const { checkDates, getCalendar, book, myBookings, hostBookings, confirmPayment } = require('./booking.controller');
const { protect, authorizeRoles } = require('../../middleware/auth.middleware');

// Public routes
router.get('/availability/:propertyId', checkDates);
router.get('/calendar/:propertyId', getCalendar);

// Protected routes
router.post('/', protect, authorizeRoles('guest'), book);
router.post('/verify-payment', protect, authorizeRoles('guest'), confirmPayment);
router.get('/my-bookings', protect, authorizeRoles('guest'), myBookings);
router.get('/host-bookings', protect, authorizeRoles('host'), hostBookings);

module.exports = router;