const asyncHandler = require('../middleware/asyncHandler');
const { getArticleSuggestions } = require('../utils/trie/articleTrie');

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

module.exports = {
  getSearchSuggestions
};
