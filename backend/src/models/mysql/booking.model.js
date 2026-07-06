const { pool } = require('../../config/mysql');

const generateBookingReference = () => {
  return 'LX' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
};

const insertBooking = async (connection, { guestId, propertyId, checkIn, checkOut, numberOfGuests, totalPrice }) => {
  const bookingReference = generateBookingReference();

  const [result] = await connection.query(
    `INSERT INTO bookings 
      (booking_reference, guest_id, property_id, check_in, check_out, number_of_guests, total_price, status, payment_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', 'pending')`,
    [bookingReference, guestId, propertyId, checkIn, checkOut, numberOfGuests, totalPrice]
  );

  return { id: result.insertId, bookingReference };
};

const findBookingsByGuest = async (guestId) => {
  const [rows] = await pool.query(
    `SELECT b.*, p.title, p.city, p.country FROM bookings b
     JOIN properties p ON b.property_id = p.id
     WHERE b.guest_id = ? ORDER BY b.created_at DESC`,
    [guestId]
  );
  return rows;
};

const findBookingsByHost = async (hostId) => {
  const [rows] = await pool.query(
    `SELECT b.*, p.title, u.name as guest_name, u.email as guest_email 
     FROM bookings b
     JOIN properties p ON b.property_id = p.id
     JOIN users u ON b.guest_id = u.id
     WHERE p.host_id = ? ORDER BY b.created_at DESC`,
    [hostId]
  );
  return rows;
};

const findBookingById = async (bookingId) => {
  const [rows] = await pool.query(
    'SELECT * FROM bookings WHERE id = ?',
    [bookingId]
  );
  return rows[0];
};

module.exports = { insertBooking, findBookingsByGuest, findBookingsByHost, findBookingById };