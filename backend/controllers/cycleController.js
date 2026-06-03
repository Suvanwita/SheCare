const mongoose = require('mongoose');
const Cycle = require('../models/Cycle');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Cycle not found', 404);
  }
};

const getInclusiveDays = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return undefined;
  }

  return Math.max(
    1,
    Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / DAY_IN_MS) + 1
  );
};

const getAverage = (values, fallback) => {
  const validValues = values.filter((value) => typeof value === 'number' && !Number.isNaN(value));

  if (validValues.length === 0) {
    return fallback;
  }

  return Math.round(validValues.reduce((sum, value) => sum + value, 0) / validValues.length);
};

const addDays = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const pickCycleFields = (body) => {
  const payload = {};
  const allowedFields = ['startDate', 'endDate', 'flowIntensity', 'symptoms', 'notes'];

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  });

  return payload;
};

const getPreviousCycle = async (userId, startDate, excludedId) => {
  const query = {
    user: userId,
    startDate: { $lt: startDate }
  };

  if (excludedId) {
    query._id = { $ne: excludedId };
  }

  return Cycle.findOne(query).sort({ startDate: -1 });
};

const getAveragePreviousCycleLength = async (userId, startDate, excludedId) => {
  const query = {
    user: userId,
    cycleLength: { $type: 'number' },
    startDate: { $lt: startDate }
  };

  if (excludedId) {
    query._id = { $ne: excludedId };
  }

  const cycles = await Cycle.find(query).select('cycleLength');
  return getAverage(
    cycles.map((cycle) => cycle.cycleLength),
    28
  );
};

const buildCalculatedFields = async (userId, payload, excludedId) => {
  const startDate = new Date(payload.startDate);
  const endDate = payload.endDate ? new Date(payload.endDate) : undefined;

  if (Number.isNaN(startDate.getTime())) {
    throw createError('Start date is invalid', 400);
  }

  if (endDate && Number.isNaN(endDate.getTime())) {
    throw createError('End date is invalid', 400);
  }

  if (endDate && endDate < startDate) {
    throw createError('End date must be on or after start date', 400);
  }

  const [previousCycle, averagePreviousCycleLength] = await Promise.all([
    getPreviousCycle(userId, startDate, excludedId),
    getAveragePreviousCycleLength(userId, startDate, excludedId)
  ]);

  const cycleLength = previousCycle
    ? Math.max(1, Math.round((startDate.getTime() - previousCycle.startDate.getTime()) / DAY_IN_MS))
    : averagePreviousCycleLength;
  const periodDuration = getInclusiveDays(startDate, endDate);

  return {
    ...payload,
    startDate,
    endDate,
    cycleLength,
    periodDuration
  };
};

const getAnalyticsForUser = async (userId) => {
  const cycles = await Cycle.find({ user: userId }).sort({ startDate: 1 });
  const averageCycleLength = getAverage(
    cycles.map((cycle) => cycle.cycleLength),
    28
  );
  const averagePeriodDuration = getAverage(
    cycles.map((cycle) => cycle.periodDuration),
    0
  );
  const latestCycle = cycles[cycles.length - 1];

  return {
    averageCycleLength,
    averagePeriodDuration,
    irregularCycleCount: cycles.filter((cycle) => cycle.isIrregular).length,
    predictedNextPeriod: latestCycle
      ? latestCycle.predictedNextPeriod || addDays(latestCycle.startDate, averageCycleLength)
      : null,
    cycleLengthTrend: cycles.map((cycle) => ({
      cycleId: cycle._id,
      startDate: cycle.startDate,
      cycleLength: cycle.cycleLength,
      isIrregular: cycle.isIrregular
    }))
  };
};

const createCycle = asyncHandler(async (req, res) => {
  if (!req.body.startDate) {
    throw createError('Start date is required', 400);
  }

  const payload = pickCycleFields(req.body);
  const calculatedPayload = await buildCalculatedFields(req.user._id, payload);
  const cycle = await Cycle.create({
    ...calculatedPayload,
    user: req.user._id
  });

  return successResponse(res, 201, 'Cycle created successfully', {
    cycle
  });
});

const getCycles = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const [cycles, total] = await Promise.all([
    Cycle.find({ user: req.user._id }).sort({ startDate: -1 }).skip(skip).limit(limit),
    Cycle.countDocuments({ user: req.user._id })
  ]);

  return successResponse(res, 200, 'Cycles fetched successfully', {
    cycles,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

const getCycleAnalytics = asyncHandler(async (req, res) => {
  const analytics = await getAnalyticsForUser(req.user._id);

  return successResponse(res, 200, 'Cycle analytics fetched successfully', {
    analytics
  });
});

const getCycleById = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const cycle = await Cycle.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!cycle) {
    throw createError('Cycle not found', 404);
  }

  return successResponse(res, 200, 'Cycle fetched successfully', {
    cycle
  });
});

const updateCycle = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const existingCycle = await Cycle.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!existingCycle) {
    throw createError('Cycle not found', 404);
  }

  const payload = {
    startDate: existingCycle.startDate,
    endDate: existingCycle.endDate,
    flowIntensity: existingCycle.flowIntensity,
    symptoms: existingCycle.symptoms,
    notes: existingCycle.notes,
    ...pickCycleFields(req.body)
  };
  const calculatedPayload = await buildCalculatedFields(req.user._id, payload, req.params.id);
  const cycle = await Cycle.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id
    },
    calculatedPayload,
    {
      new: true,
      runValidators: true
    }
  );

  return successResponse(res, 200, 'Cycle updated successfully', {
    cycle
  });
});

const deleteCycle = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const cycle = await Cycle.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!cycle) {
    throw createError('Cycle not found', 404);
  }

  return successResponse(res, 200, 'Cycle deleted successfully', {
    id: req.params.id
  });
});

module.exports = {
  createCycle,
  getCycles,
  getCycleAnalytics,
  getCycleById,
  updateCycle,
  deleteCycle
};
