require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

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
app.use('/api/profile', require('./routes/profile'));
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
