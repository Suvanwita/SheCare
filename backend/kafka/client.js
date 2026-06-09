const { Kafka, logLevel } = require('kafkajs');

const parseBrokers = (value) => {
  return String(value || 'localhost:9092')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);
};

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'shecare-backend',
  brokers: parseBrokers(process.env.KAFKA_BROKERS),
  connectionTimeout: Number(process.env.KAFKA_CONNECTION_TIMEOUT_MS) || 5000,
  requestTimeout: Number(process.env.KAFKA_REQUEST_TIMEOUT_MS) || 30000,
  retry: {
    retries: Number(process.env.KAFKA_RETRIES) || 3
  },
  logLevel: process.env.NODE_ENV === 'production' ? logLevel.WARN : logLevel.INFO
});

module.exports = kafka;
