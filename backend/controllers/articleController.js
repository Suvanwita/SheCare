const asyncHandler = require('../middleware/asyncHandler');
const Article = require('../models/Article');
const {
  buildArticleTrie,
  getArticleSuggestions
} = require('../utils/trie/articleTrie');

const allowedFields = [
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

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getArticleMlServiceUrl = () => {
  return (process.env.ARTICLE_ML_SERVICE_URL || 'http://localhost:8002').replace(
    /\/$/,
    ''
  );
};

const formatRecommendation = (article, similarityScore = 0) => ({
  slug: article.slug,
  title: article.title,
  category: article.category,
  summary: article.summary,
  reading_time: article.readingTime,
  cover_image: article.coverImage,
  similarity_score: similarityScore
});

const requireAdmin = (user) => {
  if (!user || user.role !== 'admin') {
    throw createError('Admin access required', 403);
  }
};

const pickArticleFields = (body) => {
  return allowedFields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }

    return payload;
  }, {});
};

const rebuildArticleTrieSafely = () => {
  buildArticleTrie().catch((error) => {
    console.error(`Article trie rebuild failed: ${error.message}`);
  });
};

const parseBoolean = (value) => {
  if (value === undefined) {
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

const buildArticleFilters = (query) => {
  const filters = {};
  const isPublished = parseBoolean(query.isPublished);

  if (isPublished !== undefined) {
    filters.isPublished = isPublished;
  } else {
    filters.isPublished = true;
  }

  if (query.category && query.category !== 'all') {
    filters.category = query.category;
  }

  if (query.tag) {
    filters.tags = query.tag;
  }

  if (query.featured !== undefined) {
    filters.featured = parseBoolean(query.featured);
  }

  if (query.q) {
    filters.$text = { $search: query.q };
  }

  return filters;
};

const getMongoFallbackRecommendations = async (article, limit = 4) => {
  const tags = article.tags || [];
  const candidates = await Article.find({
    _id: { $ne: article._id },
    isPublished: true,
    $or: [
      { category: article.category },
      ...(tags.length ? [{ tags: { $in: tags } }] : [])
    ]
  })
    .select('slug title category summary readingTime coverImage tags')
    .limit(30)
    .lean();

  const tagSet = new Set(tags);

  return candidates
    .map((candidate) => {
      const matchingTags = (candidate.tags || []).filter((tag) => tagSet.has(tag));
      const categoryScore = candidate.category === article.category ? 1 : 0;
      const tagScore = matchingTags.length / Math.max(tagSet.size, 1);

      return {
        article: candidate,
        score: Number((categoryScore + tagScore).toFixed(4))
      };
    })
    .sort((first, second) => second.score - first.score)
    .slice(0, limit)
    .map(({ article: candidate, score }) =>
      formatRecommendation(candidate, score)
    );
};

const getSearchSuggestions = asyncHandler(async (req, res) => {
  const query = String(req.query.q || '').trim();

  if (query.length < 2) {
    return res.status(200).json({
      success: true,
      data: {
        suggestions: []
      }
    });
  }

  const suggestions = await getArticleSuggestions(query, 8);
  const formattedSuggestions = suggestions.map((suggestion) => ({
    label: suggestion.label || suggestion.title,
    type: suggestion.type,
    slug: suggestion.slug,
    category: suggestion.category
  }));

  return res.status(200).json({
    success: true,
    data: {
      suggestions: formattedSuggestions
    }
  });
});

const getArticles = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 100);
  const skip = (page - 1) * limit;
  const filters = buildArticleFilters(req.query);
  const sort = filters.$text
    ? { score: { $meta: 'textScore' }, featured: -1, createdAt: -1 }
    : { featured: -1, createdAt: -1 };
  const projection = filters.$text ? { score: { $meta: 'textScore' } } : {};

  const [articles, total] = await Promise.all([
    Article.find(filters, projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Article.countDocuments(filters)
  ]);

  return res.status(200).json({
    success: true,
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

const getArticleBySlug = asyncHandler(async (req, res) => {
  const article = await Article.findOne({
    slug: req.params.slug,
    isPublished: true
  }).lean();

  if (!article) {
    throw createError('Article not found', 404);
  }

  await Article.updateOne({ _id: article._id }, { $inc: { views: 1 } });

  return res.status(200).json({
    success: true,
    data: {
      article
    }
  });
});

const createArticle = asyncHandler(async (req, res) => {
  requireAdmin(req.user);

  const payload = pickArticleFields(req.body);
  const article = await Article.create(payload);
  rebuildArticleTrieSafely();

  return res.status(201).json({
    success: true,
    data: {
      article
    }
  });
});

const updateArticle = asyncHandler(async (req, res) => {
  requireAdmin(req.user);

  const payload = pickArticleFields(req.body);
  const article = await Article.findOneAndUpdate(
    { slug: req.params.slug },
    payload,
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
    data: {
      article
    }
  });
});

const deleteArticle = asyncHandler(async (req, res) => {
  requireAdmin(req.user);

  const article = await Article.findOneAndDelete({ slug: req.params.slug });

  if (!article) {
    throw createError('Article not found', 404);
  }

  rebuildArticleTrieSafely();

  return res.status(200).json({
    success: true,
    data: {
      slug: req.params.slug
    }
  });
});

const getSimilarArticlesBySlug = asyncHandler(async (req, res) => {
  const limit = 4;
  const article = await Article.findOne({
    slug: req.params.slug,
    isPublished: true
  }).lean();

  if (!article) {
    throw createError('Article not found', 404);
  }

  try {
    const response = await fetch(
      `${getArticleMlServiceUrl()}/similar-articles/by-slug`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          slug: article.slug,
          limit
        }),
        signal: AbortSignal.timeout(8000)
      }
    );

    if (!response.ok) {
      throw new Error('Article ML service request failed');
    }

    const mlResponse = await response.json();

    return res.status(200).json({
      success: true,
      source: mlResponse.source || 'tfidf-cosine-similarity',
      recommendations: mlResponse.recommendations || []
    });
  } catch (error) {
    const recommendations = await getMongoFallbackRecommendations(article, limit);

    return res.status(200).json({
      success: true,
      source: 'mongodb-fallback',
      recommendations
    });
  }
});

module.exports = {
  createArticle,
  deleteArticle,
  getArticleBySlug,
  getArticles,
  getSearchSuggestions,
  getSimilarArticlesBySlug,
  updateArticle
};
