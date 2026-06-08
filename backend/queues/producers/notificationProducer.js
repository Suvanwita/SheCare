const queues = require('../index');

const NOTIFICATION_JOB_NAME = 'create-notification';
const GLOBAL_ANNOUNCEMENT_JOB_NAME = 'global-announcement';

const enqueueNotification = ({
  user,
  title,
  message,
  type,
  metadata,
  target,
  userIds
}) => {
  return queues.notificationQueue.add(NOTIFICATION_JOB_NAME, {
    user,
    title,
    message,
    type,
    metadata,
    target,
    userIds
  });
};

module.exports = {
  NOTIFICATION_JOB_NAME,
  GLOBAL_ANNOUNCEMENT_JOB_NAME,
  enqueueNotification
};
