require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-healthcare');
    console.log('MongoDB connected');
  } catch (error) {
    console.log('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/booking', require('./routes/booking'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/location', require('./routes/location'));

// Socket.io events for real-time location and alerts
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('update-location', (data) => {
    socket.broadcast.emit('location-update', {
      userId: data.userId,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: new Date()
    });
  });

  socket.on('emergency-alert', (data) => {
    io.emit('emergency-broadcast', {
      victimId: data.victimId,
      victimName: data.victimName,
      latitude: data.latitude,
      longitude: data.longitude,
      emergencyContactPhone: data.emergencyContactPhone,
      timestamp: new Date(),
      liveTracking: data.liveTracking || false
    });
  });

  socket.on('volunteer-alert', (data) => {
    io.emit('volunteer-notification', {
      victimId: data.victimId,
      victimName: data.victimName,
      latitude: data.latitude,
      longitude: data.longitude,
      severity: data.severity,
      timestamp: new Date(),
      message: 'Urgent: Emergency assistance needed'
    });
  });

  // New: Nurse notification handler
  socket.on('nurse-notification', (data) => {
    console.log('Nurse notification triggered:', data.emergencyId);
    
    // Broadcast to all connected nurses
    io.emit('nurse-alert', {
      emergencyId: data.emergencyId,
      victimId: data.victimId,
      victimName: data.victimName,
      latitude: data.latitude,
      longitude: data.longitude,
      severity: data.severity || 'critical',
      nurseIds: data.nurseIds,
      timestamp: data.timestamp || new Date(),
      message: data.message || 'URGENT: Emergency Alert - Immediate assistance needed'
    });

    // Send notification to specific nurses
    if (data.nurseIds && data.nurseIds.length > 0) {
      io.emit('direct-nurse-alert', {
        emergencyId: data.emergencyId,
        targetNurses: data.nurseIds,
        victimName: data.victimName,
        location: {
          latitude: data.latitude,
          longitude: data.longitude
        },
        severity: data.severity || 'critical',
        timestamp: data.timestamp || new Date()
      });
    }
  });

  // New: Ambulance tracking handler
  socket.on('ambulance-location', (data) => {
    io.emit('ambulance-update', {
      emergencyId: data.emergencyId,
      ambulanceId: data.ambulanceId,
      latitude: data.latitude,
      longitude: data.longitude,
      speed: data.speed || 0,
      heading: data.heading || 0,
      eta: data.eta || 0,
      distance: data.distance || 0,
      status: data.status || 'en-route',
      timestamp: new Date()
    });
  });

  // New: Responder call handler
  socket.on('responder-call', (data) => {
    io.emit('responder-calling', {
      emergencyId: data.emergencyId,
      responderId: data.responderId,
      responderName: data.responderName,
      responderPhone: data.responderPhone,
      timestamp: new Date()
    });
  });

  socket.on('ambulance-request', (data) => {
    io.emit('ambulance-alert', {
      requestId: data.requestId,
      latitude: data.latitude,
      longitude: data.longitude,
      priority: data.priority,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
