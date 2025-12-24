# Complete Google Maps Integration Guide - DNA Healthcare App

## ✅ What Has Been Fixed

### 1. **Backend API Enhancements**

- ✅ Fixed nearby professionals endpoint with proper validation
- ✅ Fixed nearby ambulances endpoint with distance calculation
- ✅ Fixed nearby volunteers endpoint with proper error handling
- ✅ All endpoints now return distance property from API

### 2. **Frontend Data Binding**

- ✅ Fixed DoctorsMapScreen to use actual distance from API
- ✅ Fixed nearby/index.tsx to use real location instead of mock
- ✅ Updated emergency tracking to fetch nearby responders properly
- ✅ All components now display calculated distances

### 3. **Configuration Files**

- ✅ Disabled newArchEnabled for stability
- ✅ Updated package.json with compatible versions
- ✅ Updated .babelrc for web support
- ✅ Created GoogleMap.web.tsx fallback

---

## 🚀 How to Run the Complete Setup

### Step 1: Install Dependencies

```bash
# Frontend
cd frontend
rm -r node_modules package-lock.json
npm install

# Backend (if not installed)
cd ../backend
npm install
```

### Step 2: Configure Environment Variables

**Backend - Create `.env` file:**

```
MONGODB_URI=mongodb://localhost:27017/smart-healthcare
NODE_ENV=development
JWT_SECRET=your-secret-key-here
PORT=5000
```

### Step 3: Start MongoDB

```bash
# Make sure MongoDB is running
mongod
```

### Step 4: Start Backend Server

```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### Step 5: Add Mock Data (Important for Testing)

Create a seeding script or manually add users with locations:

```bash
# In MongoDB or MongoDB Compass, add sample users:

# Sample Doctor
{
  "name": "Dr. Smith",
  "email": "doctor@example.com",
  "phone": "9876543210",
  "password": "hashed_password",
  "userType": "doctor",
  "specialization": "General Physician",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "isAvailable": true,
  "yearsOfExperience": 5
}

# Sample Nurse
{
  "name": "Nurse Sarah",
  "email": "nurse@example.com",
  "phone": "9876543211",
  "password": "hashed_password",
  "userType": "nurse",
  "latitude": 28.6150,
  "longitude": 77.2100,
  "isAvailable": true
}

# Sample Ambulance
{
  "name": "Ambulance Service",
  "email": "ambulance@example.com",
  "phone": "9876543212",
  "password": "hashed_password",
  "userType": "ambulance",
  "ambulanceType": "ICU Ambulance",
  "vehicleNumber": "DL-01-AB-1234",
  "operatorName": "Rajesh Kumar",
  "operatorPhone": "9876543213",
  "latitude": 28.6100,
  "longitude": 77.2080,
  "isAvailable": true
}
```

### Step 6: Start Frontend

```bash
cd frontend
npm start

# For web
npm run web

# For iOS
npm run ios

# For Android
npm run android
```

---

## 📍 How the Map Works

### Frontend Flow

```
User Location (GPS)
       ↓
Fetch Nearby Professionals
       ↓
Backend calculates distance & filters by radius
       ↓
Returns sorted list with distance property
       ↓
Display on Map & List
```

### API Endpoints Used

| Endpoint                                    | Purpose                   |
| ------------------------------------------- | ------------------------- |
| `GET /users/nearby/professionals/:userType` | Get nearby doctors/nurses |
| `GET /users/nearby/ambulances`              | Get nearby ambulances     |
| `GET /users/nearby/volunteers`              | Get nearby volunteers     |
| `POST /location/update`                     | Update user location      |
| `POST /emergency/trigger`                   | Trigger emergency         |

### Component Structure

```
DoctorsMapScreen
├── Get User Location (useEffect)
├── Fetch Nearby Professionals (doctors, nurses, ambulances)
├── Display on GoogleMap component
├── Show as List with Cards
└── Book Appointment when clicked

EmergencyTrackingScreen
├── Get Emergency Details
├── Get User Location
├── Fetch Nearby Responders
├── Display live ambulance location
└── Update status in real-time

