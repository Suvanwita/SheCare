const mongoose = require('mongoose');

const { Schema } = mongoose;

const medicineSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String
    },
    frequency: {
      type: String
    },
    duration: {
      type: String
    },
    instructions: {
      type: String
    }
  },
  {
    _id: false
  }
);

const prescriptionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    medicines: [medicineSchema],
    notes: {
      type: String
    },
    issuedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

prescriptionSchema.index({ user: 1, issuedAt: -1 });
prescriptionSchema.index({ doctor: 1 });
prescriptionSchema.index({ appointment: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
