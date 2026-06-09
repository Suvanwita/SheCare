const dotenv = require('dotenv');

dotenv.config();

const mongoose = require('mongoose');
const { Worker } = require('bullmq');
const connectDB = require('../config/db');
const { connectRedis, closeRedis } = require('../config/redis');
const connection = require('../queues/connection');
const queueNames = require('../queues/queueNames');
const Reminder = require('../models/Reminder');
const { enqueueNotification } = require('../queues/producers/notificationProducer');

const MISSED_GRACE_MS = 60 * 60 * 1000;

const isRepeatReminder = (reminder) => reminder.repeat && reminder.repeat !== 'none';

const isStaleOneTimeReminder = (reminder) => {
  if (isRepeatReminder(reminder)) {
    return false;
  }

  return Date.now() - new Date(reminder.scheduledAt).getTime() > MISSED_GRACE_MS;
};

const enqueueReminderNotification = (reminder) => {
  return enqueueNotification({
    user: reminder.user,
    title: reminder.title,
    message: reminder.message || 'You have a reminder due now.',
    type: 'reminder',
    metadata: {
      action: 'due',
      reminderId: reminder._id,
      reminderTitle: reminder.title,
      scheduledAt: reminder.scheduledAt,
      repeat: reminder.repeat || 'none'
    }
  });
};

const processReminderJob = async (job) => {
  const reminderId = job.data.reminderId;
  const reminder = await Reminder.findById(reminderId);

  if (!reminder) {
    console.log(`Reminder job skipped; reminder not found: ${reminderId}`);
    return { skipped: true, reason: 'not_found' };
  }

  if (['cancelled', 'completed', 'missed'].includes(reminder.status)) {
    console.log(`Reminder job skipped; reminder ${reminderId} is ${reminder.status}.`);
    return { skipped: true, reason: reminder.status };
  }

  if (isStaleOneTimeReminder(reminder)) {
    reminder.status = 'missed';
    await reminder.save();
    console.log(`Reminder marked missed: ${reminderId}`);
    return { skipped: true, reason: 'missed' };
  }

  await enqueueReminderNotification(reminder);

  if (!isRepeatReminder(reminder)) {
    reminder.status = 'completed';
    await reminder.save();
  }

  return {
    reminderId,
    status: reminder.status
  };
};

const startWorker = async () => {
  await connectDB();
  await connectRedis();

  const worker = new Worker(queueNames.reminderQueue, processReminderJob, {
    connection
  });

  worker.on('completed', (job) => {
    console.log(`Reminder job completed: ${job.id}`);
  });

  worker.on('failed', (job, error) => {
    console.error(`Reminder job failed: ${job && job.id}: ${error.message}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down reminder worker.`);
    await worker.close();
    await connection.closeQueueConnection();
    await closeRedis();
    await mongoose.connection.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  console.log(`Reminder worker listening on queue: ${queueNames.reminderQueue}`);
};

if (require.main === module) {
  startWorker().catch(async (error) => {
    console.error(`Reminder worker startup failed: ${error.message}`);
    await connection.closeQueueConnection().catch(() => null);
    await closeRedis().catch(() => null);
    await mongoose.connection.close().catch(() => null);
    process.exit(1);
  });
}

module.exports = {
  processReminderJob
};
