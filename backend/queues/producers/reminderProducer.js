const queues = require('../index');

const REMINDER_JOB_NAME = 'send-reminder';

const createQueueError = (message, error) => {
  const queueError = new Error(`${message}: ${error.message}`);
  queueError.statusCode = 503;
  return queueError;
};

const getReminderId = (reminder) => reminder._id.toString();

const getReminderJobData = (reminder) => ({
  reminderId: getReminderId(reminder),
  userId: reminder.user.toString(),
  scheduledAt: reminder.scheduledAt,
  repeat: reminder.repeat || 'none'
});

const getDelay = (scheduledAt) => {
  const scheduledTime = new Date(scheduledAt).getTime();

  if (Number.isNaN(scheduledTime)) {
    return 0;
  }

  return Math.max(scheduledTime - Date.now(), 0);
};

const getRepeatKey = (reminderId) => `reminder:${reminderId}`;

const getRepeatPattern = (scheduledAt, repeat) => {
  const date = new Date(scheduledAt);
  const minute = date.getMinutes();
  const hour = date.getHours();

  if (repeat === 'daily') {
    return `${minute} ${hour} * * *`;
  }

  if (repeat === 'weekly') {
    return `${minute} ${hour} * * ${date.getDay()}`;
  }

  if (repeat === 'monthly') {
    return `${minute} ${hour} ${date.getDate()} * *`;
  }

  return null;
};

const getRepeatOptions = (reminder) => {
  const reminderId = getReminderId(reminder);
  const repeat = reminder.repeat || 'none';
  const pattern = getRepeatPattern(reminder.scheduledAt, repeat);

  if (!pattern) {
    return null;
  }

  return {
    key: getRepeatKey(reminderId),
    pattern,
    startDate: new Date(reminder.scheduledAt)
  };
};

const removeJobById = async (jobId) => {
  let job;

  try {
    job = await queues.reminderQueue.getJob(jobId);
  } catch (error) {
    throw createQueueError('Reminder queue lookup failed. Check Redis availability', error);
  }

  if (job) {
    try {
      await job.remove();
    } catch (error) {
      throw createQueueError('Reminder queue job removal failed. Check Redis availability', error);
    }
  }
};

const cancelReminderJob = async (reminderId) => {
  const jobId = reminderId.toString();

  try {
    await Promise.all([
      removeJobById(jobId),
      queues.reminderQueue.removeRepeatableByKey(getRepeatKey(jobId))
    ]);
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw createQueueError('Reminder queue cancellation failed. Check Redis availability', error);
  }
};

const scheduleReminderJob = async (reminder) => {
  const jobId = getReminderId(reminder);
  const repeat = getRepeatOptions(reminder);

  await cancelReminderJob(jobId);

  try {
    return await queues.reminderQueue.add(REMINDER_JOB_NAME, getReminderJobData(reminder), {
      ...queues.defaultJobOptions,
      jobId,
      delay: repeat ? undefined : getDelay(reminder.scheduledAt),
      repeat: repeat || undefined
    });
  } catch (error) {
    throw createQueueError('Reminder queue scheduling failed. Check Redis availability', error);
  }
};

const rescheduleReminderJob = async (reminder) => {
  if (reminder.status === 'cancelled' || reminder.status === 'completed') {
    await cancelReminderJob(getReminderId(reminder));
    return null;
  }

  return scheduleReminderJob(reminder);
};

module.exports = {
  scheduleReminderJob,
  cancelReminderJob,
  rescheduleReminderJob
};
