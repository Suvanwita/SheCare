const mongoose = require('mongoose');

const { Schema } = mongoose;

const reportSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String
    },
    doctorName: {
      type: String
    },
    fileName: {
      type: String
    },
    originalName: {
      type: String
    },
    mimeType: {
      type: String
    },
    size: {
      type: Number
    },
    path: {
      type: String
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({ user: 1, createdAt: -1 });
reportSchema.index({ category: 1 });
reportSchema.index({ mimeType: 1 });

module.exports = mongoose.model('Report', reportSchema);
