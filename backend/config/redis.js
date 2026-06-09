const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
  lazyConnect: true,
  connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT_MS) || 10000,
  maxRetriesPerRequest: Number(process.env.REDIS_MAX_RETRIES_PER_REQUEST) || 2,
  retryStrategy(times) {
    return Math.min(times * 100, 2000);
  }
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
  if (redis.status === 'end') {
    return;
  }

  try {
    await redis.quit();
  } catch (error) {
    console.error(`Redis graceful quit failed: ${error.message}`);
    redis.disconnect();
  }

  console.log('Redis connection closed.');
};

module.exports = {
  redis,
  connectRedis,
  closeRedis
};
