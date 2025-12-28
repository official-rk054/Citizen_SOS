const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  userType: {
    type: String,
    enum: ['user', 'doctor', 'nurse', 'ambulance', 'volunteer'],
    required: true
  },
  profilePicture: String,
  dateOfBirth: Date,
  address: String,
  city: String,
  latitude: Number,
  longitude: Number,
  isAvailable: { type: Boolean, default: true },
  emergencyContacts: [{
    name: String,
    phone: String,
    relationship: String
  }],
  // For doctors/nurses
  licenseNumber: String,
  specialization: String,
  yearsOfExperience: Number,
  // For ambulance services
  ambulanceType: String,
  vehicleNumber: String,
  operatorName: String,
  operatorPhone: String,
  // Documents
  documents: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    type: {
      type: String,
      enum: ['ID', 'Professional', 'Insurance', 'Other'],
      default: 'Other'
    },
    fileUrl: String,
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending'
    },
    uploadedAt: { type: Date, default: Date.now },
    verifiedAt: Date,
    verifiedBy: String
  }],
  // Payment Methods
  paymentMethods: [{
    _id: mongoose.Schema.Types.ObjectId,
    type: {
      type: String,
      enum: ['card', 'upi', 'wallet', 'bank_transfer'],
      required: true
    },
    cardLast4: String, // Only last 4 digits
    cardHolderName: String,
    expiryMonth: Number,
    expiryYear: Number,
    upiId: String,
    walletProvider: String,
    bankName: String,
    accountLast4: String, // Only last 4 digits
    ifscCode: String,
    isDefault: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  // Transaction & Order History
  transactions: [{
    _id: mongoose.Schema.Types.ObjectId,
    type: {
      type: String,
      enum: ['appointment', 'ambulance', 'service', 'other'],
      required: true
    },
    amount: Number,
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    relatedId: String,
    relatedTitle: String,
    paymentMethod: String,
    description: String,
    transactionDate: { type: Date, default: Date.now }
  }],
  // Preferences & Settings
  preferences: {
    notificationsEnabled: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false },
    privacyLevel: {
      type: String,
      enum: ['public', 'private', 'contacts_only'],
      default: 'private'
    }
  },
  // Ratings & Reviews
  ratings: {
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    reviews: [{
      userId: String,
      rating: Number,
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
