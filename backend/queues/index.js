const { Queue } = require('bullmq');
const connection = require('./connection');
const queueNames = require('./queueNames');

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000
  },
  removeOnComplete: true,
  removeOnFail: false
};

const createQueue = (name) =>
  new Queue(name, {
    connection,
    defaultJobOptions
  });

const reminderQueue = createQueue(queueNames.reminderQueue);
const notificationQueue = createQueue(queueNames.notificationQueue);
const emailQueue = createQueue(queueNames.emailQueue);
const analyticsQueue = createQueue(queueNames.analyticsQueue);

module.exports = {
  queueNames,
  defaultJobOptions,
  reminderQueue,
  notificationQueue,
  emailQueue,
  analyticsQueue
};
