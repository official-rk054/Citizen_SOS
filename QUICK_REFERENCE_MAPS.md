# 🗺️ QUICK REFERENCE - DNA Healthcare Maps

## 🚀 Start Everything (Windows)

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm start
```

## 📍 Testing the Map

### Test Map Endpoints

```bash
# Doctors
curl "http://localhost:5000/api/users/nearby/professionals/doctor?latitude=28.6139&longitude=77.2090&radius=10"

# Ambulances
curl "http://localhost:5000/api/users/nearby/ambulances?latitude=28.6139&longitude=77.2090&radius=10"

# Nurses
curl "http://localhost:5000/api/users/nearby/professionals/nurse?latitude=28.6139&longitude=77.2090&radius=10"
```

### Check Response Format

```json
[
  {
    "_id": "123",
    "name": "Dr. Smith",
    "latitude": 28.6139,
    "longitude": 77.209,
    "distance": 0.5, // ← KEY: Distance in km
    "specialization": "General Physician",
    "isAvailable": true,
    "rating": 4.8
  }
]
```

## 🗄️ Database Seed

```bash
cd backend
mongosh
load('./seed.js')
```

## 🔧 Quick Fixes

### Issue: "No professionals found"

```bash
# Seed test data
cd backend && mongosh && load('./seed.js')

# Or manually add user with location:
db.users.insertOne({
  name: "Dr. Test",
  latitude: 28.6139,
  longitude: 77.2090,
  userType: "doctor",
  isAvailable: true,
  email: "test@test.com",
  phone: "9876543210",
  password: "$2a$10$..."
})
```

### Issue: "Cannot GET /api/users"

```bash
# Backend not running
cd backend && npm start
# Should see: "Listening on port 5000"
```

### Issue: Location showing (0, 0)

```bash
# Grant location permission to app
# Enable GPS on device/simulator
# Wait 5 seconds for location fix
```

## 📱 App Navigation

```
Home/Login
  ↓
(tabs) - Main Navigation
  ├─ Home/Explore (index.tsx)
  ├─ Doctors Map (doctors/map.tsx)
  ├─ Emergency (emergency/tracking.tsx)
  ├─ Nearby (nearby/index.tsx)
  └─ Profile (profile/index.tsx)

Doctors Map Features:
  ├─ Show user location (green)
  ├─ Show nearby doctors (blue)
  ├─ Show nearby nurses (red)
  ├─ Show nearby ambulances (orange)
  ├─ Filter by type
  ├─ Filter by distance
  └─ Book appointment

Emergency Features:
  ├─ Trigger SOS
  ├─ Show nearby ambulances
  ├─ Show nearby nurses
  ├─ Show nearby volunteers
  ├─ Live tracking
  └─ Update status

Nearby Features:
  ├─ Select type (doctors/nurses/ambulances)
  ├─ Show list with distances
  ├─ Adjust radius slider
  ├─ View on map
  └─ Book/Contact
```

## 🔌 API Reference

### Get Nearby Professionals

```
GET /api/users/nearby/professionals/:userType
?latitude=28.6139&longitude=77.2090&radius=10

Response: Array of professionals with distance property
```

### Get Nearby Ambulances

```
GET /api/users/nearby/ambulances
?latitude=28.6139&longitude=77.2090&radius=10

Response: Array of ambulances with distance property
```

### Get Nearby Volunteers

```
GET /api/users/nearby/volunteers
?latitude=28.6139&longitude=77.2090&radius=10

Response: Array of volunteers with distance property
```

### Update Location

```
POST /api/location/update
Body: { latitude, longitude, address, accuracy, emergencyId }

Response: { message, location }
```

### Trigger Emergency

```
POST /api/emergency/trigger
Body: { latitude, longitude, description, severity }

Response: { message, emergency }
```

## 📊 Distance Calculation

```
Haversine Formula: d = 2 * R * atan2(√a, √(1−a))

Where:
  d = distance in km
  R = Earth's radius = 6371 km
  a = sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)
  φ = latitude
  λ = longitude
```

## 🗺️ Marker Colors

| Type      | Color  | Icon |
| --------- | ------ | ---- |
| User      | Green  | 📍   |
| Doctor    | Blue   | 👨‍⚕️   |
| Nurse     | Red    | 👩‍⚕️   |
| Ambulance | Orange | 🚑   |
| Emergency | Yellow | 🚨   |

## 💾 Database Schema

```javascript
User {
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  userType: ['user','doctor','nurse','ambulance','volunteer'],
  latitude: Number,
  longitude: Number,
  isAvailable: Boolean,
  specialization: String,    // for doctor/nurse
  rating: Number,
  yearsOfExperience: Number, // for doctor/nurse
  vehicleNumber: String,     // for ambulance
  emergencyContacts: Array,
  createdAt: Date,
  updatedAt: Date
}

Location {
  userId: ObjectId,
  latitude: Number,
  longitude: Number,
  address: String,
  accuracy: Number,
  emergencyId: ObjectId,
  timestamp: Date
}

Emergency {
  victimId: ObjectId,
  latitude: Number,
  longitude: Number,
  status: ['active','responding','completed'],
  assignedAmbulanceId: ObjectId,
  assignedNurseId: ObjectId,
  alertedVolunteerIds: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Test Coordinates

```javascript
// Delhi, India (test location)
latitude: 28.6139;
longitude: 77.209;

// San Francisco (alt test)
latitude: 37.7749;
longitude: -122.4194;

// London (alt test)
latitude: 51.5074;
longitude: -0.1278;
```

## 📦 Environment Variables

```env
# backend/.env
MONGODB_URI=mongodb://localhost:27017/smart-healthcare
NODE_ENV=development
JWT_SECRET=your-secret-key
PORT=5000
```

## 🎯 Success Checklist

- [ ] Backend running on port 5000
- [ ] MongoDB connected
- [ ] Test data seeded
- [ ] API returns distance property
- [ ] App shows user location
- [ ] Map displays markers
- [ ] Distances are accurate
- [ ] Emergency SOS works
- [ ] No console errors

## 📚 Documentation Files

- `MAPS_COMPLETE_GUIDE.md` - Full integration guide
- `COMPLETE_MAP_SETUP.md` - Setup instructions
- `MAPS_IMPLEMENTATION_COMPLETE.md` - Implementation summary
- `FIX_SUMMARY.md` - What was fixed
- `BEFORE_AFTER_COMPARISON.md` - Before/after changes
- `FIXES_VERIFICATION.md` - Verification checklist

## 🚀 Quick Deploy

```bash
# Backend to Heroku
heroku create your-app
git push heroku main

# Frontend with Expo
eas build --platform all
eas submit -p all
```

## 🆘 Emergency Contacts

```javascript
// For testing, use:
Latitude: 28.6139
Longitude: 77.2090
Radius: 10 km (can adjust)
Severity: 'high', 'medium', 'low'
```

## ⚡ Performance Tips

1. **Cache locations** for 30 seconds
2. **Create DB index** on latitude/longitude
3. **Limit results** to radius only
4. **Sort on backend** not frontend
5. **Exclude sensitive fields** from API response

## 🔐 Security

- ✅ JWT authentication
- ✅ Input validation
- ✅ Password hashing
- ✅ CORS configured
- ✅ Location access controlled

## 📱 Platform Support

| Platform | Map Type  | Status      |
| -------- | --------- | ----------- |
| iOS      | Native    | ✅ Working  |
| Android  | Native    | ✅ Working  |
| Web      | Card List | ✅ Fallback |

---

**Last Updated**: December 24, 2025
**Status**: ✅ All features implemented and tested
