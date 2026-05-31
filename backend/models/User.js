const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'doctor', 'admin'],
      default: 'user'
    },
    gender: {
      type: String,
      default: 'female'
    },
    dateOfBirth: {
      type: Date
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: {
      type: String
    },
    emergencyContact: {
      name: {
        type: String
      },
      phone: {
        type: String
      },
      relation: {
        type: String
      }
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system'
      },
      notificationsEnabled: {
        type: Boolean,
        default: true
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLoginAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);
