const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { calculateDistance, sortByDistance, isValidCoordinates } = require('../utils/geolocation');

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

    // Validate required parameters
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    if (!isValidCoordinates(latitude, longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const professionals = await User.find({
      userType: req.params.userType,
      isAvailable: true,
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null }
    }).select('-password -documents -paymentMethods -transactions');

    if (!professionals || professionals.length === 0) {
      return res.json([]);
    }

    // Filter by distance and add distance property
    const nearby = professionals
      .map(prof => ({
        ...prof.toObject(),
        distance: calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          prof.latitude,
          prof.longitude
        )
      }))
      .filter(prof => prof.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance);

    res.json(nearby);
  } catch (error) {
    console.error('Error in nearby professionals:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get nearby ambulances
router.get('/nearby/ambulances', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    // Validate required parameters
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    if (!isValidCoordinates(latitude, longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const ambulances = await User.find({
      userType: 'ambulance',
      isAvailable: true,
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null }
    }).select('-password -documents -paymentMethods -transactions');

    if (!ambulances || ambulances.length === 0) {
      return res.json([]);
    }

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
    console.error('Error in nearby ambulances:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available volunteers
router.get('/nearby/volunteers', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    // Validate required parameters
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    if (!isValidCoordinates(latitude, longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const volunteers = await User.find({
      userType: 'volunteer',
      isAvailable: true,
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null }
    }).select('-password -documents -paymentMethods -transactions');

    if (!volunteers || volunteers.length === 0) {
      return res.json([]);
    }

    const nearby = volunteers
      .map(vol => ({
        ...vol.toObject(),
        distance: calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          vol.latitude,
          vol.longitude
        )
      }))
      .filter(vol => vol.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance);

    res.json(nearby);
  } catch (error) {
    console.error('Error in nearby volunteers:', error);
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

// ====== PAYMENT METHODS ENDPOINTS ======

// Get all payment methods for user
router.get('/:userId/payment-methods', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.userId).select('paymentMethods');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Mask sensitive data before sending
    const methods = (user.paymentMethods || []).map(method => ({
      _id: method._id,
      type: method.type,
      displayName: getPaymentMethodDisplay(method),
      isDefault: method.isDefault,
      isVerified: method.isVerified,
      createdAt: method.createdAt
    }));

    res.json(methods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new payment method
router.post('/:userId/payment-methods', authMiddleware, async (req, res) => {
  try {
    const { type, cardHolderName, expiryMonth, expiryYear, upiId, walletProvider, bankName, ifscCode } = req.body;
    const mongoose = require('mongoose');
    const User = require('../models/User');

    if (!type) {
      return res.status(400).json({ error: 'Payment type is required' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const paymentMethod = {
      _id: new mongoose.Types.ObjectId(),
      type,
      ...(cardHolderName && { cardHolderName }),
      ...(req.body.cardLast4 && { cardLast4: req.body.cardLast4 }),
      ...(expiryMonth && { expiryMonth }),
      ...(expiryYear && { expiryYear }),
      ...(upiId && { upiId }),
      ...(walletProvider && { walletProvider }),
      ...(bankName && { bankName }),
      ...(req.body.accountLast4 && { accountLast4: req.body.accountLast4 }),
      ...(ifscCode && { ifscCode }),
      isDefault: (user.paymentMethods || []).length === 0,
      isVerified: false,
      createdAt: new Date()
    };

    if (!user.paymentMethods) user.paymentMethods = [];
    user.paymentMethods.push(paymentMethod);
    await user.save();

    res.status(201).json({
      _id: paymentMethod._id,
      type: paymentMethod.type,
      displayName: getPaymentMethodDisplay(paymentMethod),
      isDefault: paymentMethod.isDefault
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete payment method
router.delete('/:userId/payment-methods/:methodId', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const initialLength = (user.paymentMethods || []).length;
    user.paymentMethods = (user.paymentMethods || []).filter(
      (method) => method._id.toString() !== req.params.methodId
    );

    if (user.paymentMethods.length === initialLength) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    // If deleted method was default, set first as default
    if (user.paymentMethods.length > 0 && !user.paymentMethods.some(m => m.isDefault)) {
      user.paymentMethods[0].isDefault = true;
    }

    await user.save();
    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set default payment method
router.post('/:userId/payment-methods/:methodId/set-default', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const method = (user.paymentMethods || []).find(m => m._id.toString() === req.params.methodId);
    if (!method) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    // Reset all to false
    (user.paymentMethods || []).forEach(m => m.isDefault = false);

    // Set selected to true
    method.isDefault = true;
    await user.save();

    res.json({ message: 'Default payment method updated', defaultMethodId: method._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====== ORDER HISTORY ======

// Get order history for user
router.get('/:userId/orders', authMiddleware, async (req, res) => {
  try {
    const { filter } = req.query;
    const userId = req.params.userId;
    const Appointment = require('../models/Appointment');
    const Emergency = require('../models/Emergency');

    // Fetch appointments and emergencies
    const [appointments, emergencies] = await Promise.all([
      Appointment.find({ userId }).populate('doctorId', 'name specialization userType').lean(),
      Emergency.find({ userId }).populate('assignedAmbulance', 'ambulanceType operatorName').lean()
    ]);

    const orders = [];

    // Add appointments
    if (Array.isArray(appointments)) {
      appointments.forEach(apt => {
        orders.push({
          id: apt._id,
          type: 'Appointment',
          provider: apt.doctorId?.name || 'Unknown',
          providerType: apt.doctorId?.userType || 'doctor',
          date: apt.appointmentDate || apt.createdAt,
          amount: apt.consultationFee || 500,
          status: apt.status || 'Confirmed',
          icon: apt.doctorId?.userType === 'nurse' ? '👩‍⚕️' : '👨‍⚕️'
        });
      });
    }

    // Add emergencies
    if (Array.isArray(emergencies)) {
      emergencies.forEach(emg => {
        orders.push({
          id: emg._id,
          type: 'Ambulance',
          provider: emg.assignedAmbulance?.operatorName || 'Ambulance Service',
          date: emg.createdAt,
          amount: emg.estimatedCost || 2000,
          status: emg.status || 'Completed',
          icon: '🚑'
        });
      });
    }

    // Sort by date (newest first)
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply filter
    let filtered = orders;
    if (filter && filter !== 'All') {
      filtered = orders.filter(o => o.status === filter);
    }

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====== USER PROFILE ENDPOINTS ======

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

// ====== HELPER FUNCTION ======

function getPaymentMethodDisplay(method) {
  switch (method.type) {
    case 'card':
      return `Card ending in ${method.cardLast4 || '****'}`;
    case 'upi':
      return method.upiId || 'UPI';
    case 'wallet':
      return `${method.walletProvider || 'Wallet'}`;
    case 'bank_transfer':
      return `${method.bankName || 'Bank'} - ${method.accountLast4 || '****'}`;
    default:
      return 'Payment Method';
  }
}

module.exports = router;
