const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const { cacheKeys, deleteByPattern, getCache, setCache } = require('../utils/cache');

const DOCTORS_CACHE_TTL_SECONDS = 5 * 60;

const allowedFields = [
  'user',
  'name',
  'specialization',
  'experienceYears',
  'rating',
  'location',
  'consultationFee',
  'availableSlots',
  'bio',
  'isVerified'
];

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Doctor not found', 404);
  }
};

const requireAdmin = (user) => {
  if (!user || user.role !== 'admin') {
    throw createError('Admin access required', 403);
  }
};

const pickDoctorFields = (body) => {
  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }

    return payload;
  }, {});
};

const buildFilters = (query) => {
  const filters = {};

  if (query.specialization) {
    filters.specialization = query.specialization;
  }

  if (query.location) {
    filters.location = query.location;
  }

  if (query.minRating) {
    const minRating = Number(query.minRating);

    if (Number.isNaN(minRating)) {
      throw createError('Minimum rating is invalid', 400);
    }

    filters.rating = { $gte: minRating };
  }

  return filters;
};

const getStableQueryKey = (query) => {
  const entries = Object.keys(query)
    .sort()
    .map((key) => [key, query[key]]);

  return JSON.stringify(entries);
};

const getDoctorsCacheKey = (query) => {
  const queryKey = getStableQueryKey(query);

  return queryKey === '[]'
    ? cacheKeys.doctorsList
    : `${cacheKeys.doctorsList}:${queryKey}`;
};

const invalidateDoctorCacheSafely = () => {
  deleteByPattern(`${cacheKeys.doctorsList}*`).catch((error) => {
    console.error(`Doctor cache invalidation failed: ${error.message}`);
  });
};

const getDoctors = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
  const skip = (page - 1) * limit;
  const filters = buildFilters(req.query);
  const cacheKey = getDoctorsCacheKey(req.query);
  const cachedData = await getCache(cacheKey);

  if (cachedData) {
    return successResponse(res, 200, 'Doctors fetched successfully', cachedData);
  }

  const [doctors, total] = await Promise.all([
    Doctor.find(filters).sort({ rating: -1, name: 1 }).skip(skip).limit(limit).lean(),
    Doctor.countDocuments(filters)
  ]);

  const data = {
    doctors,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };

  await setCache(cacheKey, data, DOCTORS_CACHE_TTL_SECONDS);

  return successResponse(res, 200, 'Doctors fetched successfully', data);
});

const getDoctorById = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw createError('Doctor not found', 404);
  }

  return successResponse(res, 200, 'Doctor fetched successfully', {
    doctor
  });
});

const createDoctor = asyncHandler(async (req, res) => {
  requireAdmin(req.user);

  if (!req.body.name) {
    throw createError('Name is required', 400);
  }

  if (!req.body.specialization) {
    throw createError('Specialization is required', 400);
  }

  const payload = pickDoctorFields(req.body);
  const doctor = await Doctor.create(payload);
  invalidateDoctorCacheSafely();

  return successResponse(res, 201, 'Doctor created successfully', {
    doctor
  });
});

const updateDoctor = asyncHandler(async (req, res) => {
  requireAdmin(req.user);
  validateObjectId(req.params.id);

  const payload = pickDoctorFields(req.body);
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  if (!doctor) {
    throw createError('Doctor not found', 404);
  }
  invalidateDoctorCacheSafely();

  return successResponse(res, 200, 'Doctor updated successfully', {
    doctor
  });
});

const deleteDoctor = asyncHandler(async (req, res) => {
  requireAdmin(req.user);
  validateObjectId(req.params.id);

  const doctor = await Doctor.findByIdAndDelete(req.params.id);

  if (!doctor) {
    throw createError('Doctor not found', 404);
  }
  invalidateDoctorCacheSafely();

  return successResponse(res, 200, 'Doctor deleted successfully', {
    id: req.params.id
  });
});

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
};
