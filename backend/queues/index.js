const { Queue } = require('bullmq');
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

const queues = {};

const createQueue = (name) => {
  const connection = require('./connection');

  return new Queue(name, {
    connection,
    defaultJobOptions
  });
};

const getQueue = (name) => {
  if (!queues[name]) {
    queues[name] = createQueue(name);
  }

  return queues[name];
};

module.exports = {
  queueNames,
  defaultJobOptions,
  get reminderQueue() {
    return getQueue(queueNames.reminderQueue);
  },
  get notificationQueue() {
    return getQueue(queueNames.notificationQueue);
  },
  get emailQueue() {
    return getQueue(queueNames.emailQueue);
  },
  get analyticsQueue() {
    return getQueue(queueNames.analyticsQueue);
  }
};
