const { redis } = require('../config/redis');

const connection = redis.duplicate({
  maxRetriesPerRequest: null
});

const closeQueueConnection = async () => {
  if (connection.status === 'end') {
    return;
  }

  try {
    await connection.quit();
  } catch (error) {
    console.error(`Queue Redis connection graceful quit failed: ${error.message}`);
    connection.disconnect();
  }
};

module.exports = connection;
module.exports.closeQueueConnection = closeQueueConnection;
