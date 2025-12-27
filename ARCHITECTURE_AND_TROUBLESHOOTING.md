# Architecture & Troubleshooting Guide

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SMART HEALTHCARE APP                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React Native)                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Authentication Layer                   │   │
│  │  ├─ AuthContext (State Management)                 │   │
│  │  ├─ Storage Service (Token Persistence)            │   │
│  │  └─ Login/Register Screens                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ▲                                  │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Feature Screens                          │   │
│  │  ├─ Home (SOS + Quick Actions)                      │   │
│  │  ├─ Emergency Tracking                             │   │
│  │  ├─ Appointments                                    │   │
│  │  ├─ Ambulance Booking                              │   │
│  │  ├─ Nearby Services Map                            │   │
│  │  ├─ Profile                                        │   │
│  │  └─ Settings (Payment, Documents, etc)             │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ▲                                  │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Communication Layer                        │   │
│  │  ├─ Axios API Client                               │   │
│  │  ├─ Socket.io Client                               │   │
│  │  └─ Location Services                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP + WebSocket
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          API Routes Layer                          │   │
│  │  ├─ /api/auth (Login, Register, Me)               │   │
│  │  ├─ /api/users (Profile, Location, Search)         │   │
│  │  ├─ /api/appointments (Book, List, Update)         │   │
│  │  ├─ /api/booking (Ambulance, Services)             │   │
│  │  ├─ /api/emergency (SOS, Tracking, Notify)         │   │
│  │  ├─ /api/profile (Documents, Payments)             │   │
│  │  └─ /api/location (Track, History)                │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ▲                                  │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        Business Logic Layer                        │   │
│  │  ├─ Geolocation Calculations                       │   │
│  │  ├─ Emergency Response Logic                       │   │
│  │  ├─ Distance Calculations                          │   │
│  │  └─ Validation & Authorization                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ▲                                  │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        Database Models (Mongoose)                  │   │
│  │  ├─ User (Auth, Profile, Location)                 │   │
│  │  ├─ Appointment                                    │   │
│  │  ├─ Booking                                        │   │
│  │  ├─ Emergency                                      │   │
│  │  ├─ Location (History)                             │   │
│  │  └─ Related schemas                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ▲                                  │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        Real-time Layer (Socket.io)                 │   │
│  │  ├─ Emergency Alerts                               │   │
│  │  ├─ Nurse Notifications                            │   │
│  │  ├─ Ambulance Tracking                             │   │
│  │  ├─ Location Updates                               │   │
│  │  └─ Event Broadcasting                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                            │
                            │ Mongoose ODM
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                 DATABASE (MongoDB)                           │
├──────────────────────────────────────────────────────────────┤
│  ├─ users (Profiles, Auth)                                  │
│  ├─ appointments                                             │
│  ├─ bookings                                                 │
│  ├─ emergencies                                              │
│  ├─ locations (History)                                      │
│  └─ Related collections                                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### Emergency (SOS) Flow

```
USER CLICKS SOS
    │
    ▼
┌──────────────────────────────┐
│ Home Screen Triggers SOS     │
│ ├─ Get current location      │
│ ├─ Show loading indicator    │
│ └─ Play vibration            │
└──────────────────────────────┘
    │
    ▼
┌──────────────────────────────┐
│ POST /api/emergency/trigger  │
│ ├─ User ID                   │
│ ├─ Latitude/Longitude        │
│ ├─ Severity (critical)       │
│ └─ Description               │
└──────────────────────────────┘
    │
    ▼
┌──────────────────────────────┐
│ Backend:                     │
│ ├─ Create Emergency record   │
│ ├─ Find nearest ambulance    │
│ ├─ Find nearest nurse        │
│ ├─ Find nearby volunteers    │
│ └─ Save location history     │
└──────────────────────────────┘
    │
    ├─ WebSocket ──────────────────────────┐
    │                                       │
    ▼                                       ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│ Emit Socket Events:      │    │ Update Emergency Record  │
│ ├─ emergency-alert       │    │ with IDs of responders   │
│ ├─ nurse-notification    │    └──────────────────────────┘
│ ├─ volunteer-alert       │
│ └─ ambulance-location    │
└──────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│ Frontend Receives Response:      │
│ ├─ Emergency ID                  │
│ ├─ Assigned ambulance            │
│ ├─ Assigned nurse                │
│ └─ Nearby responders             │
└──────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│ Navigate to Emergency Tracking   │
│ ├─ Show animated SOS status      │
│ ├─ Display live map              │
│ ├─ Start animations              │
│ ├─ Listen to socket events       │
│ └─ Update in real-time           │
└──────────────────────────────────┘
```

