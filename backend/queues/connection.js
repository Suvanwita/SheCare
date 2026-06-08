const { redis } = require('../config/redis');

const connection = redis.duplicate({
  maxRetriesPerRequest: null
});

module.exports = connection;
