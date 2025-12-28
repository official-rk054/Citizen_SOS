const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  address: String,
  accuracy: Number,
  timestamp: { type: Date, default: Date.now },
  emergencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Emergency' }
});

// Auto-expire location data after 24 hours
locationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Location', locationSchema);
