const { emitEvent } = require('./producer');

const isTestProcess =
  process.env.NODE_ENV === 'test' || process.env.npm_lifecycle_event === 'test';

const emitKafkaEventSafely = (topic, event) => {
  if (isTestProcess) {
    return;
  }

  emitEvent(topic, event).catch((error) => {
    console.warn(`Kafka event emit failed for ${topic}: ${error.message}`);
  });
};

module.exports = {
  emitKafkaEventSafely
};
