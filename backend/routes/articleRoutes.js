const express = require('express');
const {
  createArticle,
  deleteArticle,
  getArticleBySlug,
  getArticles,
  getSearchSuggestions,
  getSimilarArticlesBySlug,
  updateArticle
} = require('../controllers/articleController');
const { protect } = require('../middleware/authMiddleware');
const { mlProxyRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/search/suggestions', getSearchSuggestions);
router.get('/', getArticles);
router.post('/', protect, createArticle);
router.get('/:slug/similar', mlProxyRateLimiter, getSimilarArticlesBySlug);
router.get('/:slug', getArticleBySlug);
router.patch('/:slug', protect, updateArticle);
router.delete('/:slug', protect, deleteArticle);

module.exports = router;