### Appointment Booking Flow

```
USER SELECTS PROFESSIONAL
    │
    ▼
┌──────────────────────────────┐
│ Open Booking Modal            │
│ ├─ Select date                │
│ ├─ Select time slot           │
│ └─ Enter reason               │
└──────────────────────────────┘
    │
    ▼
┌──────────────────────────────┐
│ POST /api/appointments/book  │
│ ├─ Professional ID            │
│ ├─ Date & Time               │
│ ├─ Reason                    │
│ └─ User ID                   │
└──────────────────────────────┘
    │
    ▼
┌──────────────────────────────┐
│ Backend Creates Appointment  │
│ ├─ Validate inputs           │
│ ├─ Check availability        │
│ ├─ Save to database          │
│ └─ Return confirmation       │
└──────────────────────────────┘
    │
    ▼
┌──────────────────────────────┐
│ Frontend Updates UI           │
│ ├─ Close modal                │
│ ├─ Show success message       │
│ ├─ Refresh appointments list  │
│ └─ Update local state         │
└──────────────────────────────┘
```

---

## 🚨 Troubleshooting Guide

### Problem: "Cannot POST /api/emergency/trigger"

**Symptoms**:

- SOS button doesn't work
- Error in console: 404 Not Found

**Debugging Steps**:

```bash
# Step 1: Check backend is running
curl http://localhost:5000/

# Step 2: Check specific endpoint exists
curl -X POST http://localhost:5000/api/emergency/trigger

# Step 3: Check with authentication
curl -X POST http://localhost:5000/api/emergency/trigger \
  -H "Authorization: Bearer YOUR_TOKEN"

# Step 4: Check backend logs
# Look at terminal running `npm run dev`
```

**Common Causes**:

- [ ] Backend not running
- [ ] Wrong URL in frontend (check SOCKET_URL)
- [ ] Route not registered in server.js
- [ ] Missing auth middleware

**Solution**:

1. Ensure backend running: `cd backend && npm run dev`
2. Check port 5000 is available
3. Verify `backend/routes/emergency.js` has the route
4. Check `backend/server.js` registers the route

---

### Problem: "Socket.io connection failed"

**Symptoms**:

- Real-time updates not working
- No live map updates
- Nurse notifications not received

**Debugging Steps**:

```javascript
// In frontend console
const socket = io("http://localhost:5000");
socket.on("connect", () => console.log("Connected!"));
socket.on("connect_error", (error) => console.error("Error:", error));
```

**Common Causes**:

- [ ] Backend not running
- [ ] CORS not configured
- [ ] Port 5000 in use
- [ ] Socket.io package not installed

**Solution**:

```javascript
// Check CORS in backend/server.js
const io = socketIO(server, {
  cors: {
    origin: "*", // Change to specific domain in production
    methods: ["GET", "POST"],
  },
});
```

---

### Problem: "API call returns 401 Unauthorized"

**Symptoms**:

- User logged in but API calls fail
- Token not being sent

**Debugging Steps**:

```javascript
// Check if token is stored
import { storageService } from "../utils/storage";
const token = await storageService.getAuthToken();
console.log("Token:", token);

// Check if interceptor is working
// Should see Authorization header in network requests
```

**Common Causes**:

- [ ] Token not stored after login
- [ ] Token expired
- [ ] Interceptor not configured
- [ ] Wrong storage key

**Solution**:

1. Check `frontend/utils/storage.ts` uses correct key
2. Verify `frontend/utils/api.ts` interceptor adds header
3. Check token format: `Bearer {token}`
4. Test token in Postman manually

---

### Problem: "Nearby professionals showing empty list"

**Symptoms**:

- Search returns no doctors/nurses
- Loading spinner appears forever

**Debugging Steps**:

```bash
# Test backend API directly
curl "http://localhost:5000/api/users/nearby/professionals/doctor?latitude=40.7128&longitude=-74.0060&radius=10"

# Check database has professionals
mongo
> db.users.find({ userType: 'doctor' }).count()
```

**Common Causes**:

- [ ] No professionals in database
- [ ] Professionals don't have location set
- [ ] Geolocation validation failing
- [ ] Distance calculation error

**Solution**:

1. Seed database with professionals
2. Ensure professionals have latitude/longitude
3. Check console for validation errors
4. Verify distance calculation logic

---

### Problem: "Payment method doesn't save"

**Symptoms**:

- Click "Add Payment" and nothing happens
- No error message

**Debugging Steps**:

