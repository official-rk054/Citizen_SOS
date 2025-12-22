const express = require('express');
const router = express.Router();
const Emergency = require('../models/Emergency');
const Location = require('../models/Location');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Trigger emergency
router.post('/trigger', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, description, emergencyContactId, severity = 'high' } = req.body;
    
    const victim = await User.findById(req.userId);
    const emergencyContact = emergencyContactId ? await User.findById(emergencyContactId) : null;

    // Create emergency record
    const emergency = new Emergency({
      victimId: req.userId,
      victimName: victim.name,
      emergencyContactId,
      emergencyContactPhone: emergencyContact?.phone || victim.emergencyContacts[0]?.phone,
      latitude,
      longitude,
      description,
      severity,
      status: 'active'
    });

    await emergency.save();

    // Save location
    const location = new Location({
      userId: req.userId,
      latitude,
      longitude,
      emergencyId: emergency._id,
      timestamp: new Date()
    });
    await location.save();

    // Find and assign nearest ambulance
    const nearestAmbulance = await findNearestAmbulance(latitude, longitude);
    if (nearestAmbulance) {
      emergency.assignedAmbulanceId = nearestAmbulance._id;
    }

    // Find and assign nearest nurse
    const nearestNurse = await findNearestProfessional(latitude, longitude, 'nurse');
    if (nearestNurse) {
      emergency.assignedNurseId = nearestNurse._id;
    }

    // Alert nearby volunteers
    const volunteers = await findNearbyVolunteers(latitude, longitude);
    emergency.alertedVolunteerIds = volunteers.map(v => v._id);

    await emergency.save();

    res.status(201).json({
      message: 'Emergency alert triggered',
      emergency: await emergency.populate(['assignedAmbulanceId', 'assignedNurseId', 'alertedVolunteerIds'])
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active emergencies near user location
router.get('/nearby', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;
    const user = await User.findById(req.userId);

    const emergencies = await Emergency.find({
      status: { $in: ['active', 'responding'] }
    }).populate(['victimId', 'assignedAmbulanceId', 'assignedNurseId']);

    const nearbyEmergencies = emergencies.filter(emg => {
      const distance = calculateDistance(latitude, longitude, emg.latitude, emg.longitude);
      return distance <= radius;
    });

    res.json(nearbyEmergencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update emergency status
router.put('/:emergencyId', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const emergency = await Emergency.findByIdAndUpdate(
      req.params.emergencyId,
      { 
        status,
        completedAt: status === 'completed' ? new Date() : undefined 
      },
      { new: true }
    ).populate(['victimId', 'assignedAmbulanceId', 'assignedNurseId']);

    res.json({ message: 'Emergency updated', emergency });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get emergency details
router.get('/:emergencyId', async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.emergencyId)
      .populate('victimId')
      .populate('assignedAmbulanceId')
      .populate('assignedNurseId')
      .populate('alertedVolunteerIds');

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    res.json(emergency);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
async function findNearestAmbulance(latitude, longitude) {
  const ambulances = await User.find({
    userType: 'ambulance',
    isAvailable: true,
    latitude: { $exists: true },
    longitude: { $exists: true }
  });

  let nearest = null;
  let minDistance = Infinity;

  ambulances.forEach(amb => {
    const distance = calculateDistance(latitude, longitude, amb.latitude, amb.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = amb;
    }
  });

  return nearest;
}

async function findNearestProfessional(latitude, longitude, type) {
  const professionals = await User.find({
    userType: type,
    isAvailable: true,
    latitude: { $exists: true },
    longitude: { $exists: true }
  });

  let nearest = null;
  let minDistance = Infinity;

  professionals.forEach(prof => {
    const distance = calculateDistance(latitude, longitude, prof.latitude, prof.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = prof;
    }
  });

  return nearest;
}

async function findNearbyVolunteers(latitude, longitude, radius = 5) {
  const volunteers = await User.find({
    userType: 'volunteer',
    isAvailable: true,
    latitude: { $exists: true },
    longitude: { $exists: true }
  });

  return volunteers.filter(vol => {
    const distance = calculateDistance(latitude, longitude, vol.latitude, vol.longitude);
    return distance <= radius;
  });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = router;
