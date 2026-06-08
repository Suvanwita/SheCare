const mongoose = require('mongoose');
const Reminder = require('../models/Reminder');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const {
  scheduleReminderJob,
  cancelReminderJob,
  rescheduleReminderJob
} = require('../queues/producers/reminderProducer');

const allowedFields = ['title', 'type', 'message', 'scheduledAt', 'repeat', 'priority', 'status'];

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Reminder not found', 404);
  }
};

const parseDate = (value, fieldName) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createError(`${fieldName} is invalid`, 400);
  }

  return date;
};

const pickReminderFields = (body) => {
  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }

    return payload;
  }, {});
};

const buildFilters = (query, userId) => {
  const filters = {
    user: userId
  };

  if (query.type) {
    filters.type = query.type;
  }

  if (query.status) {
    filters.status = query.status;
  }

  if (query.startDate || query.endDate) {
    filters.scheduledAt = {};

    if (query.startDate) {
      filters.scheduledAt.$gte = parseDate(query.startDate, 'Start date');
    }

    if (query.endDate) {
      const endDate = parseDate(query.endDate, 'End date');
      endDate.setHours(23, 59, 59, 999);
      filters.scheduledAt.$lte = endDate;
    }
  }

  return filters;
};

const createReminderNotification = (userId, reminder, title, message, action) => {
  return Notification.create({
    user: userId,
    title,
    message,
    type: 'reminder',
    metadata: {
      action,
      reminderId: reminder._id,
      reminderTitle: reminder.title,
      scheduledAt: reminder.scheduledAt
    }
  });
};

const createReminder = asyncHandler(async (req, res) => {
  if (!req.body.title) {
    throw createError('Title is required', 400);
  }

  if (!req.body.type) {
    throw createError('Type is required', 400);
  }

  if (!req.body.scheduledAt) {
    throw createError('Scheduled date is required', 400);
  }

  const payload = pickReminderFields(req.body);
  payload.scheduledAt = parseDate(payload.scheduledAt, 'Scheduled date');

  const reminder = await Reminder.create({
    ...payload,
    user: req.user._id
  });

  await createReminderNotification(
    req.user._id,
    reminder,
    `Reminder set: ${reminder.title}`,
    reminder.message || 'Your reminder has been scheduled.',
    'created'
  );
  await scheduleReminderJob(reminder);

  return successResponse(res, 201, 'Reminder created successfully', {
    reminder
  });
});

const getReminders = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;
  const filters = buildFilters(req.query, req.user._id);

  const [reminders, total] = await Promise.all([
    Reminder.find(filters).sort({ scheduledAt: 1, createdAt: -1 }).skip(skip).limit(limit),
    Reminder.countDocuments(filters)
  ]);

  return successResponse(res, 200, 'Reminders fetched successfully', {
    reminders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

const updateReminder = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const payload = pickReminderFields(req.body);

  if (payload.scheduledAt !== undefined) {
    payload.scheduledAt = parseDate(payload.scheduledAt, 'Scheduled date');
  }

  const reminder = await Reminder.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id
    },
    payload,
    {
      new: true,
      runValidators: true
    }
  );

  if (!reminder) {
    throw createError('Reminder not found', 404);
  }
  await rescheduleReminderJob(reminder);

  return successResponse(res, 200, 'Reminder updated successfully', {
    reminder
  });
});

const deleteReminder = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const reminder = await Reminder.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!reminder) {
    throw createError('Reminder not found', 404);
  }
  await cancelReminderJob(reminder._id);

  return successResponse(res, 200, 'Reminder deleted successfully', {
    id: req.params.id
  });
});

const completeReminder = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const reminder = await Reminder.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id
    },
    {
      status: 'completed'
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!reminder) {
    throw createError('Reminder not found', 404);
  }
  await cancelReminderJob(reminder._id);

  await createReminderNotification(
    req.user._id,
    reminder,
    `Completed: ${reminder.title}`,
    reminder.message || 'Reminder marked as completed.',
    'completed'
  );

  return successResponse(res, 200, 'Reminder marked complete successfully', {
    reminder
  });
});

module.exports = {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  completeReminder
};