```javascript
// Check if API call is made
console.log("Adding payment:", paymentData);

// Check response
usersAPI
  .addPaymentMethod(userId, paymentData)
  .then((res) => console.log("Response:", res))
  .catch((err) => console.error("Error:", err));
```

**Common Causes**:

- [ ] API not called in handleAddPayment
- [ ] User ID not available
- [ ] Validation error on backend
- [ ] Payment endpoint not connected

**Solution**:

1. Implement the fix from QUICK_FIXES.md
2. Add proper error handling
3. Log all responses
4. Test API with Postman first

---

### Problem: "Animations not smooth"

**Symptoms**:

- SOS button jerky
- Ripple effect stutters
- Map updates lag

**Debugging Steps**:

```javascript
// Check if using native driver
const anim = useRef(new Animated.Value(0)).current;
Animated.timing(anim, {
  toValue: 1,
  duration: 800,
  useNativeDriver: true, // Must be true!
}).start();
```

**Common Causes**:

- [ ] `useNativeDriver: false` (default)
- [ ] Too many simultaneous animations
- [ ] Complex component renders
- [ ] Low device performance

**Solution**:

1. Set `useNativeDriver: true` for all animations
2. Use `Animated.Value` not regular state
3. Profile with React Native Profiler
4. Reduce animation complexity on low-end devices

---

### Problem: "Location permission denied"

**Symptoms**:

- Location services not working
- SOS button doesn't trigger
- Can't find nearby services

**Debugging Steps**:

```javascript
// Check permission status
const { status } = await Location.requestForegroundPermissionsAsync();
console.log("Permission status:", status);
```

**Common Causes**:

- [ ] User denied permission
- [ ] App not configured for location
- [ ] Android/iOS manifest missing
- [ ] Emulator location not set

**Solution**:

1. Grant location permission in app settings
2. Check Android manifest has permissions
3. Check iOS Info.plist has location keys
4. Set emulator location in dev tools

---

### Problem: "Database connection failed"

**Symptoms**:

- Backend crashes on start
- "MongoServerSelectionError"

**Debugging Steps**:

```bash
# Check MongoDB is running
mongod --version

# Check connection string
echo $MONGODB_URI

# Test connection
mongo "mongodb://localhost:27017/smart-healthcare"
```

**Common Causes**:

- [ ] MongoDB not running
- [ ] Wrong connection string
- [ ] Port 27017 in use
- [ ] Authentication failed

**Solution**:

1. Start MongoDB: `mongod`
2. Check .env has correct MONGODB_URI
3. Verify database exists
4. Check MongoDB user credentials

---

## 🔍 Monitoring & Debugging Tools

### Backend Debugging

```bash
# Check logs with timestamps
npm run dev 2>&1 | tee backend.log

# Monitor database queries
mongo
> db.setLogLevel(1)

# Test specific endpoint
curl -X POST http://localhost:5000/api/emergency/trigger \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{"latitude":40.7128,"longitude":-74.0060}'
```

### Frontend Debugging

```javascript
// React Native Console
console.log("Debug info");
console.error("Error details");
console.warn("Warnings");

// Network monitoring
import { LogBox } from "react-native";
// Hide specific warnings
LogBox.ignoreLogs(["Possible Unhandled Promise Rejection"]);
```

### Socket.io Debugging

```javascript
// Listen to all events
socket.onAny((event, data) => {
  console.log(`Socket: ${event}`, data);
});

// Monitor connection state
socket.on("connect", () => console.log("Socket connected"));
socket.on("disconnect", () => console.log("Socket disconnected"));
socket.on("connect_error", (err) => console.error("Socket error:", err));
```

---

## ✅ Pre-Deployment Checklist

Before going live:

- [ ] All critical bugs fixed
- [ ] Payment system tested
- [ ] Push notifications working
- [ ] Database backed up
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Performance optimized
- [ ] Security reviewed

---

## 📚 Additional Resources

### Documentation

- MongoDB: https://docs.mongodb.com/
- Express: https://expressjs.com/
- Socket.io: https://socket.io/docs/
- React Native: https://reactnative.dev/

### Tools

- Postman: API testing
- MongoDB Compass: Database GUI
- React Native Debugger: Frontend debugging
- Chrome DevTools: Network inspection

### Packages

```json
{
  "mongoose": "Database ORM",
  "jsonwebtoken": "JWT authentication",
  "bcryptjs": "Password hashing",
  "socket.io": "Real-time events",
  "axios": "HTTP client",
  "react-native-maps": "Maps integration"
}
```

---

Last Updated: December 27, 2025
