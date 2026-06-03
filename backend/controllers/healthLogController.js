const mongoose = require('mongoose');
const HealthLog = require('../models/HealthLog');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const allowedFields = [
  'date',
  'mood',
  'symptoms',
  'sleepHours',
  'waterIntake',
  'weightKg',
  'painLevel',
  'stressLevel',
  'notes'
];

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const pickHealthLogFields = (body) => {
  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }

    return payload;
  }, {});
};

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Health log not found', 404);
  }
};

const buildFilters = (query, userId) => {
  const filters = {
    user: userId
  };

  if (query.mood) {
    filters.mood = query.mood;
  }

  if (query.symptom) {
    filters.symptoms = query.symptom;
  }

  if (query.startDate || query.endDate) {
    filters.date = {};

    if (query.startDate) {
      filters.date.$gte = new Date(query.startDate);
    }

    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      filters.date.$lte = endDate;
    }
  }

  return filters;
};

const createHealthLog = asyncHandler(async (req, res) => {
  const { date } = req.body;

  if (!date) {
    throw createError('Date is required', 400);
  }

  const payload = pickHealthLogFields(req.body);
  const healthLog = await HealthLog.create({
    ...payload,
    user: req.user._id
  });

  return successResponse(res, 201, 'Health log created successfully', {
    healthLog
  });
});

const getHealthLogs = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const filters = buildFilters(req.query, req.user._id);

  const [healthLogs, total] = await Promise.all([
    HealthLog.find(filters).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit),
    HealthLog.countDocuments(filters)
  ]);

  return successResponse(res, 200, 'Health logs fetched successfully', {
    healthLogs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

const getHealthLogById = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const healthLog = await HealthLog.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!healthLog) {
    throw createError('Health log not found', 404);
  }

  return successResponse(res, 200, 'Health log fetched successfully', {
    healthLog
  });
});

const updateHealthLog = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const payload = pickHealthLogFields(req.body);
  const healthLog = await HealthLog.findOneAndUpdate(
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

  if (!healthLog) {
    throw createError('Health log not found', 404);
  }

  return successResponse(res, 200, 'Health log updated successfully', {
    healthLog
  });
});

const deleteHealthLog = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const healthLog = await HealthLog.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!healthLog) {
    throw createError('Health log not found', 404);
  }

  return successResponse(res, 200, 'Health log deleted successfully', {
    id: req.params.id
  });
});

module.exports = {
  createHealthLog,
  getHealthLogs,
  getHealthLogById,
  updateHealthLog,
  deleteHealthLog
};
