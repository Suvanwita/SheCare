const mongoose = require('mongoose');
const PCOSAssessment = require('../models/PCOSAssessment');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const { cacheKeys, deleteCache } = require('../utils/cache');
const kafkaTopics = require('../kafka/topics');
const { emitKafkaEventSafely } = require('../kafka/eventPublisher');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('PCOS assessment not found', 404);
  }
};

const getMlServiceUrl = () => {
  const url = process.env.ML_SERVICE_URL;

  if (!url) {
    throw createError('PCOS prediction service is temporarily unavailable.', 503);
  }

  return url.replace(/\/$/, '');
};

const invalidateAdminAnalyticsCacheSafely = () => {
  deleteCache(cacheKeys.adminAnalyticsOverview).catch((error) => {
    console.error(`Admin analytics cache invalidation failed: ${error.message}`);
  });
};

const emitPcosAssessmentCompleted = (assessment, user) => {
  emitKafkaEventSafely(kafkaTopics.PCOS_EVENTS, {
    eventType: 'pcos.assessment.completed',
    entityId: assessment._id,
    userId: assessment.user,
    role: user?.role,
    payload: {
      riskLevel: assessment.result?.risk_level,
      confidence: assessment.result?.confidence,
      createdAt: assessment.createdAt
    }
  });
};

const predictPcos = asyncHandler(async (req, res) => {
  let prediction;

  try {
    const response = await fetch(`${getMlServiceUrl()}/predict-pcos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error('ML service request failed');
    }

    prediction = await response.json();
  } catch (error) {
    throw createError('PCOS prediction service is temporarily unavailable.', 503);
  }

  const assessment = await PCOSAssessment.create({
    user: req.user._id,
    input: req.body,
    result: prediction
  });
  invalidateAdminAnalyticsCacheSafely();
  emitPcosAssessmentCompleted(assessment, req.user);

  return successResponse(res, 201, 'PCOS assessment completed successfully', {
    assessment
  });
});

const getPcosHistory = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const [assessments, total] = await Promise.all([
    PCOSAssessment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PCOSAssessment.countDocuments({ user: req.user._id })
  ]);

  return successResponse(res, 200, 'PCOS assessment history fetched successfully', {
    assessments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

const getPcosAssessmentById = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const assessment = await PCOSAssessment.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!assessment) {
    throw createError('PCOS assessment not found', 404);
  }

  return successResponse(res, 200, 'PCOS assessment fetched successfully', {
    assessment
  });
});

module.exports = {
  predictPcos,
  getPcosHistory,
  getPcosAssessmentById
};
