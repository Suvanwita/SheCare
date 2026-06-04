const asyncHandler = require('../middleware/asyncHandler');
const Article = require('../models/Article');
const { getArticleSuggestions } = require('../utils/trie/articleTrie');

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
  getSearchSuggestions,
  getSimilarArticlesBySlug
};
