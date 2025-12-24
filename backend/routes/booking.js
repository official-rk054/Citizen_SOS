const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { calculateDistance } = require('../utils/geolocation');

// Book ambulance or service
router.post('/book', authMiddleware, async (req, res) => {
  try {
    const { ambulanceId, serviceType, description, scheduledTime, amount } = req.body;

    const booking = new Booking({
      userId: req.userId,
      ambulanceId,
      serviceType,
      description,
      scheduledTime,
      amount,
      status: 'pending'
    });

    await booking.save();

    res.status(201).json({
      message: 'Booking created successfully',
      booking: await booking.populate(['userId', 'ambulanceId'])
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's bookings
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
      .populate('ambulanceId', 'name vehicleNumber operatorName phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking status
router.put('/:bookingId', authMiddleware, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { 
        status, 
        paymentStatus,
        completedAt: status === 'completed' ? new Date() : undefined,
        updatedAt: Date.now() 
      },
      { new: true }
    ).populate(['userId', 'ambulanceId']);

    res.json({ message: 'Booking updated', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nearby available ambulances
router.get('/nearby-ambulances', async (req, res) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const ambulances = await User.find({
      userType: 'ambulance',
      isAvailable: true,
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null }
    }).select('-password -documents -paymentMethods -transactions');

    const nearby = ambulances
      .map(amb => ({
        ...amb.toObject(),
        distance: calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          amb.latitude,
          amb.longitude
        )
      }))
      .filter(amb => amb.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance);

    res.json(nearby);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking
router.post('/:bookingId/cancel', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { 
        status: 'cancelled',
        updatedAt: Date.now() 
      },
      { new: true }
    ).populate(['userId', 'ambulanceId']);

    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
