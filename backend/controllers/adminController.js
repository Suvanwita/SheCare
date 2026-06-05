const asyncHandler = require('../middleware/asyncHandler');
const fs = require('fs/promises');
const mongoose = require('mongoose');
const path = require('path');
const Article = require('../models/Article');
const Appointment = require('../models/Appointment');
const Cycle = require('../models/Cycle');
const Doctor = require('../models/Doctor');
const HealthLog = require('../models/HealthLog');
const Notification = require('../models/Notification');
const PCOSAssessment = require('../models/PCOSAssessment');
const Report = require('../models/Report');
const Session = require('../models/Session');
const User = require('../models/User');
const { buildArticleTrie } = require('../utils/trie/articleTrie');

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

const allowedArticleFields = [
  'title',
  'slug',
  'category',
  'summary',
  'content',
  'coverImage',
  'tags',
  'keywords',
  'readingTime',
  'author',
  'featured',
  'isPublished'
];

const allowedRoles = new Set(['user', 'doctor', 'admin']);

const articleCsvPath = path.resolve(
  __dirname,
  '../../ml-model/article-service/data/articles.csv'
);

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

const pickArticleFields = (body) => {
  return allowedArticleFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }

    return payload;
  }, {});
};

const generateSlug = (title) => {
  return String(title || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const validateDoctorId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Doctor not found', 404);
  }
};

const validateArticleId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Article not found', 404);
  }
};

const validateUserId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('User not found', 404);
  }
};

const isSelf = (req, id) => String(req.user._id) === String(id);

const ensureUniqueArticleSlug = async (slug, articleId) => {
  const existingArticle = await Article.findOne({
    slug,
    ...(articleId ? { _id: { $ne: articleId } } : {})
  });

  if (existingArticle) {
    throw createError('Article slug already exists', 409);
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

const buildArticleFilters = (query) => {
  const filters = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filters.$or = [
      { title: searchRegex },
      { category: searchRegex },
      { summary: searchRegex },
      { tags: searchRegex },
      { keywords: searchRegex }
    ];
  }

  if (query.category && query.category !== 'all') {
    filters.category = query.category;
  }

  const isPublished = parseBoolean(query.isPublished);

  if (isPublished !== undefined) {
    filters.isPublished = isPublished;
  }

  const featured = parseBoolean(query.featured);

  if (featured !== undefined) {
    filters.featured = featured;
  }

  return filters;
};

const buildUserFilters = (query) => {
  const filters = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filters.$or = [{ fullName: searchRegex }, { email: searchRegex }];
  }

  if (query.role && query.role !== 'all') {
    filters.role = query.role;
  }

  const isActive = parseBoolean(query.isActive);

  if (isActive !== undefined) {
    filters.isActive = isActive;
  }

  return filters;
};

const rebuildArticleTrieSafely = () => {
  buildArticleTrie().catch((error) => {
    console.error(`Admin article trie rebuild failed: ${error.message}`);
  });
};

const getArticleMlServiceUrl = () => {
  return (process.env.ARTICLE_ML_SERVICE_URL || 'http://localhost:8002').replace(
    /\/$/,
    ''
  );
};

const escapeCsvValue = (value) => {
  if (Array.isArray(value)) {
    return escapeCsvValue(value.join(','));
  }

  const stringValue = value === undefined || value === null ? '' : String(value);
  const escapedValue = stringValue.replace(/"/g, '""');

  return `"${escapedValue}"`;
};

const mapArticleToCsvRow = (article) => {
  return [
    article._id,
    article.slug,
    article.title,
    article.category,
    article.summary,
    article.content,
    article.tags || [],
    article.keywords || [],
    article.readingTime,
    article.coverImage
  ]
    .map(escapeCsvValue)
    .join(',');
};

const buildDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) {
    return undefined;
  }

  const range = {};

  if (startDate) {
    range.$gte = new Date(startDate);
  }

  if (endDate) {
    range.$lte = new Date(endDate);
  }

  return range;
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

const validateAppointmentId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Appointment not found', 404);
  }
};

const validateReportId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError('Report not found', 404);
  }
};

const buildAppointmentFilters = (query) => {
  const filters = {};

  if (query.doctor) {
    filters.doctor = query.doctor;
  }

  if (query.status && query.status !== 'all') {
    filters.status = query.status;
  }

  if (query.appointmentType && query.appointmentType !== 'all') {
    filters.appointmentType = query.appointmentType;
  }

  const dateRange = buildDateRange(query.startDate, query.endDate);

  if (dateRange) {
    filters.date = dateRange;
  }

  return filters;
};

