const express = require('express');
const { getSearchSuggestions } = require('../controllers/articleController');

const router = express.Router();

router.get('/search/suggestions', getSearchSuggestions);

module.exports = router;
