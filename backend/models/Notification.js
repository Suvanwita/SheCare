const mongoose = require('mongoose');

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String
    },
    type: {
      type: String,
      enum: ['reminder', 'appointment', 'report', 'system', 'risk'],
      default: 'system'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: Object
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
