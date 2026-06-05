const asyncHandler = require('../middleware/asyncHandler');
const fs = require('fs/promises');
const mongoose = require('mongoose');
const path = require('path');
const Article = require('../models/Article');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
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

module.exports = {
  createAdminArticle,
  createAdminDoctor,
  deleteAdminArticle,
  deleteAdminDoctor,
  exportAdminArticlesCsv,
  featureAdminArticle,
  getAdminArticleById,
  getAdminArticles,
  getAdminDoctorAppointments,
  getAdminDoctorById,
  getAdminDoctors,
  getAdminHealth,
  publishAdminArticle,
  refreshAdminArticleSearch,
  retrainAdminArticleRecommender,
  unfeatureAdminArticle,
  unpublishAdminArticle,
  unverifyAdminDoctor,
  updateAdminArticle,
  updateAdminDoctor,
  verifyAdminDoctor
};
