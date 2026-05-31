const mongoose = require('mongoose');

const { Schema } = mongoose;

const healthLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    mood: {
      type: String,
      enum: ['happy', 'calm', 'tired', 'stressed', 'sad', 'neutral'],
      default: 'neutral'
    },
    symptoms: [
      {
        type: String
      }
    ],
    sleepHours: {
      type: Number
    },
    waterIntake: {
      type: Number
    },
    weightKg: {
      type: Number
    },
    painLevel: {
      type: Number,
      min: 0,
      max: 10
    },
    stressLevel: {
      type: Number,
      min: 0,
      max: 10
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

healthLogSchema.index({ user: 1, date: -1 });
healthLogSchema.index({ mood: 1 });

module.exports = mongoose.model('HealthLog', healthLogSchema);
