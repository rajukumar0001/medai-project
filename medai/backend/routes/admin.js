/**
 * Admin Routes — /api/admin
 */
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Prediction = require('../models/Prediction');
const Report = require('../models/Report');
const { AdminLog } = require('../models/Appointment');

router.use(protect, authorize('admin'));

// Platform stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalPredictions, totalReports, newUsersToday] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Prediction.countDocuments(),
      Report.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } })
    ]);
    res.json({ totalUsers, totalPredictions, totalReports, newUsersToday });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch stats.' }); }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {};
    const users = await User.find(query).sort({ createdAt: -1 })
      .skip((page-1)*limit).limit(parseInt(limit)).select('-password');
    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch users.' }); }
});

// Toggle user active status
router.patch('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    await AdminLog.create({ admin: req.user.id, action: `User ${user.isActive ? 'activated' : 'deactivated'}`, targetUser: user._id });
    res.json({ isActive: user.isActive });
  } catch (err) { res.status(500).json({ error: 'Failed to toggle user.' }); }
});

// Get admin logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await AdminLog.find().populate('admin', 'name email').populate('targetUser', 'name email').sort({ createdAt: -1 }).limit(100);
    res.json({ logs });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch logs.' }); }
});

module.exports = router;
