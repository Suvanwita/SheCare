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
  logLevel: logLevel.INFO
});

module.exports = kafka;