const buildReportFilters = (query) => {
  const filters = {};

  if (query.user) {
    filters.user = query.user;
  }

  if (query.category && query.category !== 'all') {
    filters.category = query.category;
  }

  if (query.mimeType && query.mimeType !== 'all') {
    filters.mimeType = query.mimeType;
  }

  const dateRange = buildDateRange(query.startDate, query.endDate);

  if (dateRange) {
    filters.createdAt = dateRange;
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

const getAdminArticles = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const filters = buildArticleFilters(req.query);

  const [articles, total] = await Promise.all([
    Article.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Article.countDocuments(filters)
  ]);

  return res.status(200).json({
    success: true,
    message: 'Admin articles fetched successfully',
    data: {
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const createAdminArticle = asyncHandler(async (req, res) => {
  if (!req.body.title) {
    throw createError('Article title is required', 400);
  }

  if (!req.body.category) {
    throw createError('Article category is required', 400);
  }

  if (!req.body.summary) {
    throw createError('Article summary is required', 400);
  }

  if (!req.body.content) {
    throw createError('Article content is required', 400);
  }

  const payload = pickArticleFields(req.body);
  payload.slug = payload.slug ? generateSlug(payload.slug) : generateSlug(payload.title);

  if (!payload.slug) {
    throw createError('Article slug could not be generated', 400);
  }

  await ensureUniqueArticleSlug(payload.slug);

  const article = await Article.create(payload);
  rebuildArticleTrieSafely();

  return res.status(201).json({
    success: true,
    message: 'Article created successfully',
    data: {
      article
    }
  });
});

const getAdminArticleById = asyncHandler(async (req, res) => {
  validateArticleId(req.params.id);

  const article = await Article.findById(req.params.id);

  if (!article) {
    throw createError('Article not found', 404);
  }

  return res.status(200).json({
    success: true,
    message: 'Article fetched successfully',
    data: {
      article
    }
  });
});

const updateAdminArticle = asyncHandler(async (req, res) => {
  validateArticleId(req.params.id);

  const payload = pickArticleFields(req.body);

  if (payload.slug) {
    payload.slug = generateSlug(payload.slug);
    await ensureUniqueArticleSlug(payload.slug, req.params.id);
  } else if (payload.title) {
    payload.slug = generateSlug(payload.title);
    await ensureUniqueArticleSlug(payload.slug, req.params.id);
  }

  const article = await Article.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  if (!article) {
    throw createError('Article not found', 404);
  }

  rebuildArticleTrieSafely();

  return res.status(200).json({
    success: true,
    message: 'Article updated successfully',
    data: {
      article
    }
  });
});

const deleteAdminArticle = asyncHandler(async (req, res) => {
  validateArticleId(req.params.id);

  const article = await Article.findByIdAndDelete(req.params.id);

  if (!article) {
    throw createError('Article not found', 404);
  }

  rebuildArticleTrieSafely();

  return res.status(200).json({
    success: true,
    message: 'Article deleted successfully',
    data: {
      id: req.params.id
    }
  });
});

const updateAdminArticleFlag = (field, value, message) =>
  asyncHandler(async (req, res) => {
    validateArticleId(req.params.id);

    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { [field]: value },
      {
        new: true,
        runValidators: true
      }
    );

    if (!article) {
      throw createError('Article not found', 404);
    }

    rebuildArticleTrieSafely();

    return res.status(200).json({
      success: true,
      message,
      data: {
        article
      }
    });
  });

const publishAdminArticle = updateAdminArticleFlag(
  'isPublished',
  true,
  'Article published successfully'
);

const unpublishAdminArticle = updateAdminArticleFlag(
  'isPublished',
  false,
  'Article unpublished successfully'
);

const featureAdminArticle = updateAdminArticleFlag(
  'featured',
  true,
  'Article featured successfully'
);

const unfeatureAdminArticle = updateAdminArticleFlag(
  'featured',
  false,
  'Article unfeatured successfully'
);

const refreshAdminArticleSearch = asyncHandler(async (req, res) => {
  await buildArticleTrie();

  return res.status(200).json({
    success: true,
    message: 'Article search suggestions refreshed successfully',
    data: {
      refreshed: true
    }
  });
});

const exportAdminArticlesCsv = asyncHandler(async (req, res) => {
  const articles = await Article.find({ isPublished: true }).sort({ createdAt: -1 });
  const header = [
    'article_id',
    'slug',
    'title',
    'category',
    'summary',
    'content',
    'tags',
    'keywords',
    'reading_time',
    'cover_image'
  ].join(',');
  const csvContent = [header, ...articles.map(mapArticleToCsvRow)].join('\n');

  await fs.mkdir(path.dirname(articleCsvPath), { recursive: true });
  await fs.writeFile(articleCsvPath, `${csvContent}\n`, 'utf8');

  return res.status(200).json({
    success: true,
    message: 'Article CSV exported successfully',
    data: {
      count: articles.length,
      path: articleCsvPath
    }
  });
});

const retrainAdminArticleRecommender = asyncHandler(async (req, res) => {
  try {
    const response = await fetch(`${getArticleMlServiceUrl()}/retrain-recommender`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error('Article-service retrain endpoint returned an error');
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      message: 'Article recommender retrain triggered successfully',
      data
    });
  } catch (error) {
    return res.status(202).json({
      success: true,
      message:
        'Article-service retrain endpoint is not available. Export CSV, then run train_recommender.py inside ml-model/article-service.',
      data: {
        available: false
      }
    });
  }
});

const getAdminUsers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const filters = buildUserFilters(req.query);

  const [users, total] = await Promise.all([
    User.find(filters)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filters)
  ]);

  return res.status(200).json({
    success: true,
    message: 'Admin users fetched successfully',
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const getAdminUserById = asyncHandler(async (req, res) => {
  validateUserId(req.params.id);

  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw createError('User not found', 404);
  }

  return res.status(200).json({
    success: true,
    message: 'User fetched successfully',
    data: {
      user
    }
  });
});

const updateAdminUserRole = asyncHandler(async (req, res) => {
  validateUserId(req.params.id);

  const { role } = req.body;

  if (!allowedRoles.has(role)) {
    throw createError('Invalid role', 400);
  }

  if (isSelf(req, req.params.id) && role !== 'admin') {
    throw createError('You cannot remove your own admin role', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    throw createError('User not found', 404);
  }

  return res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: {
      user
    }
  });
});

const activateAdminUser = asyncHandler(async (req, res) => {
  validateUserId(req.params.id);

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    throw createError('User not found', 404);
  }

  return res.status(200).json({
    success: true,
    message: 'User activated successfully',
    data: {
      user
    }
  });
});

const deactivateAdminUser = asyncHandler(async (req, res) => {
  validateUserId(req.params.id);

  if (isSelf(req, req.params.id)) {
    throw createError('You cannot deactivate your own account', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    throw createError('User not found', 404);
  }

  await Session.updateMany({ user: req.params.id }, { isRevoked: true });

  return res.status(200).json({
    success: true,
    message: 'User deactivated successfully',
    data: {
      user
    }
  });
});

const getAdminUserSessions = asyncHandler(async (req, res) => {
  validateUserId(req.params.id);

  const user = await User.findById(req.params.id).select('_id fullName email role');

  if (!user) {
    throw createError('User not found', 404);
  }

  const sessions = await Session.find({ user: req.params.id }).sort({
    createdAt: -1
  });

  return res.status(200).json({
    success: true,
    message: 'User sessions fetched successfully',
    data: {
      user,
      sessions
    }
  });
});

const revokeAdminUserSessions = asyncHandler(async (req, res) => {
  validateUserId(req.params.id);

  const user = await User.findById(req.params.id).select('_id fullName email role');

  if (!user) {
    throw createError('User not found', 404);
  }

  const result = await Session.updateMany(
    { user: req.params.id, isRevoked: false },
    { isRevoked: true }
  );

  return res.status(200).json({
    success: true,
    message: 'User sessions revoked successfully',
    data: {
      modifiedCount: result.modifiedCount || 0
    }
  });
});

const deleteAdminUser = asyncHandler(async (req, res) => {
  validateUserId(req.params.id);

  if (isSelf(req, req.params.id)) {
    throw createError('You cannot delete your own account', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    throw createError('User not found', 404);
  }

  await Session.updateMany({ user: req.params.id }, { isRevoked: true });

  return res.status(200).json({
    success: true,
    message: 'User soft deleted successfully',
    data: {
      user
    }
  });
});

const getAdminAppointments = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const filters = buildAppointmentFilters(req.query);

  const [appointments, total] = await Promise.all([
    Appointment.find(filters)
      .populate('user', 'fullName email phone')
      .populate('doctor', 'name specialization location')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Appointment.countDocuments(filters)
  ]);

  return res.status(200).json({
    success: true,
    message: 'Admin appointments fetched successfully',
    data: {
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const updateAdminAppointmentStatus = asyncHandler(async (req, res) => {
  validateAppointmentId(req.params.id);

  const allowedStatuses = new Set(['pending', 'confirmed', 'completed', 'cancelled']);

  if (!allowedStatuses.has(req.body.status)) {
    throw createError('Invalid appointment status', 400);
  }

  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    {
      new: true,
      runValidators: true
    }
  )
    .populate('user', 'fullName email phone')
    .populate('doctor', 'name specialization location');

  if (!appointment) {
    throw createError('Appointment not found', 404);
  }

  return res.status(200).json({
    success: true,
    message: 'Appointment status updated successfully',
    data: {
      appointment
    }
  });
});

const resolveAdminAppointment = asyncHandler(async (req, res) => {
  validateAppointmentId(req.params.id);

  const note = req.body.note?.trim();

  if (!note) {
    throw createError('Resolution note is required', 400);
  }

  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status || 'completed',
      notes: note
    },
    {
      new: true,
      runValidators: true
    }
  )
    .populate('user', 'fullName email phone')
    .populate('doctor', 'name specialization location');

  if (!appointment) {
    throw createError('Appointment not found', 404);
  }

  return res.status(200).json({
    success: true,
    message: 'Appointment resolved successfully',
    data: {
      appointment
    }
  });
});

const getAdminReports = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const filters = buildReportFilters(req.query);

  const [reports, total] = await Promise.all([
    Report.find(filters)
      .populate('user', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Report.countDocuments(filters)
  ]);

  return res.status(200).json({
    success: true,
    message: 'Admin reports fetched successfully',
    data: {
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const getAdminReportById = asyncHandler(async (req, res) => {
  validateReportId(req.params.id);

  const report = await Report.findById(req.params.id).populate(
    'user',
    'fullName email phone'
  );

  if (!report) {
    throw createError('Report not found', 404);
  }

  return res.status(200).json({
    success: true,
    message: 'Report fetched successfully',
    data: {
      report
    }
  });
});

const deleteAdminReport = asyncHandler(async (req, res) => {
  validateReportId(req.params.id);

  const report = await Report.findByIdAndDelete(req.params.id);

  if (!report) {
    throw createError('Report not found', 404);
  }

  await removeLocalFile(report.path);

  return res.status(200).json({
    success: true,
    message: 'Report deleted successfully',
    data: {
      id: req.params.id
    }
  });
});

const getAdminNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({})
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({})
  ]);

  return res.status(200).json({
    success: true,
    message: 'Admin notifications fetched successfully',
    data: {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const createAdminAnnouncement = asyncHandler(async (req, res) => {
  const { target, userIds = [], title, message } = req.body;

  if (!title) {
    throw createError('Announcement title is required', 400);
  }

  if (!['global', 'users'].includes(target)) {
    throw createError('Announcement target must be global or users', 400);
  }

  let users = [];

  if (target === 'global') {
    users = await User.find({ isActive: true }).select('_id');
  } else {
    users = await User.find({
      _id: { $in: userIds },
      isActive: true
    }).select('_id');
  }

  if (!users.length) {
    throw createError('No active users found for announcement', 400);
  }

  const notifications = await Notification.insertMany(
    users.map((user) => ({
      user: user._id,
      title,
      message,
      type: 'system',
      metadata: {
        source: 'admin-announcement',
        target
      }
    }))
  );

  return res.status(201).json({
    success: true,
    message: 'Announcement notifications created successfully',
    data: {
      count: notifications.length
    }
  });
});

const createAdminSystemNotification = asyncHandler(async (req, res) => {
  const { userId, title, message, metadata } = req.body;

  if (!userId || !title) {
    throw createError('User and title are required', 400);
  }

  const user = await User.findOne({ _id: userId, isActive: true }).select('_id');

  if (!user) {
    throw createError('Active user not found', 404);
  }

  const notification = await Notification.create({
    user: user._id,
    title,
    message,
    type: 'system',
    metadata: {
      ...(metadata || {}),
      source: 'admin-system'
    }
  });

  return res.status(201).json({
    success: true,
    message: 'System notification created successfully',
    data: {
      notification
    }
  });
});

const formatAggregationRows = (rows, labelKey = '_id', valueKey = 'count') => {
  return rows.map((row) => ({
    name: row[labelKey] || 'Uncategorized',
    value: row[valueKey] || 0
  }));
};

const getAdminAnalyticsOverview = asyncHandler(async (req, res) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    activeUsers,
    doctors,
    admins,
    newUsersThisMonth,
    totalAppointments,
    pendingAppointments,
    completedAppointments,
    cancelledAppointments,
    appointmentVolumeByMonth,
    totalArticles,
    publishedArticles,
    featuredArticles,
    articleTotals,
    popularCategories,
    totalReports,
    reportsByCategory,
    reportsByMimeType,
    totalAssessments,
    pcosRiskRows,
    popularSymptoms,
    cycleStats,
    irregularCycleCount
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'doctor' }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ createdAt: { $gte: monthStart } }),
    Appointment.countDocuments({}),
    Appointment.countDocuments({ status: 'pending' }),
    Appointment.countDocuments({ status: 'completed' }),
    Appointment.countDocuments({ status: 'cancelled' }),
    Appointment.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]),
    Article.countDocuments({}),
    Article.countDocuments({ isPublished: true }),
    Article.countDocuments({ featured: true }),
    Article.aggregate([
      {
        $group: {
          _id: null,
          totalArticleViews: { $sum: '$views' },
          totalBookmarks: { $sum: '$bookmarksCount' }
        }
      }
    ]),
    Article.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]),
    Report.countDocuments({}),
    Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Report.aggregate([
      { $group: { _id: '$mimeType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    PCOSAssessment.countDocuments({}),
    PCOSAssessment.aggregate([
      { $group: { _id: '$result.risk_level', count: { $sum: 1 } } }
    ]),
    HealthLog.aggregate([
      { $unwind: '$symptoms' },
      { $group: { _id: '$symptoms', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]),
    Cycle.aggregate([
      {
        $group: {
          _id: null,
          averageCycleLength: { $avg: '$cycleLength' }
        }
      }
    ]),
    Cycle.countDocuments({ isIrregular: true })
  ]);

  const riskCounts = pcosRiskRows.reduce(
    (counts, row) => ({
      ...counts,
      [row._id]: row.count
    }),
    {}
  );

  return res.status(200).json({
    success: true,
    message: 'Admin analytics overview fetched successfully',
    data: {
      users: {
        totalUsers,
        activeUsers,
        doctors,
        admins,
        newUsersThisMonth
      },
      appointments: {
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        cancelledAppointments,
        appointmentVolumeByMonth: appointmentVolumeByMonth.map((row) => ({
          month: `${row._id.year}-${String(row._id.month).padStart(2, '0')}`,
          count: row.count
        }))
      },
      knowledgeHub: {
        totalArticles,
        publishedArticles,
        featuredArticles,
        totalArticleViews: articleTotals[0]?.totalArticleViews || 0,
        totalBookmarks: articleTotals[0]?.totalBookmarks || 0,
        popularCategories: formatAggregationRows(popularCategories)
      },
      reports: {
        totalReports,
        reportsByCategory: formatAggregationRows(reportsByCategory),
        reportsByMimeType: formatAggregationRows(reportsByMimeType)
      },
      pcos: {
        totalAssessments,
        lowRiskCount: riskCounts.Low || 0,
        moderateRiskCount: riskCounts.Moderate || 0,
        highRiskCount: riskCounts.High || 0
      },
      healthTrends: {
        popularSymptoms: formatAggregationRows(popularSymptoms),
        averageCycleLength: Number(
          (cycleStats[0]?.averageCycleLength || 0).toFixed(1)
        ),
        irregularCycleCount
      }
    }
  });
});

module.exports = {
  activateAdminUser,
  createAdminArticle,
  createAdminDoctor,
  deleteAdminArticle,
  deleteAdminDoctor,
  deleteAdminReport,
  deleteAdminUser,
  deactivateAdminUser,
  exportAdminArticlesCsv,
  featureAdminArticle,
  getAdminArticleById,
  getAdminArticles,
  getAdminAnalyticsOverview,
  getAdminAppointments,
  getAdminDoctorAppointments,
  getAdminDoctorById,
  getAdminDoctors,
  getAdminHealth,
  getAdminNotifications,
  getAdminReportById,
  getAdminReports,
  getAdminUserById,
  getAdminUserSessions,
  getAdminUsers,
  publishAdminArticle,
  refreshAdminArticleSearch,
  revokeAdminUserSessions,
  retrainAdminArticleRecommender,
  createAdminAnnouncement,
  createAdminSystemNotification,
  resolveAdminAppointment,
  unfeatureAdminArticle,
  unpublishAdminArticle,
  unverifyAdminDoctor,
  updateAdminAppointmentStatus,
  updateAdminArticle,
  updateAdminDoctor,
  updateAdminUserRole,
  verifyAdminDoctor
};
