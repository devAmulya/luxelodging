const { pool } = require('../../config/mysql');

const createProperty = async ({
  hostId, title, description, address, city, country,
  latitude, longitude, pricePerNight, bedrooms, bathrooms, beds, guestsAllowed
}) => {
  const [result] = await pool.query(
    `INSERT INTO properties 
      (host_id, title, description, address, city, country, latitude, longitude, price_per_night, bedrooms, bathrooms, beds, guests_allowed) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [hostId, title, description, address, city, country, latitude, longitude, pricePerNight, bedrooms, bathrooms, beds, guestsAllowed]
  );
  return result.insertId;
};

const findPropertyById = async (id) => {
  const [rows] = await pool.query(
    'SELECT * FROM properties WHERE id = ? AND is_active = TRUE',
    [id]
  );
  return rows[0];
};

const findPropertiesByHost = async (hostId) => {
  const [rows] = await pool.query(
    'SELECT * FROM properties WHERE host_id = ? ORDER BY created_at DESC',
    [hostId]
  );
  return rows;
};

const updateProperty = async (id, hostId, fields) => {
  const allowedFields = [
    'title', 'description', 'address', 'city', 'country',
    'latitude', 'longitude', 'price_per_night', 'bedrooms',
    'bathrooms', 'beds', 'guests_allowed', 'is_active'
  ];

  const updates = [];
  const values = [];

  for (const key in fields) {
    if (allowedFields.includes(key)) {
      updates.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }

  if (updates.length === 0) return null;

  values.push(id, hostId);

  const [result] = await pool.query(
    `UPDATE properties SET ${updates.join(', ')} WHERE id = ? AND host_id = ?`,
    values
  );
  return result.affectedRows;
};

const deleteProperty = async (id, hostId) => {
  const [result] = await pool.query(
    'DELETE FROM properties WHERE id = ? AND host_id = ?',
    [id, hostId]
  );
  return result.affectedRows;
};

module.exports = {
  createProperty,
  findPropertyById,
  findPropertiesByHost,
  updateProperty,
  deleteProperty
};