const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redis } = require('../config/redis');

const rateLimitClients = [];
const isTestProcess =
  process.env.NODE_ENV === 'test' || process.env.npm_lifecycle_event === 'test';

const createRedisStore = (prefix) => {
  const client = redis.duplicate({
    enableOfflineQueue: false,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: null
  });
  client.on('error', (error) => {
    console.error(`Rate limiter Redis error: ${error.message}`);
  });
  rateLimitClients.push(client);

  return new RedisStore({
    prefix,
    sendCommand: (...args) => client.call(...args)
  });
};

const rateLimitHandler = (req, res, next, options) => {
  return res.status(options.statusCode).json({
    success: false,
    message: options.message,
    data: {
      limit: options.limit,
      windowMs: options.windowMs
    }
  });
};

const createRateLimiter = (options) => {
  let limiter;

  return (req, res, next) => {
    if (!limiter) {
      limiter = rateLimit({
        windowMs: options.windowMs,
        limit: options.limit,
        standardHeaders: true,
        legacyHeaders: false,
        ...(isTestProcess ? {} : { store: createRedisStore(options.prefix) }),
        message: options.message,
        handler: rateLimitHandler,
        passOnStoreError: true,
        validate: {
          creationStack: false
        }
      });
    }

    return limiter(req, res, next);
  };
};

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: 'Too many authentication requests. Please try again later.',
  prefix: 'rate-limit:auth:'
});

const mlProxyRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  message: 'Too many ML requests. Please try again later.',
  prefix: 'rate-limit:ml:'
});

const generalApiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: 'Too many API requests. Please try again later.',
  prefix: 'rate-limit:api:'
});

module.exports = {
  authRateLimiter,
  mlProxyRateLimiter,
  generalApiRateLimiter,
  closeRateLimitStores: async () => {
    await Promise.all(
      rateLimitClients.map((client) => {
        if (client.status === 'end') {
          return null;
        }

        return client.quit().catch(() => client.disconnect());
      })
    );
  }
};
