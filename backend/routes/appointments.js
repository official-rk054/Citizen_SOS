const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Book appointment
router.post('/book', authMiddleware, async (req, res) => {
  try {
    const { professionalId, appointmentDate, timeSlot, reason } = req.body;

    const appointment = new Appointment({
      userId: req.userId,
      professionalId,
      appointmentDate,
      timeSlot,
      reason,
      status: 'scheduled'
    });

    await appointment.save();

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: await appointment.populate(['userId', 'professionalId'])
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's appointments
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.params.userId })
      .populate('professionalId', 'name specialization phone')
      .sort({ appointmentDate: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming appointments
router.get('/upcoming/:userId', authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      $or: [
        { userId: req.params.userId },
        { professionalId: req.params.userId }
      ],
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled'] }
    })
      .populate('userId', 'name phone')
      .populate('professionalId', 'name specialization phone')
      .sort({ appointmentDate: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update appointment status
router.put('/:appointmentId', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.appointmentId,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate(['userId', 'professionalId']);

    res.json({ message: 'Appointment updated', appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
