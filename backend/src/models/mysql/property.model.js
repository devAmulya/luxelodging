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

const searchProperties = async (filters) => {
  const { city, minPrice, maxPrice, guests, checkIn, checkOut, keyword } = filters;

  let query = `
    SELECT DISTINCT p.*, pi.image_url as cover_image FROM properties p
    LEFT JOIN availability a ON p.id = a.property_id
    LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.is_cover = TRUE
    WHERE p.is_active = TRUE
  `;
  const values = [];

  if (city) {
    query += ' AND p.city LIKE ?';
    values.push(`%${city}%`);
  }

  if (minPrice) {
    query += ' AND p.price_per_night >= ?';
    values.push(minPrice);
  }

  if (maxPrice) {
    query += ' AND p.price_per_night <= ?';
    values.push(maxPrice);
  }

  if (guests) {
    query += ' AND p.guests_allowed >= ?';
    values.push(guests);
  }

  if (keyword) {
    query += ' AND MATCH(p.title, p.description) AGAINST (? IN NATURAL LANGUAGE MODE)';
    values.push(keyword);
  }

  // Exclude properties that have ANY booked date within the requested range
  if (checkIn && checkOut) {
    query += `
      AND p.id NOT IN (
        SELECT property_id FROM availability 
        WHERE date BETWEEN ? AND ? AND is_booked = TRUE
      )
    `;
    values.push(checkIn, checkOut);
  }

  query += ' ORDER BY p.created_at DESC LIMIT 50';

  const [rows] = await pool.query(query, values);
  return rows;
};

module.exports = {
  createProperty, findPropertyById, findPropertiesByHost,
  updateProperty, deleteProperty, searchProperties
};