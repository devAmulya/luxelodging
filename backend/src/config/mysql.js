const mysql = require('mysql2/promise');

const poolConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Managed MySQL providers (Aiven, etc.) require SSL/TLS — a local install doesn't.
// This only activates when a CA certificate is actually provided, so local
// development is completely unaffected.
if (process.env.MYSQL_SSL_CA) {
  poolConfig.ssl = {
    ca: process.env.MYSQL_SSL_CA,
    rejectUnauthorized: true,
  };
}

const pool = mysql.createPool(poolConfig);

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Connected');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL Connection Failed:', error.message);
  }
};

const getConnection = async () => {
  return await pool.getConnection();
};

module.exports = { pool, testConnection, getConnection };