class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.suggestions = [];
  }
}

module.exports = TrieNode;
