const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
  lazyConnect: true
});

redis.on('connect', () => {
  console.log('Redis connected.');
});

redis.on('error', (error) => {
  console.error(`Redis error: ${error.message}`);
});

const connectRedis = async () => {
  try {
    if (redis.status === 'ready') {
      return redis;
    }

    if (redis.status === 'wait' || redis.status === 'end') {
      await redis.connect();
    }

    await redis.ping();
    console.log('Redis connection verified.');
  } catch (error) {
    console.error(`Redis connection failed: ${error.message}`);
  }

  return redis;
};

const closeRedis = async () => {
  if (redis.status !== 'end') {
    await redis.quit();
    console.log('Redis connection closed.');
  }
};

module.exports = {
  redis,
  connectRedis,
  closeRedis
};