NearbyFacilitiesScreen
├── Get User Location
├── Fetch by Tab (doctors/nurses/ambulances)
├── Filter by radius
└── Display list with distance
```

---

## 🔧 Key Files Modified

### Backend

- ✅ `routes/users.js` - Enhanced nearby endpoints with validation
- ✅ `utils/geolocation.js` - Distance calculation utilities
- ✅ `models/User.js` - Location fields
- ✅ `server.js` - CORS and Socket.io configuration

### Frontend

- ✅ `app/doctors/map.tsx` - Use real distance from API
- ✅ `app/emergency/tracking.tsx` - Fetch responders properly
- ✅ `app/nearby/index.tsx` - Use real location instead of mock
- ✅ `components/GoogleMap.tsx` - Display markers correctly
- ✅ `components/GoogleMap.web.tsx` - Web fallback (card-based)
- ✅ `utils/api.ts` - API calls

---

## 🧪 Testing the Map

### Test 1: View Nearby Doctors

```
1. Login to the app
2. Go to Doctors → Map
3. Should show your location + nearby doctors
4. Distance should update based on your location
5. Click on a doctor to book appointment
```

### Test 2: Emergency Tracking

```
1. Go to Emergency page
2. Click "SOS" or "Emergency"
3. Should show your location + nearby ambulances/doctors/nurses
4. Map should display all responders
5. Click to contact or assign
```

### Test 3: Nearby Facilities

```
1. Go to Nearby section
2. Switch between Doctors/Nurses/Ambulances
3. Should fetch data from your current location
4. Distance should be accurate
5. Drag radius slider to filter by distance
```

---

## ⚠️ Common Issues & Fixes

### Issue: "Location not available"

**Fix:**

- Grant location permission to the app
- Make sure GPS is enabled on device
- Wait 5 seconds for location to be fetched

### Issue: "No nearby professionals found"

**Fix:**

- Check MongoDB has test data with locations
- Verify coordinates are valid (latitude: -90 to 90, longitude: -180 to 180)
- Increase radius filter value

### Issue: Backend returning empty array

**Fix:**

```bash
# Check MongoDB connection
mongo
use smart-healthcare
db.users.find({ latitude: { $exists: true } }).count()

# Should return count > 0
```

### Issue: Map not showing on web

**Fix:**

- This is expected - GoogleMap.web.tsx shows card-based fallback
- Web doesn't support native maps
- Use native app for full map experience

---

## 📱 Features Implemented

### Core Map Features

- ✅ Display user's current location with GPS
- ✅ Show nearby doctors with specialization
- ✅ Show nearby nurses with ratings
- ✅ Show nearby ambulances with status
- ✅ Calculate real-time distances
- ✅ Filter by radius (5-20 km)
- ✅ Sort by distance (nearest first)
- ✅ Click markers to view details

### Real-time Features

- ✅ Live location updates via Socket.io
- ✅ Emergency alerts broadcast
- ✅ Ambulance tracking
- ✅ Status updates

### Emergency Features

- ✅ SOS button triggers emergency
- ✅ Nearest ambulance auto-assigned
- ✅ Nearest nurse alerted
- ✅ Volunteers nearby notified
- ✅ Live tracking of ambulance

---

## 🔐 Security Notes

1. **API Key**: Ensure Google Maps API key is not exposed in frontend code
2. **Location Data**: Location data is private - implement proper access controls
3. **Authentication**: All endpoints use JWT authentication
4. **CORS**: Configure CORS properly for production
5. **Distance Calculation**: Done on backend for security

---

## 📊 Performance Tips

1. **Limit Results**: API only returns professionals within radius
2. **Cache Locations**: Cache user locations for 30 seconds
3. **Pagination**: Implement pagination for large result sets
4. **Geospatial Index**: Create MongoDB index on coordinates

```javascript
// In MongoDB Compass, run:
db.users.createIndex({ latitude: 1, longitude: 1 });
db.locations.createIndex({ latitude: 1, longitude: 1 });
```

---

## 🎯 Next Steps (Optional Enhancements)

1. **Google Maps Integration**: Replace web fallback with real Google Maps Web API
2. **Directions API**: Show optimal route from ambulance to victim
3. **Real-time Tracking**: Live polyline animation of ambulance route
4. **Notifications**: Push notifications when ambulance is nearby
5. **Ratings System**: Allow users to rate doctors/nurses/ambulances
6. **Booking System**: Integrate with appointment booking

---

## 📞 Support

If you encounter issues:

1. Check backend is running: `curl http://localhost:5000/`
2. Check location data in MongoDB
3. Check browser console for errors
4. Check network tab in DevTools
5. Review logs in both frontend and backend terminals

---

**Status**: ✅ All maps and location features are now functional!
**Last Updated**: December 24, 2025
