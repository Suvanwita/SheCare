const mongoose = require('mongoose');

const { Schema } = mongoose;

const analyticsEventSchema = new Schema(
  {
    eventType: {
      type: String,
      required: true
    },
    topic: {
      type: String,
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    entityId: {
      type: Schema.Types.ObjectId
    },
    payload: {
      type: Object
    },
    occurredAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

analyticsEventSchema.index({ eventType: 1 });
analyticsEventSchema.index({ topic: 1 });
analyticsEventSchema.index({ occurredAt: -1 });
analyticsEventSchema.index({ user: 1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
