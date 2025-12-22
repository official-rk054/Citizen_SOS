const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { calculateDistance, sortByDistance, isValidCoordinates } = require('../utils/geolocation');

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.userId !== req.params.userId && req.userType !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update location
router.post('/update-location/:userId', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { latitude, longitude, updatedAt: Date.now() },
      { new: true }
    );
    res.json({ message: 'Location updated', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nearby professionals (doctors/nurses)
router.get('/nearby/professionals/:userType', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;
    const professionals = await User.find({
      userType: req.params.userType,
      isAvailable: true,
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null }
    }).select('-password');

    // Filter by distance (simplified - in production use geospatial queries)
    const nearby = professionals.filter(prof => {
      const distance = calculateDistance(latitude, longitude, prof.latitude, prof.longitude);
      return distance <= radius;
    }).sort((a, b) => {
      const distA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
      const distB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
      return distA - distB;
    });

    res.json(nearby);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nearby ambulances
router.get('/nearby/ambulances', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;
    const ambulances = await User.find({
      userType: 'ambulance',
      isAvailable: true,
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null }
    }).select('-password');

    const nearby = ambulances.filter(amb => {
      const distance = calculateDistance(latitude, longitude, amb.latitude, amb.longitude);
      return distance <= radius;
    }).sort((a, b) => {
      const distA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
      const distB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
      return distA - distB;
    });

    res.json(nearby);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available volunteers
router.get('/nearby/volunteers', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;
    const volunteers = await User.find({
      userType: 'volunteer',
      isAvailable: true,
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null }
    }).select('-password');

    const nearby = volunteers.filter(vol => {
      const distance = calculateDistance(latitude, longitude, vol.latitude, vol.longitude);
      return distance <= radius;
    }).sort((a, b) => {
      const distA = calculateDistance(latitude, longitude, a.latitude, a.longitude);
      const distB = calculateDistance(latitude, longitude, b.latitude, b.longitude);
      return distA - distB;
    });

    res.json(nearby);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistanceHelper(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = router;
