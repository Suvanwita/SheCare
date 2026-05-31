const mongoose = require('mongoose');

const { Schema } = mongoose;

const reminderSchema = new Schema(
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
    type: {
      type: String,
      enum: ['medicine', 'cycle', 'appointment', 'custom'],
      required: true
    },
    message: {
      type: String
    },
    scheduledAt: {
      type: Date,
      required: true
    },
    repeat: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'missed', 'cancelled'],
      default: 'upcoming'
    }
  },
  {
    timestamps: true
  }
);

reminderSchema.index({ user: 1, scheduledAt: 1 });
reminderSchema.index({ status: 1 });
reminderSchema.index({ type: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
