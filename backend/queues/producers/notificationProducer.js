const queues = require('../index');

const NOTIFICATION_JOB_NAME = 'create-notification';
const GLOBAL_ANNOUNCEMENT_JOB_NAME = 'global-announcement';

const createQueueError = (message, error) => {
  const queueError = new Error(`${message}: ${error.message}`);
  queueError.statusCode = 503;
  return queueError;
};

const enqueueNotification = async ({
  user,
  title,
  message,
  type,
  metadata,
  target,
  userIds
}) => {
  try {
    return await queues.notificationQueue.add(NOTIFICATION_JOB_NAME, {
      user,
      title,
      message,
      type,
      metadata,
      target,
      userIds
    });
  } catch (error) {
    throw createQueueError('Notification queue enqueue failed. Check Redis availability', error);
  }
};

module.exports = {
  NOTIFICATION_JOB_NAME,
  GLOBAL_ANNOUNCEMENT_JOB_NAME,
  enqueueNotification
};
