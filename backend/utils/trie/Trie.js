const TrieNode = require('./TrieNode');

const typeRank = {
  title: 1,
  tag: 2,
  keyword: 3,
  category: 4
};

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  normalize(text) {
    return String(text || '')
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  insert(word, payload) {
    const normalizedWord = this.normalize(word);

    if (!normalizedWord || !payload) {
      return;
    }

    let currentNode = this.root;

    for (const character of normalizedWord) {
      if (!currentNode.children.has(character)) {
        currentNode.children.set(character, new TrieNode());
      }

      currentNode = currentNode.children.get(character);
      this.addSuggestion(currentNode, payload);
    }

    currentNode.isEndOfWord = true;
  }

  searchPrefix(prefix) {
    const normalizedPrefix = this.normalize(prefix);

    if (!normalizedPrefix) {
      return this.root;
    }

    let currentNode = this.root;

    for (const character of normalizedPrefix) {
      if (!currentNode.children.has(character)) {
        return null;
      }

      currentNode = currentNode.children.get(character);
    }

    return currentNode;
  }

  getSuggestions(prefix, limit = 8) {
    const prefixNode = this.searchPrefix(prefix);

    if (!prefixNode) {
      return [];
    }

    return this.getUniqueSuggestions(prefixNode.suggestions)
      .sort((first, second) => {
        const firstRank = typeRank[first.type] || Number.MAX_SAFE_INTEGER;
        const secondRank = typeRank[second.type] || Number.MAX_SAFE_INTEGER;

        if (firstRank !== secondRank) {
          return firstRank - secondRank;
        }

        return first.title.localeCompare(second.title);
      })
      .slice(0, limit);
  }

  addSuggestion(node, payload) {
    const suggestionKey = this.getSuggestionKey(payload);
    const exists = node.suggestions.some(
      (suggestion) => this.getSuggestionKey(suggestion) === suggestionKey
    );

    if (!exists) {
      node.suggestions.push(payload);
    }
  }

  getUniqueSuggestions(suggestions) {
    const seen = new Set();
    const uniqueSuggestions = [];

    suggestions.forEach((suggestion) => {
      const suggestionKey = this.getSuggestionKey(suggestion);

      if (!seen.has(suggestionKey)) {
        seen.add(suggestionKey);
        uniqueSuggestions.push(suggestion);
      }
    });

    return uniqueSuggestions;
  }

  getSuggestionKey(payload) {
    return [
      payload.articleId,
      payload.slug,
      payload.category,
      payload.type,
      payload.title
    ].join(':');
  }
}

module.exports = Trie;
