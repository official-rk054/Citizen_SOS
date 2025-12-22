const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Emergency = require('../models/Emergency');
const mongoose = require('mongoose');

// ====== PROFILE ENDPOINTS ======

// Get user profile by ID
router.get('/:userId', auth, async (req, res) => {
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
router.put('/:userId', auth, async (req, res) => {
  try {
    const { name, phone, dateOfBirth, address, city, profilePicture, emergencyContacts } = req.body;

    const updateData = {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(dateOfBirth && { dateOfBirth }),
      ...(address && { address }),
      ...(city && { city }),
      ...(profilePicture && { profilePicture }),
      ...(emergencyContacts && { emergencyContacts }),
      updatedAt: new Date()
    };

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====== DOCUMENTS ENDPOINTS ======

// Get all documents for user
router.get('/:userId/documents', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('documents');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.documents || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add document to user
router.post('/:userId/documents', auth, async (req, res) => {
  try {
    const { name, type, fileUrl } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const document = {
      _id: new mongoose.Types.ObjectId(),
      name,
      type: ['ID', 'Professional', 'Insurance', 'Other'].includes(type) ? type : 'Other',
      fileUrl,
      status: 'Pending',
      uploadedAt: new Date()
    };

    user.documents.push(document);
    await user.save();

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete specific document
router.delete('/:userId/documents/:documentId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const initialLength = user.documents.length;
    user.documents = user.documents.filter(
      (doc) => doc._id.toString() !== req.params.documentId
    );

    if (user.documents.length === initialLength) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await user.save();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====== PAYMENT METHODS ENDPOINTS ======

// Get all payment methods for user
router.get('/:userId/payment-methods', auth, async (req, res) => {
  try {
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
router.post('/:userId/payment-methods', auth, async (req, res) => {
  try {
    const { type, cardHolderName, expiryMonth, expiryYear, upiId, walletProvider, bankName, ifscCode } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Payment type is required' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For card: expect cardLast4, expiryMonth, expiryYear in request (already masked)
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

// Update payment method
router.put('/:userId/payment-methods/:methodId', auth, async (req, res) => {
  try {
    const { cardHolderName, expiryMonth, expiryYear } = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const method = (user.paymentMethods || []).find(m => m._id.toString() === req.params.methodId);
    if (!method) {
      return res.status(404).json({ error: 'Payment method not found' });
    }

    if (cardHolderName) method.cardHolderName = cardHolderName;
    if (expiryMonth) method.expiryMonth = expiryMonth;
    if (expiryYear) method.expiryYear = expiryYear;

    await user.save();

    res.json({
      _id: method._id,
      type: method.type,
      displayName: getPaymentMethodDisplay(method),
      isDefault: method.isDefault
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete payment method
router.delete('/:userId/payment-methods/:methodId', auth, async (req, res) => {
  try {
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
router.post('/:userId/payment-methods/:methodId/set-default', auth, async (req, res) => {
  try {
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

// ====== TRANSACTION HISTORY ======

// Get user transactions
router.get('/:userId/transactions', auth, async (req, res) => {
  try {
    const { filter } = req.query;
    const user = await User.findById(req.params.userId).select('transactions');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let transactions = user.transactions || [];

    if (filter && filter !== 'all') {
      transactions = transactions.filter(t => t.status === filter);
    }

    // Sort by date, newest first
    transactions.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add transaction (internal use)
router.post('/:userId/transactions', auth, async (req, res) => {
  try {
    const { type, amount, description, relatedId, paymentMethod } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ error: 'Type and amount are required' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const transaction = {
      _id: new mongoose.Types.ObjectId(),
      type,
      amount,
      currency: 'INR',
      status: 'completed',
      relatedId,
      description,
      paymentMethod,
      transactionDate: new Date()
    };

    if (!user.transactions) user.transactions = [];
    user.transactions.push(transaction);
    await user.save();

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====== ORDER HISTORY ======

// Get order history for user
router.get('/:userId/orders', auth, async (req, res) => {
  try {
    const { filter } = req.query;
    const userId = req.params.userId;

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

// ====== USER PREFERENCES ======

// Get user preferences
router.get('/:userId/preferences', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('preferences');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.preferences || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user preferences
router.put('/:userId/preferences', auth, async (req, res) => {
  try {
    const { notificationsEnabled, emailNotifications, smsNotifications, darkMode, privacyLevel } = req.body;

    const updateData = {};
    if (notificationsEnabled !== undefined) updateData['preferences.notificationsEnabled'] = notificationsEnabled;
    if (emailNotifications !== undefined) updateData['preferences.emailNotifications'] = emailNotifications;
    if (smsNotifications !== undefined) updateData['preferences.smsNotifications'] = smsNotifications;
    if (darkMode !== undefined) updateData['preferences.darkMode'] = darkMode;
    if (privacyLevel) updateData['preferences.privacyLevel'] = privacyLevel;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updateData,
      { new: true }
    ).select('preferences');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====== RATINGS & REVIEWS ======

// Get user ratings
router.get('/:userId/ratings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('ratings');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.ratings || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add rating/review for user
router.post('/:userId/ratings', auth, async (req, res) => {
  try {
    const { rating, comment, ratedBy } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const review = {
      userId: ratedBy || 'anonymous',
      rating,
      comment: comment || '',
      createdAt: new Date()
    };

    if (!user.ratings) {
      user.ratings = {
        averageRating: 0,
        totalReviews: 0,
        reviews: []
      };
    }

    user.ratings.reviews.push(review);
    user.ratings.totalReviews = user.ratings.reviews.length;

    // Calculate average
    const sum = user.ratings.reviews.reduce((acc, r) => acc + r.rating, 0);
    user.ratings.averageRating = parseFloat((sum / user.ratings.totalReviews).toFixed(2));

    await user.save();

    res.status(201).json({
      review,
      averageRating: user.ratings.averageRating,
      totalReviews: user.ratings.totalReviews
    });
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
