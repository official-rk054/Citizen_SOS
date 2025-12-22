const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const authMiddleware = require('../middleware/auth');

// Update location
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, address, accuracy, emergencyId } = req.body;

    const location = new Location({
      userId: req.userId,
      latitude,
      longitude,
      address,
      accuracy,
      emergencyId,
      timestamp: new Date()
    });

    await location.save();

    res.status(201).json({
      message: 'Location updated',
      location
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user location history
router.get('/history/:userId', authMiddleware, async (req, res) => {
  try {
    const locations = await Location.find({ userId: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current location of user (latest)
router.get('/current/:userId', async (req, res) => {
  try {
    const location = await Location.findOne({ userId: req.params.userId })
      .sort({ timestamp: -1 });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
