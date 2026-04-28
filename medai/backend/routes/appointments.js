/**
 * Appointments Routes — /api/appointments
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Appointment } = require('../models/Appointment');

router.use(protect);

router.post('/', async (req, res) => {
  try {
    const appointment = await Appointment.create({ ...req.body, user: req.user.id });
    res.status(201).json({ appointment });
  } catch (err) { res.status(500).json({ error: 'Failed to create appointment.' }); }
});

router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user.id }).sort({ appointmentDate: 1 });
    res.json({ appointments });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch appointments.' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, req.body, { new: true }
    );
    if (!appointment) return res.status(404).json({ error: 'Not found.' });
    res.json({ appointment });
  } catch (err) { res.status(500).json({ error: 'Failed to update.' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Appointment.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Appointment deleted.' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete.' }); }
});

module.exports = router;
