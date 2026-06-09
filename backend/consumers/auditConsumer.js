const dotenv = require('dotenv');

dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const AuditLog = require('../models/AuditLog');
const { connectConsumer } = require('../kafka/consumer');
const kafkaTopics = require('../kafka/topics');

const AUDIT_CONSUMER_GROUP_ID = 'shecare-audit-consumer';

const parseMessageValue = (message) => {
  if (!message.value) {
    return null;
  }

  try {
    return JSON.parse(message.value.toString());
  } catch (error) {
    console.error(`Malformed audit Kafka event skipped: ${error.message}`);
    return null;
  }
};

const getValidObjectId = (value) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    return undefined;
  }

  return value;
};

const getEntityFromEvent = (topic, event) => {
  if (event.payload?.entity) {
    return event.payload.entity;
  }

  if (topic === kafkaTopics.ADMIN_EVENTS) {
    return 'admin';
  }

  return 'audit';
};

const mapEventToAuditLog = (topic, event) => ({
  user: getValidObjectId(event.userId || event.payload?.user),
  action: event.eventType || event.payload?.action || 'kafka.event',
  entity: getEntityFromEvent(topic, event),
  entityId: getValidObjectId(event.entityId || event.payload?.entityId),
  metadata: {
    topic,
    timestamp: event.timestamp,
    payload: event.payload || {}
  },
  ipAddress: event.payload?.ipAddress || event.payload?.payload?.ipAddress,
  userAgent: event.payload?.userAgent || event.payload?.payload?.userAgent
});

const handleAuditMessage = async ({ topic, message }) => {
  try {
    const event = parseMessageValue(message);

    if (!event) {
      return;
    }

    await AuditLog.create(mapEventToAuditLog(topic, event));
    console.log(`Audit event saved: ${event.eventType || 'unknown'} from ${topic}`);
  } catch (error) {
    console.error(`Audit event processing failed: ${error.message}`);
  }
};

const startAuditConsumer = async () => {
  await connectDB();

  const consumer = await connectConsumer({
    groupId: AUDIT_CONSUMER_GROUP_ID,
    topics: [kafkaTopics.AUDIT_EVENTS, kafkaTopics.ADMIN_EVENTS],
    eachMessage: handleAuditMessage
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down audit consumer.`);
    await consumer.disconnect();
    await mongoose.connection.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.log('Audit consumer listening for Kafka events.');
};

if (require.main === module) {
  startAuditConsumer().catch(async (error) => {
    console.error(`Audit consumer startup failed: ${error.message}`);
    await mongoose.connection.close().catch(() => null);
    process.exit(1);
  });
}

module.exports = {
  handleAuditMessage,
  startAuditConsumer
};
