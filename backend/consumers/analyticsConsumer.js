const dotenv = require('dotenv');

dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { connectConsumer } = require('../kafka/consumer');
const kafkaTopics = require('../kafka/topics');

const ANALYTICS_CONSUMER_GROUP_ID = 'shecare-analytics-consumer';

const analyticsTopics = [
  kafkaTopics.USER_EVENTS,
  kafkaTopics.APPOINTMENT_EVENTS,
  kafkaTopics.REMINDER_EVENTS,
  kafkaTopics.REPORT_EVENTS,
  kafkaTopics.PCOS_EVENTS,
  kafkaTopics.ARTICLE_EVENTS
];

const parseMessageValue = (message) => {
  if (!message.value) {
    return null;
  }

  try {
    return JSON.parse(message.value.toString());
  } catch (error) {
    console.error(`Malformed analytics Kafka event skipped: ${error.message}`);
    return null;
  }
};

const getValidObjectId = (value) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    return undefined;
  }

  return value;
};

const sanitizePcosPayload = (payload = {}) => ({
  riskLevel: payload.riskLevel,
  confidence: payload.confidence,
  createdAt: payload.createdAt
});

const sanitizePayload = (topic, payload = {}) => {
  if (topic === kafkaTopics.PCOS_EVENTS) {
    return sanitizePcosPayload(payload);
  }

  return payload;
};

const getOccurredAt = (event) => {
  const occurredAt = new Date(event.timestamp);

  if (Number.isNaN(occurredAt.getTime())) {
    return new Date();
  }

  return occurredAt;
};

const mapEventToAnalyticsEvent = (topic, event) => ({
  eventType: event.eventType || 'kafka.event',
  topic,
  user: getValidObjectId(event.userId),
  entityId: getValidObjectId(event.entityId),
  payload: sanitizePayload(topic, event.payload || {}),
  occurredAt: getOccurredAt(event)
});

const handleAnalyticsMessage = async ({ topic, message }) => {
  try {
    const event = parseMessageValue(message);

    if (!event) {
      return;
    }

    await AnalyticsEvent.create(mapEventToAnalyticsEvent(topic, event));
    console.log(`Analytics event saved: ${event.eventType || 'unknown'} from ${topic}`);
  } catch (error) {
    console.error(`Analytics event processing failed: ${error.message}`);
  }
};

const startAnalyticsConsumer = async () => {
  await connectDB();

  const consumer = await connectConsumer({
    groupId: ANALYTICS_CONSUMER_GROUP_ID,
    topics: analyticsTopics,
    eachMessage: handleAnalyticsMessage
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down analytics consumer.`);
    await consumer.disconnect();
    await mongoose.connection.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.log('Analytics consumer listening for Kafka events.');
};

if (require.main === module) {
  startAnalyticsConsumer().catch(async (error) => {
    console.error(`Analytics consumer startup failed: ${error.message}`);
    await mongoose.connection.close().catch(() => null);
    process.exit(1);
  });
}

module.exports = {
  handleAnalyticsMessage,
  startAnalyticsConsumer
};
