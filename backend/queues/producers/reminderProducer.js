const queues = require('../index');

const REMINDER_JOB_NAME = 'send-reminder';

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
  const job = await queues.reminderQueue.getJob(jobId);

  if (job) {
    await job.remove();
  }
};

const cancelReminderJob = async (reminderId) => {
  const jobId = reminderId.toString();

  await Promise.all([
    removeJobById(jobId),
    queues.reminderQueue.removeRepeatableByKey(getRepeatKey(jobId)).catch(() => null)
  ]);
};

const scheduleReminderJob = async (reminder) => {
  const jobId = getReminderId(reminder);
  const repeat = getRepeatOptions(reminder);

  await cancelReminderJob(jobId);

  return queues.reminderQueue.add(REMINDER_JOB_NAME, getReminderJobData(reminder), {
    ...queues.defaultJobOptions,
    jobId,
    delay: repeat ? undefined : getDelay(reminder.scheduledAt),
    repeat: repeat || undefined
  });
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
