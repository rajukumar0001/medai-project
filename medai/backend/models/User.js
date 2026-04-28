/**
 * User Model
 * Handles user authentication, profile, and roles
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // ─── Basic Info ─────────────────────────────────────────────────────────────
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'doctor'],
    default: 'user'
  },

  // ─── Profile Info ────────────────────────────────────────────────────────────
  avatar: {
    type: String,
    default: null
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', '']
  },
  phone: String,
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']
  },
  height: Number, // cm
  weight: Number, // kg
  allergies: [String],
  medicalConditions: [String],

  // ─── Auth ────────────────────────────────────────────────────────────────────
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  verificationToken: String,
  lastLogin: Date,

  // ─── Preferences ─────────────────────────────────────────────────────────────
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'dark' },
    notifications: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: true }
  },

  // ─── Health Score ─────────────────────────────────────────────────────────────
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  }

}, { timestamps: true });

// ─── Hash Password Before Save ────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Compare Password Method ─────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Virtual: BMI ────────────────────────────────────────────────────────────
userSchema.virtual('bmi').get(function () {
  if (this.height && this.weight) {
    const heightM = this.height / 100;
    return (this.weight / (heightM * heightM)).toFixed(1);
  }
  return null;
});

// ─── Virtual: Age ────────────────────────────────────────────────────────────
userSchema.virtual('age').get(function () {
  if (this.dateOfBirth) {
    const today = new Date();
    const birth = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }
  return null;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
