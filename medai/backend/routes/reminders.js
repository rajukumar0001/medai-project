/**
 * Reminders Routes — /api/reminders
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Reminder } = require('../models/Appointment');

router.use(protect);

router.post('/', async (req, res) => {
  try {
    const reminder = await Reminder.create({ ...req.body, user: req.user.id });
    res.status(201).json({ reminder });
  } catch (err) { res.status(500).json({ error: 'Failed to create reminder.' }); }
});

router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user.id }).sort({ time: 1 });
    res.json({ reminders });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch reminders.' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, req.body, { new: true }
    );
    if (!reminder) return res.status(404).json({ error: 'Not found.' });
    res.json({ reminder });
  } catch (err) { res.status(500).json({ error: 'Failed to update.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Reminder deleted.' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete.' }); }
});

module.exports = router;
