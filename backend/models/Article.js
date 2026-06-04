const mongoose = require('mongoose');

const { Schema } = mongoose;

const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    summary: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    coverImage: {
      type: String
    },
    tags: [
      {
        type: String
      }
    ],
    keywords: [
      {
        type: String
      }
    ],
    readingTime: {
      type: Number
    },
    author: {
      type: String
    },
    featured: {
      type: Boolean,
      default: false
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    views: {
      type: Number,
      default: 0
    },
    bookmarksCount: {
      type: Number,
      default: 0
    },
    searchText: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ keywords: 1 });
articleSchema.index({ featured: 1 });
articleSchema.index({
  title: 'text',
  summary: 'text',
  content: 'text',
  tags: 'text',
  keywords: 'text',
  searchText: 'text'
});

articleSchema.pre('save', function setSearchText(next) {
  const searchableParts = [
    this.title,
    this.category,
    this.summary,
    ...(this.tags || []),
    ...(this.keywords || [])
  ];

  this.searchText = searchableParts
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  next();
});

module.exports = mongoose.model('Article', articleSchema);
