const mongoose = require('mongoose');

const { Schema } = mongoose;

const cycleSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    cycleLength: {
      type: Number
    },
    periodDuration: {
      type: Number
    },
    flowIntensity: {
      type: String,
      enum: ['light', 'medium', 'heavy']
    },
    symptoms: [
      {
        type: String
      }
    ],
    notes: {
      type: String
    },
    predictedNextPeriod: {
      type: Date
    },
    isIrregular: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

cycleSchema.index({ user: 1, startDate: -1 });
cycleSchema.index({ isIrregular: 1 });

module.exports = mongoose.model('Cycle', cycleSchema);
