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

const closeAllQueues = async () => {
  await Promise.all(
    Object.values(queues).map((queue) => queue.close())
  );

  const connection = require('./connection');
  await connection.closeQueueConnection();
};

module.exports = {
  queueNames,
  defaultJobOptions,
  closeAllQueues,
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
