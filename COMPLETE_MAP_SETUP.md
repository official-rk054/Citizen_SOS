# DNA Healthcare App - Complete Map & Location Features Setup

## 📋 Overview

This guide will help you set up and run the complete DNA Healthcare App with fully functional:

- ✅ Google Maps integration (native iOS/Android)
- ✅ Real-time location tracking
- ✅ Nearby doctors/nurses/ambulances discovery
- ✅ Emergency SOS with auto-assignment
- ✅ Live ambulance tracking
- ✅ Distance calculations

---

## ⚙️ System Requirements

- **Node.js**: v18 or higher
- **MongoDB**: Local or cloud (MongoDB Atlas)
- **npm**: v9 or higher
- **Git**: For version control
- **VS Code**: Recommended editor

---

## 🚀 Quick Start (Windows)

### Option 1: Automated Setup (Easiest)

```bash
# Navigate to project root
cd c:\Users\rishi\OneDrive\Desktop\DNA

# Run setup script
setup.bat
```

This will:

- ✅ Install backend dependencies
- ✅ Install frontend dependencies
- ✅ Create `.env` file
- ✅ Show you next steps

### Option 2: Manual Setup

#### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### Step 2: Create Environment File

**File: `backend/.env`**

```
MONGODB_URI=mongodb://localhost:27017/smart-healthcare
NODE_ENV=development
JWT_SECRET=dna-healthcare-app-secret-key-change-in-production
PORT=5000
```

#### Step 3: Start MongoDB

```bash
# Option A: Local MongoDB (if installed)
mongod

# Option B: MongoDB Atlas (Cloud)
# Update MONGODB_URI in .env with your connection string
```

#### Step 4: Seed Test Data

```bash
cd backend

# Option A: Using MongoDB Shell
mongosh
> load('./seed.js')

# Option B: Using MongoDB Compass
# Import the seed.js data manually
```

#### Step 5: Start Backend

```bash
cd backend
npm start
# Backend running on http://localhost:5000
```

#### Step 6: Start Frontend

**In a new terminal:**

```bash
cd frontend

# For iOS/Android simulator
npm start

# For iOS only
npm run ios

# For Android only
npm run android

# For Web
npm run web
```

---

## 📍 How Maps Work

### Architecture

```
Mobile App (Expo)
    ↓
    ├─ GPS Location Provider
    │   └─ Real-time location tracking
    │
    ├─ Frontend API Client
    │   └─ Axios with JWT auth
    │
    ↓
Backend Server (Node.js + Express)
    ↓
    ├─ Location Validation
    │   └─ Ensure valid coordinates
    │
    ├─ Distance Calculation
    │   └─ Using Haversine formula
    │
    ├─ Database Query
    │   └─ MongoDB geospatial search
    │
    ├─ Filtering & Sorting
    │   └─ By radius and distance
    │
    ↓
Database (MongoDB)
    ├─ User collection with coordinates
    ├─ Location history
    ├─ Emergency data
    └─ Real-time updates via Socket.io
```

### API Endpoints

#### Get Nearby Professionals

```
GET /api/users/nearby/professionals/:userType

Parameters:
  - userType: 'doctor', 'nurse', 'volunteer'
  - latitude (query)
  - longitude (query)
  - radius (query, default: 5 km)

Response:
  [
    {
      _id: "...",
      name: "Dr. Smith",
      latitude: 28.6139,
      longitude: 77.2090,
      distance: 0.5,  // kilometers
      specialization: "General Physician",
      isAvailable: true,
      ...
    }
  ]
```

#### Get Nearby Ambulances

```
GET /api/users/nearby/ambulances

Parameters:
  - latitude
  - longitude
  - radius (default: 5 km)

Response:
  [
    {
      _id: "...",
      name: "Ambulance #101",
      vehicleNumber: "DL-01-AB-1234",
      latitude: 28.6120,
      longitude: 77.2070,
      distance: 0.8,
      isAvailable: true,
      ...
    }
  ]
```

---

## 🧪 Testing the Setup

### Test 1: Backend Connectivity

```bash
# Open browser or use curl
http://localhost:5000/

# Should return 200 OK
```

### Test 2: Database Connection

```bash
curl http://localhost:5000/api/users/nearby/professionals/doctor?latitude=28.6139&longitude=77.2090&radius=10

# Should return array of doctors (or empty array if no test data)
```

