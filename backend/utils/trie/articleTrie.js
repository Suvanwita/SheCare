const Article = require('../../models/Article');
const Trie = require('./Trie');

let articleTrie = new Trie();

const createPayload = (article, type) => ({
  articleId: article._id,
  title: article.title,
  slug: article.slug,
  category: article.category,
  type
});

const insertArticleValue = (trie, value, payload) => {
  if (Array.isArray(value)) {
    value.forEach((item) => trie.insert(item, payload));
    return;
  }

  trie.insert(value, payload);
};

const insertArticle = (trie, article) => {
  insertArticleValue(trie, article.title, createPayload(article, 'title'));
  insertArticleValue(trie, article.tags, createPayload(article, 'tag'));
  insertArticleValue(trie, article.keywords, createPayload(article, 'keyword'));
  insertArticleValue(trie, article.category, createPayload(article, 'category'));
};

const buildArticleTrie = async () => {
  const freshTrie = new Trie();
  const articles = await Article.find({ isPublished: true })
    .select('_id title slug category tags keywords')
    .lean();

  articles.forEach((article) => insertArticle(freshTrie, article));
  articleTrie = freshTrie;

  return articleTrie;
};

const getArticleSuggestions = (query, limit) => {
  return articleTrie.getSuggestions(query, limit);
};

module.exports = {
  buildArticleTrie,
  getArticleSuggestions
};
