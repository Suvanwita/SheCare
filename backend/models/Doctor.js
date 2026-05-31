const mongoose = require('mongoose');

const { Schema } = mongoose;

const doctorSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    specialization: {
      type: String,
      required: true,
      trim: true
    },
    experienceYears: {
      type: Number
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    location: {
      type: String
    },
    consultationFee: {
      type: Number
    },
    availableSlots: [
      {
        type: String
      }
    ],
    bio: {
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

doctorSchema.index({ specialization: 1 });
doctorSchema.index({ location: 1 });
doctorSchema.index({ rating: -1 });
doctorSchema.index({ isVerified: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
