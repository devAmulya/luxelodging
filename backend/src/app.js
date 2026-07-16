const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/mysql');
const connectMongo = require('./config/mongo');
const { testRedis } = require('./config/redis');
const authRoutes = require('./modules/auth/auth.routes');
const propertyRoutes = require('./modules/property/property.routes');
const bookingRoutes = require('./modules/booking/booking.routes');
const reviewRoutes = require('./modules/reviews/reviews.routes');
const { pool } = require('./config/mysql');
const agentRoutes = require('./modules/agent/agent.routes');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  'http://localhost:4173'
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/warmup', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'warm' });
  } catch (err) {
    res.status(500).json({ status: 'db unreachable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/agent', agentRoutes);

const startServer = async () => {
  await testConnection();
  await connectMongo();
  await testRedis();
};

startServer();

module.exports = app;