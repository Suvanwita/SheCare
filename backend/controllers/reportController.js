const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const Report = require('../models/Report');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png']);

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Report not found', 404);
  }
};

const buildFilters = (query, userId) => {
  const filters = {
    user: userId
  };

  if (query.category) {
    filters.category = query.category;
  }

  if (query.doctorName) {
    filters.doctorName = query.doctorName;
  }

  if (query.mimeType) {
    filters.mimeType = query.mimeType;
  }

  return filters;
};

const removeLocalFile = async (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(path.resolve(filePath));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

const uploadReport = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw createError('Report file is required', 400);
  }

  if (!allowedMimeTypes.has(req.file.mimetype)) {
    await removeLocalFile(req.file.path);
    throw createError('Only PDF, JPG, and PNG files are supported', 400);
  }

  const title = req.body.title?.trim() || path.parse(req.file.originalname).name;

  const report = await Report.create({
    user: req.user._id,
    title,
    category: req.body.category,
    doctorName: req.body.doctorName,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    notes: req.body.notes
  });

  return successResponse(res, 201, 'Report uploaded successfully', {
    report
  });
});

const getReports = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;
  const filters = buildFilters(req.query, req.user._id);

  const [reports, total] = await Promise.all([
    Report.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Report.countDocuments(filters)
  ]);

  return successResponse(res, 200, 'Reports fetched successfully', {
    reports,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

const getReportById = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const report = await Report.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!report) {
    throw createError('Report not found', 404);
  }

  return successResponse(res, 200, 'Report fetched successfully', {
    report
  });
});

const deleteReport = asyncHandler(async (req, res) => {
  validateObjectId(req.params.id);

  const report = await Report.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!report) {
    throw createError('Report not found', 404);
  }

  await removeLocalFile(report.path);

  return successResponse(res, 200, 'Report deleted successfully', {
    id: req.params.id
  });
});

module.exports = {
  uploadReport,
  getReports,
  getReportById,
  deleteReport
};
