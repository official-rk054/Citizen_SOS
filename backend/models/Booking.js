const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ambulanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  serviceType: {
    type: String,
    enum: ['emergency', 'non-emergency-transport', 'routine-checkup', 'vaccination'],
    required: true,
    default: 'non-emergency-transport'
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  pickupLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  dropoffLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  scheduledTime: Date,
  completedAt: Date,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    default: 0
  },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
