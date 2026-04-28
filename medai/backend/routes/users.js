/**
 * Users Routes — /api/users
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.use(protect);

// Get profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch profile.' }); }
});

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const allowedFields = ['name','dateOfBirth','gender','phone','bloodGroup','height','weight','allergies','medicalConditions','preferences'];
    const updates = {};
    allowedFields.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
    
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ user, message: 'Profile updated successfully.' });
  } catch (err) { res.status(500).json({ error: 'Failed to update profile.' }); }
});

// Delete account
router.delete('/account', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });
    res.json({ message: 'Account deactivated.' });
  } catch (err) { res.status(500).json({ error: 'Failed to deactivate account.' }); }
});

module.exports = router;
