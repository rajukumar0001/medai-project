/**
 * Report Model
 * Stores uploaded PDF medical reports and analysis results
 */

const mongoose = require('mongoose');

const abnormalValueSchema = new mongoose.Schema({
  parameter: String,
  value: String,
  unit: String,
  normalRange: String,
  status: { type: String, enum: ['low', 'normal', 'high', 'critical'] },
  severity: { type: String, enum: ['mild', 'moderate', 'severe'] }
}, { _id: false });

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // ─── File Info ───────────────────────────────────────────────────────────────
  fileName: { type: String, required: true },
  originalName: String,
  filePath: String,
  fileSize: Number,
  mimeType: String,

  // ─── Report Classification ────────────────────────────────────────────────────
  reportType: {
    type: String,
    enum: ['CBC', 'sugar', 'lipid', 'thyroid', 'LFT', 'KFT', 'ECG', 'general_checkup', 'unknown'],
    default: 'unknown'
  },
  reportDate: Date,
  labName: String,
  patientName: String,

  // ─── Extracted Data ───────────────────────────────────────────────────────────
  extractedText: String,
  parameters: [abnormalValueSchema],
  abnormalValues: [abnormalValueSchema],

  // ─── Analysis Results ─────────────────────────────────────────────────────────
  analysis: {
    summary: String,
    overallStatus: {
      type: String,
      enum: ['normal', 'borderline', 'abnormal', 'critical']
    },
    predictedRisks: [String],
    recommendations: [String],
    urgency: {
      type: String,
      enum: ['routine', 'soon', 'urgent', 'emergency'],
      default: 'routine'
    },
    followUpRequired: { type: Boolean, default: false }
  },

  // ─── Status ───────────────────────────────────────────────────────────────────
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: String,
  isFavorite: { type: Boolean, default: false }

}, { timestamps: true });

reportSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