### Test 3: Nearby Doctors Map

```bash
1. Login to app
2. Navigate to: Doctors → Map
3. Should show your location (green pin)
4. Should show nearby doctors (blue pins)
5. Tap on doctor to see details
6. Tap "Book" to book appointment
```

### Test 4: Emergency SOS

```bash
1. Navigate to Emergency page
2. Tap "SOS" button
3. Grant location permission
4. Should create emergency
5. Should show nearby ambulances
6. Map should display all responders
```

### Test 5: Nearby Facilities

```bash
1. Navigate to Nearby page
2. Should show your location
3. Should show nearby professionals
4. Distance should be accurate (from API)
5. Drag radius slider to filter
```

---

## 📦 Test Data

### Seeded Users

The `seed.js` file creates:

1. **3 Doctors** in Delhi

   - Dr. Rajesh Kumar (General Physician)
   - Dr. Priya Sharma (Cardiologist)
   - Dr. Amit Verma (Pediatrician)

2. **2 Nurses** in Delhi

   - Nurse Anjali Singh (Home Care)
   - Nurse Rahul Patel (ICU Care)

3. **2 Ambulances** in Delhi

   - Ambulance 101 (ICU Ambulance)
   - Ambulance 102 (Basic Life Support)

4. **2 Volunteers** in Delhi
   - Volunteer Deepak Gupta
   - Volunteer Meera Nair

**Location**: All test users are in Delhi area (~28.6139, 77.2090)

### Add Your Own Test Data

```bash
# Using MongoDB Compass:
1. Connect to local MongoDB
2. Select database: smart-healthcare
3. Select collection: users
4. Click Insert Document
5. Add:

{
  "name": "Your Name",
  "email": "your@email.com",
  "phone": "1234567890",
  "userType": "doctor",
  "specialization": "Your Specialty",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "isAvailable": true,
  "password": "$2a$10$..."  // Hashed password
}
```

---

## 🔍 Troubleshooting

### Issue: "Cannot GET /api/users/nearby/professionals/doctor"

**Cause**: Backend not running

**Fix**:

```bash
cd backend
npm start
```

### Issue: "Location not available" in app

**Cause**:

- Location permission not granted
- GPS not enabled
- Device location services disabled

**Fix**:

```
iOS:
  Settings → Privacy → Location Services → App → Allow

Android:
  Settings → Apps → App Permissions → Location → Allow
```

### Issue: Empty array from API

**Cause**: No test data in database

**Fix**:

```bash
cd backend
mongosh
> load('./seed.js')
```

### Issue: MongoDB connection error

**Cause**: MongoDB not running

**Fix**:

```bash
# Start MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### Issue: "codegenNativeComponent is not a function"

**Cause**: Old dependency versions

**Fix**:

```bash
cd frontend
rm -r node_modules package-lock.json
npm install
npm start -- --clear
```

### Issue: CORS error from frontend

**Cause**: Backend CORS not properly configured

**Fix**:

- Ensure backend has: `app.use(cors());`
- Check API_URL in `frontend/utils/api.ts`
- Ensure backend is running on port 5000

---

## 📊 Performance Optimization

### Create Database Indexes

```javascript
// In MongoDB Shell
db.users.createIndex({ latitude: 1, longitude: 1 });
db.locations.createIndex({ latitude: 1, longitude: 1 });
db.emergencies.createIndex({ timestamp: 1 }, { expireAfterSeconds: 86400 });
```

### Optimize Queries

```bash
# Backend will:
1. Validate coordinates
2. Filter by distance (radius)
3. Sort by distance
4. Limit results
5. Exclude sensitive fields
```

---

## 🔐 Security Checklist

- [ ] Change `JWT_SECRET` in `.env`
- [ ] Restrict MongoDB to localhost
- [ ] Enable HTTPS in production
- [ ] Use environment variables for sensitive data
- [ ] Implement rate limiting
- [ ] Validate all user inputs
- [ ] Use HTTPS for Google Maps
- [ ] Never expose API keys in frontend code

---

## 📱 Platform-Specific Setup

### iOS

```bash
cd frontend
npm run ios

# Ensure you have:
- Xcode installed
- iOS Simulator running
- Location permission in Info.plist
```

### Android

```bash
cd frontend
npm run android

