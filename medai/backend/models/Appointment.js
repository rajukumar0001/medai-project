/**
 * Appointment Model
 */

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorName: String,
  specialization: { type: String, required: true },
  hospital: String,
  appointmentDate: { type: Date, required: true },
  appointmentTime: String,
  reason: String,
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  notes: String,
  reminderSent: { type: Boolean, default: false }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

// ─── Reminder Model ───────────────────────────────────────────────────────────

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['medication', 'water', 'exercise', 'appointment', 'checkup', 'custom'],
    required: true
  },
  title: { type: String, required: true },
  description: String,
  time: { type: String, required: true }, // HH:MM format
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  daysOfWeek: [Number], // 0=Sun, 6=Sat
  isActive: { type: Boolean, default: true },
  lastTriggered: Date,
  emailNotification: { type: Boolean, default: true }
}, { timestamps: true });

const Reminder = mongoose.model('Reminder', reminderSchema);

// ─── Admin Log Model ──────────────────────────────────────────────────────────

const adminLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: { type: String, required: true },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  details: mongoose.Schema.Types.Mixed,
  ip: String
}, { timestamps: true });

const AdminLog = mongoose.model('AdminLog', adminLogSchema);

module.exports = { Appointment, Reminder, AdminLog };
