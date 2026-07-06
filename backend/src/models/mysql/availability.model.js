const { pool } = require('../../config/mysql');

// Check if ANY date in the range is already booked
const isRangeAvailable = async (propertyId, checkIn, checkOut) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) as bookedCount FROM availability 
     WHERE property_id = ? AND date >= ? AND date < ? AND is_booked = TRUE`,
    [propertyId, checkIn, checkOut]
  );
  return rows[0].bookedCount === 0;
};

// Get all booked dates for a property (for calendar display)
const getBookedDates = async (propertyId) => {
  const [rows] = await pool.query(
    `SELECT date FROM availability 
     WHERE property_id = ? AND is_booked = TRUE AND date >= CURDATE()
     ORDER BY date ASC`,
    [propertyId]
  );
  return rows.map(row => row.date);
};

// Used INSIDE a transaction — locks matching rows until transaction ends
const lockAndCheckAvailability = async (connection, propertyId, checkIn, checkOut) => {
  const [rows] = await connection.query(
    `SELECT * FROM availability 
     WHERE property_id = ? AND date >= ? AND date < ? AND is_booked = TRUE
     FOR UPDATE`,
    [propertyId, checkIn, checkOut]
  );
  return rows.length === 0; // true = available
};

// Insert one row per booked date
const markDatesAsBooked = async (connection, propertyId, checkIn, checkOut) => {
  const dates = [];
  let current = new Date(checkIn);
  const end = new Date(checkOut);

  while (current < end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  const values = dates.map(date => [propertyId, date, true]);

  await connection.query(
    `INSERT INTO availability (property_id, date, is_booked) VALUES ?
     ON DUPLICATE KEY UPDATE is_booked = TRUE`,
    [values]
  );
};

module.exports = { isRangeAvailable, getBookedDates, lockAndCheckAvailability, markDatesAsBooked };