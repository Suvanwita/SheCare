const asyncHandler = require('../middleware/asyncHandler');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

const allowedDoctorFields = [
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

const pickDoctorFields = (body) => {
  return allowedDoctorFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }

    return payload;
  }, {});
};

const validateDoctorId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Doctor not found', 404);
  }
};

const parseBoolean = (value) => {
  if (value === undefined || value === 'all') {
    return undefined;
  }

  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  return undefined;
};

const buildDoctorFilters = (query) => {
  const filters = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filters.$or = [
      { name: searchRegex },
      { specialization: searchRegex },
      { location: searchRegex }
    ];
  }

  if (query.specialization && query.specialization !== 'all') {
    filters.specialization = query.specialization;
  }

  const isVerified = parseBoolean(query.isVerified);

  if (isVerified !== undefined) {
    filters.isVerified = isVerified;
  }

  return filters;
};

const getAdminHealth = asyncHandler(async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Admin module is active',
    data: {
      admin: req.user.fullName
    },
    admin: req.user.fullName
  });
});

const getAdminDoctors = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const filters = buildDoctorFilters(req.query);

  const [doctors, total] = await Promise.all([
    Doctor.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Doctor.countDocuments(filters)
  ]);

  return res.status(200).json({
    success: true,
    message: 'Admin doctors fetched successfully',
    data: {
      doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const createAdminDoctor = asyncHandler(async (req, res) => {
  if (!req.body.name) {
    throw createError('Doctor name is required', 400);
  }

  if (!req.body.specialization) {
    throw createError('Doctor specialization is required', 400);
  }

  const doctor = await Doctor.create(pickDoctorFields(req.body));

  return res.status(201).json({
    success: true,
    message: 'Doctor created successfully',
    data: {
      doctor
    }
  });
});

const getAdminDoctorById = asyncHandler(async (req, res) => {
  validateDoctorId(req.params.id);

  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    throw createError('Doctor not found', 404);
  }

  return res.status(200).json({
    success: true,
    message: 'Doctor fetched successfully',
    data: {
      doctor
    }
  });
});

const updateAdminDoctor = asyncHandler(async (req, res) => {
  validateDoctorId(req.params.id);

  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    pickDoctorFields(req.body),
    {
      new: true,
      runValidators: true
    }
  );

  if (!doctor) {
    throw createError('Doctor not found', 404);
  }

  return res.status(200).json({
    success: true,
    message: 'Doctor updated successfully',
    data: {
      doctor
    }
  });
});

const deleteAdminDoctor = asyncHandler(async (req, res) => {
  validateDoctorId(req.params.id);

  const doctor = await Doctor.findByIdAndDelete(req.params.id);

  if (!doctor) {
    throw createError('Doctor not found', 404);
  }

  return res.status(200).json({
    success: true,
    message: 'Doctor deleted successfully',
    data: {
      id: req.params.id
    }
  });
});

const verifyAdminDoctor = asyncHandler(async (req, res) => {
  validateDoctorId(req.params.id);

  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { isVerified: true },
    {
      new: true,
      runValidators: true
    }
  );

  if (!doctor) {
    throw createError('Doctor not found', 404);
  }

  return res.status(200).json({
    success: true,
    message: 'Doctor verified successfully',
    data: {
      doctor
    }
  });
});

const unverifyAdminDoctor = asyncHandler(async (req, res) => {
  validateDoctorId(req.params.id);

  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    { isVerified: false },
    {
      new: true,
      runValidators: true
    }
  );

  if (!doctor) {
    throw createError('Doctor not found', 404);
  }

  return res.status(200).json({
    success: true,
    message: 'Doctor unverified successfully',
    data: {
      doctor
    }
  });
});

const getAdminDoctorAppointments = asyncHandler(async (req, res) => {
  validateDoctorId(req.params.id);

  const doctor = await Doctor.findById(req.params.id).select('_id name specialization');

  if (!doctor) {
    throw createError('Doctor not found', 404);
  }

  const appointments = await Appointment.find({ doctor: req.params.id })
    .populate('user', 'fullName email phone')
    .populate('doctor', 'name specialization location')
    .sort({ date: -1, createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: 'Doctor appointments fetched successfully',
    data: {
      doctor,
      appointments
    }
  });
});

module.exports = {
  createAdminDoctor,
  deleteAdminDoctor,
  getAdminDoctorAppointments,
  getAdminDoctorById,
  getAdminDoctors,
  getAdminHealth,
  unverifyAdminDoctor,
  updateAdminDoctor,
  verifyAdminDoctor
};
