const express = require('express');
const {
  getSearchSuggestions,
  getSimilarArticlesBySlug
} = require('../controllers/articleController');

const router = express.Router();

router.get('/search/suggestions', getSearchSuggestions);
router.get('/:slug/similar', getSimilarArticlesBySlug);

module.exports = router;
