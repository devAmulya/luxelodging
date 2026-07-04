const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/mysql');
const connectMongo = require('./config/mongo');
const { testRedis } = require('./config/redis');
const authRoutes = require('./modules/auth/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

const startServer = async () => {
  await testConnection();
  await connectMongo();
  await testRedis();
};

startServer();

module.exports = app;