/**
 * Prediction Model
 * Stores AI disease prediction results
 */

const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  diseaseType: {
    type: String,
    required: true,
    enum: [
      'diabetes', 'heart_disease', 'bp_risk', 'kidney_disease',
      'liver_disease', 'thyroid', 'anemia', 'cholesterol',
      'obesity', 'stroke', 'stress', 'depression', 'pcos',
      'arthritis', 'general_health'
    ]
  },
  inputData: {
    type: mongoose.Schema.Types.Mixed, // Flexible for different disease inputs
    required: true
  },
  result: {
    riskLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical'],
      required: true
    },
    probability: {
      type: Number, // 0-100
      required: true
    },
    prediction: {
      type: Boolean, // true = positive / at risk
      required: true
    },
    confidence: Number,
    reasons: [String],
    prevention: [String],
    dietPlan: [String],
    exerciseTips: [String],
    doctorAdvice: String,
    urgency: {
      type: String,
      enum: ['routine', 'soon', 'urgent', 'emergency'],
      default: 'routine'
    },
    specialists: [String]
  },
  notes: String,
  isFavorite: { type: Boolean, default: false }

}, { timestamps: true });

// Index for faster queries
predictionSchema.index({ user: 1, createdAt: -1 });
predictionSchema.index({ user: 1, diseaseType: 1 });

module.exports = mongoose.model('Prediction', predictionSchema);
