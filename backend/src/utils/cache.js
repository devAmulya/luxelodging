const { redis } = require('../config/redis');

// Get cached value (auto-parses JSON)
const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data || null;
  } catch (error) {
    console.error('Cache GET error:', error.message);
    return null;
  }
};

// Set cache with expiry (TTL in seconds)
const setCache = async (key, value, ttlSeconds = 600) => {
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.error('Cache SET error:', error.message);
  }
};

// Delete a specific key
const deleteCache = async (key) => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Cache DELETE error:', error.message);
  }
};

// Delete all keys matching a pattern (e.g., all search results for a property)
const deleteCacheByPattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache pattern DELETE error:', error.message);
  }
};

module.exports = { getCache, setCache, deleteCache, deleteCacheByPattern };