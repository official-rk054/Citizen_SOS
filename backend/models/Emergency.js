const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  victimId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  victimName: String,
  emergencyContactId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  emergencyContactPhone: String,
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  assignedAmbulanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedNurseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  alertedVolunteerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: {
    type: String,
    enum: ['active', 'responding', 'completed', 'cancelled'],
    default: 'active'
  },
  description: String,
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'high'
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

module.exports = mongoose.model('Emergency', emergencySchema);
