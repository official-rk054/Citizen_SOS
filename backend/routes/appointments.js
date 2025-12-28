const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Book appointment
router.post('/book', authMiddleware, async (req, res) => {
  try {
    const { professionalId, appointmentDate, timeSlot, reason, consultationFee } = req.body;

    // Validate professional
    const professional = await User.findById(professionalId).select('userType isAvailable name specialization');
    if (!professional) {
      return res.status(404).json({ error: 'Professional not found' });
    }
    if (!['doctor', 'nurse'].includes(professional.userType)) {
      return res.status(400).json({ error: 'Only doctors or nurses can be booked' });
    }
    if (!professional.isAvailable) {
      return res.status(400).json({ error: 'Professional is currently not available' });
    }

    // Prevent double-booking at the same slot for this professional
    const slotConflict = await Appointment.findOne({
      professionalId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: 'scheduled'
    });
    if (slotConflict) {
      return res.status(409).json({ error: 'Time slot already booked for this professional' });
    }

    const appointment = new Appointment({
      userId: req.userId,
      professionalId,
      appointmentDate,
      timeSlot,
      reason,
      consultationFee: Number.isFinite(consultationFee) ? consultationFee : 500,
      status: 'scheduled'
    });

    await appointment.save();

    // Record transaction for user (metadata only)
    try {
      await User.updateOne(
        { _id: req.userId },
        {
          $push: {
            transactions: {
              _id: new (require('mongoose').Types.ObjectId)(),
              type: 'appointment',
              amount: appointment.consultationFee,
              currency: 'INR',
              status: 'pending',
              relatedId: appointment._id.toString(),
              relatedTitle: professional.name || 'Consultation',
              description: reason || `${professional.specialization || 'Consultation'} appointment`,
              transactionDate: new Date(),
            }
          }
        }
      );
    } catch (e) {
      // Non-blocking if transaction push fails
    }

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

// Cancel appointment
router.post('/:appointmentId/cancel', authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.appointmentId,
      { status: 'cancelled', updatedAt: Date.now() },
      { new: true }
    ).populate(['userId', 'professionalId']);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment cancelled', appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reschedule appointment (with conflict check)
router.post('/:appointmentId/reschedule', authMiddleware, async (req, res) => {
  try {
    const { appointmentDate, timeSlot } = req.body;
    const existing = await Appointment.findById(req.params.appointmentId);
    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    const conflict = await Appointment.findOne({
      professionalId: existing.professionalId,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: 'scheduled'
    });
    if (conflict) {
      return res.status(409).json({ error: 'Time slot already booked for this professional' });
    }
    existing.appointmentDate = new Date(appointmentDate);
    existing.timeSlot = timeSlot;
    existing.updatedAt = new Date();
    await existing.save();
    const populated = await existing.populate(['userId', 'professionalId']);
    res.json({ message: 'Appointment rescheduled', appointment: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
