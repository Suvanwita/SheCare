const kafka = require('./client');

const createConsumer = ({ groupId }) => {
  if (!groupId) {
    throw new Error('Kafka consumer groupId is required.');
  }

  return kafka.consumer({ groupId });
};

const connectConsumer = async ({ groupId, topics, eachMessage }) => {
  const consumer = createConsumer({ groupId });
  const topicList = Array.isArray(topics) ? topics : [topics];

  await consumer.connect();

  for (const topic of topicList) {
    await consumer.subscribe({ topic, fromBeginning: false });
  }

  await consumer.run({ eachMessage });
  console.log(`Kafka consumer connected: ${groupId}`);

  return consumer;
};

module.exports = {
  createConsumer,
  connectConsumer
};
