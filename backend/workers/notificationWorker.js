const dotenv = require('dotenv');

dotenv.config();

const mongoose = require('mongoose');
const { Worker } = require('bullmq');
const connectDB = require('../config/db');
const { connectRedis, closeRedis } = require('../config/redis');
const connection = require('../queues/connection');
const queueNames = require('../queues/queueNames');
const Notification = require('../models/Notification');
const {
  NOTIFICATION_JOB_NAME,
  GLOBAL_ANNOUNCEMENT_JOB_NAME
} = require('../queues/producers/notificationProducer');

const createNotification = (data) => {
  return Notification.create({
    user: data.user,
    title: data.title,
    message: data.message,
    type: data.type || 'system',
    metadata: data.metadata
  });
};

const processNotificationJob = async (job) => {
  if (job.name === GLOBAL_ANNOUNCEMENT_JOB_NAME) {
    throw new Error('Global announcement jobs are not implemented yet.');
  }

  if (job.name !== NOTIFICATION_JOB_NAME) {
    throw new Error(`Unsupported notification job: ${job.name}`);
  }

  const notification = await createNotification(job.data);

  return {
    notificationId: notification._id.toString(),
    user: notification.user.toString()
  };
};

const startWorker = async () => {
  await connectDB();
  await connectRedis();

  const worker = new Worker(queueNames.notificationQueue, processNotificationJob, {
    connection
  });

  worker.on('completed', (job) => {
    console.log(`Notification job completed: ${job.id}`);
  });

  worker.on('failed', (job, error) => {
    console.error(`Notification job failed: ${job && job.id}: ${error.message}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down notification worker.`);
    await worker.close();
    await connection.quit();
    await closeRedis();
    await mongoose.connection.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.log(`Notification worker listening on queue: ${queueNames.notificationQueue}`);
};

if (require.main === module) {
  startWorker().catch(async (error) => {
    console.error(`Notification worker startup failed: ${error.message}`);
    await connection.quit().catch(() => null);
    await closeRedis().catch(() => null);
    await mongoose.connection.close().catch(() => null);
    process.exit(1);
  });
}

module.exports = {
  processNotificationJob
};
