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
    if (!latitude || !longitude || !description) {
      return res.status(400).json({ error: 'Missing required fields: latitude, longitude, description' });
    }
    const victim = await User.findById(req.userId);
    if (!victim) {
      return res.status(404).json({ error: 'Victim user not found' });
    }
    let emergencyContact = null;
    if (emergencyContactId) {
      emergencyContact = await User.findById(emergencyContactId);
      if (!emergencyContact) {
        return res.status(404).json({ error: 'Emergency contact not found' });
      }
    }
    // Create emergency record
    const emergency = new Emergency({
      victimId: req.userId,
      victimName: victim.name,
      emergencyContactId,
      emergencyContactPhone: emergencyContact?.phone || (victim.emergencyContacts && victim.emergencyContacts[0]?.phone) || '',
      latitude,
      longitude,
      description,
      severity,
      status: 'active'
    });
    try {
      await emergency.save();
    } catch (err) {
      return res.status(500).json({ error: 'Failed to save emergency: ' + err.message });
    }
    // Save location
    try {
      const location = new Location({
        userId: req.userId,
        latitude,
        longitude,
        emergencyId: emergency._id,
        timestamp: new Date()
      });
      await location.save();
    } catch (err) {
      return res.status(500).json({ error: 'Failed to save location: ' + err.message });
    }
    // Find and assign nearest ambulance
    try {
      const nearestAmbulance = await findNearestAmbulance(latitude, longitude);
      if (nearestAmbulance) {
        emergency.assignedAmbulanceId = nearestAmbulance._id;
      }
    } catch (err) {
      // log but don't block
      console.error('Error finding nearest ambulance:', err);
    }
    // Find and assign nearest nurse
    try {
      const nearestNurse = await findNearestProfessional(latitude, longitude, 'nurse');
      if (nearestNurse) {
        emergency.assignedNurseId = nearestNurse._id;
      }
    } catch (err) {
      console.error('Error finding nearest nurse:', err);
    }
    // Alert nearby volunteers
    try {
      const volunteers = await findNearbyVolunteers(latitude, longitude);
      emergency.alertedVolunteerIds = volunteers.map(v => v._id);
    } catch (err) {
      console.error('Error finding nearby volunteers:', err);
    }
    try {
      await emergency.save();
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update emergency: ' + err.message });
    }
    res.status(201).json({
      message: 'Emergency alert triggered',
      emergency: await emergency.populate(['assignedAmbulanceId', 'assignedNurseId', 'alertedVolunteerIds'])
    });
  } catch (error) {
    console.error('Emergency trigger error:', error);
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
    if (!status) {
      return res.status(400).json({ error: 'Missing required field: status' });
    }
    let update = { status };
    if (status === 'completed') {
      update.completedAt = new Date();
    }
    let emergency;
    try {
      emergency = await Emergency.findByIdAndUpdate(
        req.params.emergencyId,
        update,
        { new: true }
      ).populate(['victimId', 'assignedAmbulanceId', 'assignedNurseId']);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update emergency: ' + err.message });
    }
    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }
    res.json({ message: 'Emergency updated', emergency });
  } catch (error) {
    console.error('Emergency update error:', error);
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

// Notify nearby nurses (SOS)
router.post('/:emergencyId/notify-nurses', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const emergency = await Emergency.findById(req.params.emergencyId);

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    // Find nearby nurses within 5km radius
    const nearbyNurses = await User.find({
      userType: 'nurse',
      isAvailable: true,
      latitude: { $exists: true },
      longitude: { $exists: true }
    });

    const notifiedNurses = [];
    
    nearbyNurses.forEach(nurse => {
      const distance = calculateDistance(latitude, longitude, nurse.latitude, nurse.longitude);
      if (distance <= 5) { // 5km radius
        notifiedNurses.push({
          _id: nurse._id,
          name: nurse.name,
          phone: nurse.phone,
          distance: distance.toFixed(2),
          latitude: nurse.latitude,
          longitude: nurse.longitude
        });
      }
    });

    // Update emergency with notified nurses
    emergency.alertedVolunteerIds = [...new Set([...emergency.alertedVolunteerIds, ...notifiedNurses.map(n => n._id)])];
    await emergency.save();

    res.json({
      message: `Notified ${notifiedNurses.length} nearby nurse(s)`,
      notifiedNurses,
      totalNotified: notifiedNurses.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ambulance tracking updates
router.get('/:emergencyId/tracking', async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.emergencyId)
      .populate('assignedAmbulanceId', 'name operatorName phone latitude longitude');

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    if (!emergency.assignedAmbulanceId) {
      return res.json({ tracking: null, message: 'No ambulance assigned' });
    }

    const ambulance = emergency.assignedAmbulanceId;
    const distance = calculateDistance(
      emergency.latitude,
      emergency.longitude,
      ambulance.latitude || 0,
      ambulance.longitude || 0
    );

    res.json({
      ambulance,
      distance: distance.toFixed(2),
      eta: Math.max(Math.ceil(distance / 40 * 60), 1), // Assuming 40 km/h average speed
      speed: Math.random() * 80 + 20 // Mock speed
    });
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
