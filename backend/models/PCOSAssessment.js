const mongoose = require('mongoose');

const { Schema } = mongoose;

const inputSchema = new Schema(
  {
    age_yrs: {
      type: Number
    },
    weight_kg: {
      type: Number
    },
    height_cm: {
      type: Number
    },
    bmi: {
      type: Number
    },
    cycle_r_i: {
      type: Number
    },
    cycle_length_days: {
      type: Number
    },
    weight_gain_y_n: {
      type: Number
    },
    hair_growth_y_n: {
      type: Number
    },
    skin_darkening_y_n: {
      type: Number
    },
    hair_loss_y_n: {
      type: Number
    },
    pimples_y_n: {
      type: Number
    },
    fast_food_y_n: {
      type: Number
    },
    reg_exercise_y_n: {
      type: Number
    },
    follicle_no_l: {
      type: Number
    },
    follicle_no_r: {
      type: Number
    },
    amh_ng_ml: {
      type: Number
    },
    fsh_miu_ml: {
      type: Number
    },
    lh_miu_ml: {
      type: Number
    },
    fsh_lh: {
      type: Number
    },
    tsh_miu_l: {
      type: Number
    },
    vit_d3_ng_ml: {
      type: Number
    },
    waist_inch: {
      type: Number
    },
    hip_inch: {
      type: Number
    },
    waist_hip_ratio: {
      type: Number
    }
  },
  {
    _id: false
  }
);

const resultSchema = new Schema(
  {
    probability: {
      type: Number
    },
    risk_level: {
      type: String,
      enum: ['Low', 'Moderate', 'High']
    },
    message: {
      type: String
    },
    top_contributing_factors: [
      {
        type: String
      }
    ],
    recommendation: {
      type: String
    },
    disclaimer: {
      type: String
    }
  },
  {
    _id: false
  }
);

const pcosAssessmentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    input: inputSchema,
    result: resultSchema
  },
  {
    timestamps: true
  }
);

pcosAssessmentSchema.index({ user: 1, createdAt: -1 });
pcosAssessmentSchema.index({ 'result.risk_level': 1 });

module.exports = mongoose.model('PCOSAssessment', pcosAssessmentSchema);
