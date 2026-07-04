const express = require('express');
const { testConnection } = require('./config/mysql');
const connectMongo = require('./config/mongo');
const { testRedis } = require('./config/redis');

const app = express();

const startServer = async () => {
  await testConnection();
  await connectMongo();
  await testRedis();
};

startServer();

module.exports = app;