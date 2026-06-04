const Article = require('../../models/Article');
const Trie = require('./Trie');

let articleTrie = new Trie();
let buildPromise = null;

const createPayload = (article, type, label) => ({
  articleId: article._id,
  label,
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
  insertArticleValue(
    trie,
    article.title,
    createPayload(article, 'title', article.title)
  );
  (article.tags || []).forEach((tag) => {
    insertArticleValue(trie, tag, createPayload(article, 'tag', tag));
  });
  (article.keywords || []).forEach((keyword) => {
    insertArticleValue(trie, keyword, createPayload(article, 'keyword', keyword));
  });
  insertArticleValue(
    trie,
    article.category,
    createPayload(article, 'category', article.category)
  );
};

const buildArticleTrie = async () => {
  if (buildPromise) {
    return buildPromise;
  }

  buildPromise = (async () => {
    const freshTrie = new Trie();
    const articles = await Article.find({ isPublished: true })
      .select('_id title slug category tags keywords')
      .lean();

    articles.forEach((article) => insertArticle(freshTrie, article));
    articleTrie = freshTrie;

    return articleTrie;
  })();

  try {
    return await buildPromise;
  } finally {
    buildPromise = null;
  }
};

const getArticleSuggestions = async (query, limit) => {
  if (articleTrie.isEmpty()) {
    await buildArticleTrie();
  }

  return articleTrie.getSuggestions(query, limit);
};

module.exports = {
  buildArticleTrie,
  getArticleSuggestions
};
