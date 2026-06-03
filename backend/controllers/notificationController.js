const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Notification not found', 404);
  }
};

const getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;
  const filters = {
    user: req.user._id
  };

  if (req.query.unread === 'true') {
    filters.isRead = false;
  }

  if (req.query.unread === 'false') {
    filters.isRead = true;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filters),
    Notification.countDocuments({ user: req.user._id, isRead: false })
  ]);

  return successResponse(res, 200, 'Notifications fetched successfully', {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id
    },
    {
      isRead: true
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!notification) {
    throw createError('Notification not found', 404);
  }

  return successResponse(res, 200, 'Notification marked read successfully', {
    notification
  });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    {
      user: req.user._id,
      isRead: false
    },
    {
      isRead: true
    }
  );

  return successResponse(res, 200, 'Notifications marked read successfully', {
    modifiedCount: result.modifiedCount
  });
});

const deleteNotification = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    throw createError('Notification not found', 404);
  }

  return successResponse(res, 200, 'Notification deleted successfully', {
    id: req.params.id
  });
});

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
};
