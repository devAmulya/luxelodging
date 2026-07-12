const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const getConnection = async () => {
  return await pool.getConnection();
};

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Connected');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL Connection Failed:', error.message);
  }
};

module.exports = { pool, testConnection, getConnection };