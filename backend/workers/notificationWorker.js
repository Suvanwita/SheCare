const dotenv = require('dotenv');

dotenv.config();

const mongoose = require('mongoose');
const { Worker } = require('bullmq');
const connectDB = require('../config/db');
const { connectRedis, closeRedis } = require('../config/redis');
const connection = require('../queues/connection');
const queueNames = require('../queues/queueNames');
const Notification = require('../models/Notification');
const User = require('../models/User');
const {
  NOTIFICATION_JOB_NAME,
  GLOBAL_ANNOUNCEMENT_JOB_NAME
} = require('../queues/producers/notificationProducer');

const INSERT_BATCH_SIZE = 500;

const createNotification = (data) => {
  return Notification.create({
    user: data.user,
    title: data.title,
    message: data.message,
    type: data.type || 'system',
    metadata: data.metadata
  });
};

const insertNotificationBatches = async (notifications) => {
  let createdCount = 0;

  for (let index = 0; index < notifications.length; index += INSERT_BATCH_SIZE) {
    const batch = notifications.slice(index, index + INSERT_BATCH_SIZE);
    const created = await Notification.insertMany(batch, { ordered: false });
    createdCount += created.length;
  }

  return createdCount;
};

const buildNotificationPayload = (data, userId) => ({
  user: userId,
  title: data.title,
  message: data.message,
  type: data.type || 'system',
  metadata: data.metadata
});

const createTargetedNotifications = async (data) => {
  const target = data.target || 'user';

  if (target === 'global') {
    const users = await User.find({ isActive: true }).select('_id').lean();
    const notifications = users.map((user) => buildNotificationPayload(data, user._id));
    const count = await insertNotificationBatches(notifications);

    console.log(`Global notification job created ${count} notifications.`);
    return {
      count,
      target
    };
  }

  if (target === 'users') {
    const validUserIds = (data.userIds || []).filter((userId) =>
      mongoose.Types.ObjectId.isValid(userId)
    );

    const users = await User.find({
      _id: { $in: validUserIds },
      isActive: true
    })
      .select('_id')
      .lean();

    const notifications = users.map((user) => buildNotificationPayload(data, user._id));
    const count = await insertNotificationBatches(notifications);

    console.log(`Targeted notification job created ${count} notifications.`);
    return {
      count,
      target
    };
  }

  const notification = await createNotification(data);

  return {
    count: 1,
    notificationId: notification._id.toString(),
    user: notification.user.toString(),
    target
  };
};

const processNotificationJob = async (job) => {
  if (job.name === GLOBAL_ANNOUNCEMENT_JOB_NAME) {
    return createTargetedNotifications({
      ...job.data,
      target: 'global'
    });
  }

  if (job.name !== NOTIFICATION_JOB_NAME) {
    throw new Error(`Unsupported notification job: ${job.name}`);
  }

  return createTargetedNotifications(job.data);
};

const startWorker = async () => {
  await connectDB();
  await connectRedis();

  const worker = new Worker(queueNames.notificationQueue, processNotificationJob, {
    connection
  });

  worker.on('completed', (job, result) => {
    const count = result && result.count !== undefined ? ` (${result.count} created)` : '';
    console.log(`Notification job completed: ${job.id}${count}`);
  });

  worker.on('failed', (job, error) => {
    console.error(`Notification job failed: ${job && job.id}: ${error.message}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down notification worker.`);
    await worker.close();
    await connection.closeQueueConnection();
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
    await connection.closeQueueConnection().catch(() => null);
    await closeRedis().catch(() => null);
    await mongoose.connection.close().catch(() => null);
    process.exit(1);
  });
}

module.exports = {
  processNotificationJob
};
