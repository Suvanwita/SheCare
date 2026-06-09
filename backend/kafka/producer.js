const kafka = require('./client');

let producer;
let isProducerConnected = false;

const getProducer = () => {
  if (!producer) {
    producer = kafka.producer();
  }

  return producer;
};

const connectProducer = async () => {
  const kafkaProducer = getProducer();

  if (isProducerConnected) {
    return kafkaProducer;
  }

  await kafkaProducer.connect();
  isProducerConnected = true;
  console.log('Kafka producer connected.');

  return kafkaProducer;
};

const normalizeEvent = (event) => ({
  eventType: event.eventType,
  entityId: event.entityId,
  userId: event.userId,
  role: event.role,
  timestamp: event.timestamp || new Date().toISOString(),
  payload: event.payload || {}
});

const emitEvent = async (topic, event) => {
  const kafkaProducer = await connectProducer();
  const normalizedEvent = normalizeEvent(event);

  await kafkaProducer.send({
    topic,
    messages: [
      {
        key: normalizedEvent.entityId ? String(normalizedEvent.entityId) : undefined,
        value: JSON.stringify(normalizedEvent)
      }
    ]
  });

  return normalizedEvent;
};

const disconnectProducer = async () => {
  if (!producer || !isProducerConnected) {
    return;
  }

  await producer.disconnect();
  isProducerConnected = false;
  console.log('Kafka producer disconnected.');
};

module.exports = {
  get producer() {
    return getProducer();
  },
  connectProducer,
  disconnectProducer,
  emitEvent
};
