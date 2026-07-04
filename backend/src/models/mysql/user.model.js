const { pool } = require('../../config/mysql');

const createUser = async ({ name, email, hashedPassword, role, phone = null }) => {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashedPassword, role, phone]
  );
  return result.insertId;
};

const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
  return rows[0];
};

const findUserById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, phone, profile_image, is_verified, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0];
};

module.exports = { createUser, findUserByEmail, findUserById };