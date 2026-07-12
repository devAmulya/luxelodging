const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const testRedis = async () => {
  try {
    await redis.set('connection_test', 'ok');
    const result = await redis.get('connection_test');
    if (result === 'ok') {
      console.log('✅ Redis Connected');
    }
  } catch (error) {
    console.error('❌ Redis Connection Failed:', error.message);
  }
};

module.exports = { redis, testRedis };