# Ensure you have:
- Android Studio installed
- Emulator running
- Google Play Services on emulator
- Location permission in AndroidManifest.xml
```

### Web

```bash
cd frontend
npm run web

# Note: Maps show as card-based list on web
# For production web maps, implement Google Maps Web API
```

---

## 📚 Key Files

### Backend

- `server.js` - Main server configuration
- `routes/users.js` - Nearby professionals endpoints
- `routes/emergency.js` - Emergency endpoints
- `routes/location.js` - Location tracking
- `utils/geolocation.js` - Distance calculations
- `models/User.js` - User schema with coordinates
- `models/Emergency.js` - Emergency schema

### Frontend

- `app/doctors/map.tsx` - Doctors map page
- `app/emergency/tracking.tsx` - Emergency tracking
- `app/nearby/index.tsx` - Nearby facilities
- `components/GoogleMap.tsx` - Native map component
- `components/GoogleMap.web.tsx` - Web fallback
- `utils/api.ts` - API client
- `utils/geolocation.ts` - Distance helpers
- `context/AuthContext.tsx` - Authentication

---

## 🚢 Deployment

### Backend Deployment (Heroku)

```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=<your-mongo-atlas-uri>
heroku config:set JWT_SECRET=<your-secret>

# Deploy
git push heroku main
```

### Frontend Deployment (Expo)

```bash
# Build for app stores
eas build --platform all

# Submit to app stores
eas submit -p all
```

---

## 📞 Support & Debugging

### Enable Debug Logging

```javascript
// Backend: server.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.query);
  next();
});

// Frontend: app/doctors/map.tsx
console.log("Fetching professionals...", latitude, longitude);
```

### Check Network Requests

```bash
# Frontend DevTools (Network tab):
1. Open browser DevTools (F12)
2. Go to Network tab
3. Check API requests to http://localhost:5000
4. Check response data and timing
```

### Monitor MongoDB

```bash
# Using MongoDB Compass:
1. Connect to your MongoDB
2. Watch collection: users
3. Check coordinates are saved
4. Verify geospatial index

# Using MongoDB Shell:
db.users.find({ latitude: { $exists: true } })
```

---

## ✅ Verification Checklist

- [ ] Node.js and npm installed
- [ ] MongoDB running locally or Atlas configured
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] `.env` file created
- [ ] Test data seeded
- [ ] Backend running on port 5000
- [ ] Frontend running on port 8081 (web) or iOS/Android
- [ ] Location permission granted
- [ ] GPS enabled on device/simulator
- [ ] Nearby doctors showing on map
- [ ] Distance values displaying correctly
- [ ] Emergency SOS working
- [ ] Ambulance tracking functional

---

## 🎯 Next Steps

1. **Run Setup**

   ```bash
   setup.bat
   ```

2. **Start Services**

   - MongoDB
   - Backend
   - Frontend

3. **Seed Test Data**

   ```bash
   cd backend
   mongosh
   > load('./seed.js')
   ```

4. **Test Map Features**

   - Navigate to Doctors Map
   - Trigger Emergency
   - Check Nearby Facilities

5. **Deploy** (When ready)
   - Backend to Heroku
   - Frontend to Expo/App Stores

---

## 📖 Documentation

- [Google Maps Setup](./MAPS_COMPLETE_GUIDE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Frontend Fix Summary](./frontend/FIX_SUMMARY.md)
- [Before/After Comparison](./frontend/BEFORE_AFTER_COMPARISON.md)

---

## 💡 Tips & Tricks

1. **Test with Different Radii**

   - Small radius (1-5 km): Shows very nearby professionals
   - Medium radius (5-15 km): Shows neighborhood area
   - Large radius (15-50 km): Shows city-wide availability

2. **Test with Multiple Locations**

   - Change phone GPS location to test
   - Use emulator location spoofing
   - Create multiple test users in different cities

3. **Monitor Performance**

   - Check response times in DevTools
   - Monitor memory usage
   - Profile using React DevTools

4. **Test Emergency Flow**
   - Create emergency
   - Verify ambulance auto-assignment
   - Check real-time updates via Socket.io

---

**Status**: ✅ Complete map integration with all location features functional
**Last Updated**: December 24, 2025
**Maintained By**: DNA Healthcare App Team
