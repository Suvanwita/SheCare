const asyncHandler = require('../middleware/asyncHandler');
const Article = require('../models/Article');
const {
  buildArticleTrie,
  getArticleSuggestions
} = require('../utils/trie/articleTrie');
const {
  cacheKeys,
  deleteByPattern,
  deleteCache,
  getCache,
  setCache
} = require('../utils/cache');
const kafkaTopics = require('../kafka/topics');
const { emitKafkaEventSafely } = require('../kafka/eventPublisher');

const ARTICLE_LIST_CACHE_TTL_SECONDS = 10 * 60;
const ARTICLE_DETAIL_CACHE_TTL_SECONDS = 10 * 60;
const SIMILAR_ARTICLES_CACHE_TTL_SECONDS = 30 * 60;

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

const invalidateArticleCacheSafely = () => {
  Promise.all([
    deleteByPattern(`${cacheKeys.articlesList}*`),
    deleteByPattern('articles:slug:*'),
    deleteByPattern('articles:similar:*')
  ]).catch((error) => {
    console.error(`Article cache invalidation failed: ${error.message}`);
  });
};

const invalidateAdminAnalyticsCacheSafely = () => {
  deleteCache(cacheKeys.adminAnalyticsOverview).catch((error) => {
    console.error(`Admin analytics cache invalidation failed: ${error.message}`);
  });
};

const getArticleEventPayload = (article, extra = {}) => ({
  slug: article.slug,
  title: article.title,
  category: article.category,
  tags: article.tags || [],
  isPublished: article.isPublished,
  featured: article.featured,
  ...extra
});

const emitArticleEvent = (eventType, article, actor, extra = {}) => {
  emitKafkaEventSafely(kafkaTopics.ARTICLE_EVENTS, {
    eventType,
    entityId: article._id,
    userId: actor?._id,
    role: actor?.role,
    payload: {
      actorId: actor?._id,
      ...getArticleEventPayload(article, extra)
    }
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

const getStableQueryKey = (query) => {
  const entries = Object.keys(query)
    .sort()
    .map((key) => [key, query[key]]);

  return JSON.stringify(entries);
};

const getArticlesCacheKey = (query) => {
  const queryKey = getStableQueryKey(query);

  return queryKey === '[]'
    ? cacheKeys.articlesList
    : `${cacheKeys.articlesList}:${queryKey}`;
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
  const cacheKey = getArticlesCacheKey(req.query);
  const cachedData = await getCache(cacheKey);

  if (cachedData) {
    return res.status(200).json({
      success: true,
      data: cachedData
    });
  }

  const [articles, total] = await Promise.all([
    Article.find(filters, projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Article.countDocuments(filters)
  ]);

  const data = {
    articles,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };

  await setCache(cacheKey, data, ARTICLE_LIST_CACHE_TTL_SECONDS);

  return res.status(200).json({
    success: true,
    data
  });
});

const getArticleBySlug = asyncHandler(async (req, res) => {
  const cacheKey = cacheKeys.articleSlug(req.params.slug);
  let article = await getCache(cacheKey);

  if (!article) {
    article = await Article.findOne({
      slug: req.params.slug,
      isPublished: true
    }).lean();
  }

  if (!article) {
    throw createError('Article not found', 404);
  }

  await setCache(cacheKey, article, ARTICLE_DETAIL_CACHE_TTL_SECONDS);

  await Article.updateOne({ _id: article._id }, { $inc: { views: 1 } });
  emitArticleEvent('article.viewed', article, req.user, {
    viewerId: req.user?._id,
    source: 'article_detail'
  });

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
  invalidateArticleCacheSafely();
  invalidateAdminAnalyticsCacheSafely();
  emitArticleEvent('article.created', article, req.user);

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
  invalidateArticleCacheSafely();
  invalidateAdminAnalyticsCacheSafely();
  emitArticleEvent('article.updated', article, req.user);

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
  invalidateArticleCacheSafely();
  invalidateAdminAnalyticsCacheSafely();

  return res.status(200).json({
    success: true,
    data: {
      slug: req.params.slug
    }
  });
});

const getSimilarArticlesBySlug = asyncHandler(async (req, res) => {
  const limit = 4;
  const cacheKey = cacheKeys.articlesSimilar(req.params.slug);
  const cachedData = await getCache(cacheKey);

  if (cachedData) {
    return res.status(200).json(cachedData);
  }

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

    const data = {
      success: true,
      source: mlResponse.source || 'tfidf-cosine-similarity',
      recommendations: mlResponse.recommendations || []
    };

    await setCache(cacheKey, data, SIMILAR_ARTICLES_CACHE_TTL_SECONDS);

    return res.status(200).json(data);
  } catch (error) {
    const recommendations = await getMongoFallbackRecommendations(article, limit);

    const data = {
      success: true,
      source: 'mongodb-fallback',
      recommendations
    };

    await setCache(cacheKey, data, SIMILAR_ARTICLES_CACHE_TTL_SECONDS);

    return res.status(200).json(data);
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
