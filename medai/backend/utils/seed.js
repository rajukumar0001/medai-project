/**
 * Database Seeder — Creates admin user and sample data
 * Run: node utils/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@medai.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: process.env.ADMIN_EMAIL || 'admin@medai.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'admin',
        isVerified: true
      });
      console.log('✅ Admin user created');
    }

    // Create demo user
    const demoExists = await User.findOne({ email: 'user@medai.com' });
    if (!demoExists) {
      await User.create({
        name: 'Demo User',
        email: 'user@medai.com',
        password: 'User@123',
        gender: 'male',
        dateOfBirth: new Date('1990-05-15'),
        bloodGroup: 'O+',
        height: 175,
        weight: 70,
        isVerified: true
      });
      console.log('✅ Demo user created');
    }

    console.log('🌱 Seeding complete!');
    console.log('Admin: admin@medai.com / Admin@123');
    console.log('User:  user@medai.com / User@123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
