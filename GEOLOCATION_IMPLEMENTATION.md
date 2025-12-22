# ✅ Geolocation Features - Complete Implementation

## What Was Added

### 1. **Backend Geolocation Utilities** ✅

- **File**: `backend/utils/geolocation.js`
- **Functions**:
  - `calculateDistance()` - Haversine formula for accurate distances
  - `filterByRadius()` - Find locations within radius
  - `findNearest()` - Get closest location
  - `sortByDistance()` - Sort by distance
  - `getLocationBounds()` - Bounding box for maps
  - `isValidCoordinates()` - Validate lat/lon

### 2. **Updated Routes** ✅

- `backend/routes/users.js` - Integrated geolocation utilities
- `backend/routes/emergency.js` - Uses geolocation for dispatch
- All nearby-search endpoints now use optimized distance calculations

### 3. **Comprehensive Documentation** ✅

- **GEOLOCATION_GUIDE.md** - Complete geolocation guide

  - Frontend location services (Expo)
  - Backend utility functions
  - Real-time tracking
  - Emergency response geolocation
  - Performance optimization
  - Testing and troubleshooting

- **API_DOCUMENTATION.md** - Updated with geolocation section
  - Distance calculation details
  - Location parameters
  - Real-time tracking events
  - Accuracy levels

---

## Geolocation Features Implemented

### Frontend (React Native/Expo)

✅ **Current Location**

- Get user's precise GPS location
- High accuracy (±10m) for emergencies
- Fallback to balanced accuracy for normal operations

✅ **Real-Time Tracking**

- Continuous location updates every 10 seconds
- Background tracking capability
- Battery-optimized with distance-based updates

✅ **Geocoding**

- Convert address to coordinates
- Reverse geocoding for human-readable addresses

✅ **Background Location Services**

- Continue tracking during emergency
- Foreground service with notifications
- Persist location across app lifecycle

### Backend (Node.js/Express)

✅ **Distance Calculations**

- Haversine formula for earth-accurate distances
- Handles coordinate edge cases
- Validates coordinates before calculation

✅ **Geospatial Queries**

- Find nearby professionals (doctors, nurses)
- Find available ambulances
- Find nearby volunteers
- Customizable radius (1-100+ km)

✅ **Location Sorting**

- Results sorted nearest-first
- Distance included in responses
- Real-time distance updates

✅ **Emergency Dispatch**

- Auto-find nearest ambulance
- Auto-find nearest nurse
- Alert volunteers within radius
- Real-time tracking of responders

---

## API Endpoints with Geolocation

### All Nearby-Search Endpoints

```
GET /api/users/nearby/professionals/:userType?latitude=37.7749&longitude=-122.4194&radius=5
GET /api/users/nearby/ambulances?latitude=37.7749&longitude=-122.4194&radius=5
GET /api/users/nearby/volunteers?latitude=37.7749&longitude=-122.4194&radius=5
GET /api/emergency/nearby?latitude=37.7749&longitude=-122.4194&radius=5
```

### Response Format

All endpoints return distances calculated automatically:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Dr. Smith",
  "userType": "doctor",
  "latitude": 37.775,
  "longitude": -122.4195,
  "specialization": "Emergency Medicine",
  "distance": 0.15 // kilometers
}
```

---

## Accuracy Levels

| Level        | Accuracy | Use Case                    |
| ------------ | -------- | --------------------------- |
| **Lowest**   | ~5000m   | Battery optimization        |
| **Low**      | ~1000m   | Background tracking         |
| **Balanced** | ~100m    | Normal operations (default) |
| **High**     | ~10m     | Ambulance dispatch          |
| **Highest**  | ~1m      | Emergency trigger           |

### Recommended Configuration

```javascript
// Emergency (Highest precision needed)
Location.Accuracy.Highest;

// Ambulance Response (High precision)
Location.Accuracy.High;

// Normal Appointment Booking (Balanced)
Location.Accuracy.Balanced;

// Background/Idle (Low power)
Location.Accuracy.Low;
```

---

## Real-Time Location Tracking

### How It Works

1. **User Enables Location**

   ```javascript
   const location = await Location.getCurrentPositionAsync();
   ```

2. **Sends to Backend**

   ```javascript
   await updateLocation(userId, latitude, longitude);
   ```

3. **Server Broadcasts**

   ```javascript
   socket.emit("location-update", { userId, latitude, longitude });
   ```

4. **All Clients Receive**
   ```javascript
   socket.on("location-update", (data) => {
     updateMapMarker(data);
   });
   ```

### Update Frequency

- **Emergency Active**: Every 10 seconds
- **Appointment Booking**: Every 30 seconds
- **Idle**: Every 60 seconds

---

## Emergency Response Geolocation

### Sequence of Events

1. **Emergency Triggered**

   - Captures high-accuracy location
   - Sends to backend

2. **Auto-Dispatch**

   - Backend calculates nearest ambulance
   - Backend finds nearest nurse
   - Alerts sent to volunteers within 5km

3. **Real-Time Tracking**

   - Ambulance location updated every 10 seconds
   - Victim location broadcast to responders
   - Map shows all positions in real-time

4. **Response Completion**
   - Marks emergency as completed
   - Stops real-time tracking
   - Preserves location history

---

## Utility Functions

### Calculate Distance

```javascript
const distance = calculateDistance(37.7749, -122.4194, 37.3349, -122.009);
// Returns: 52.5 (km)
```

### Filter by Radius

```javascript
const nearby = filterByRadius(
  allProfessionals,
  37.7749, // Center latitude
  -122.4194, // Center longitude
  5 // 5 km radius
);
// Returns array of professionals within 5km
```

### Find Nearest

```javascript
const nearest = findNearest(ambulances, 37.7749, -122.4194);
// Returns: { _id, name, distance: 0.5 }
```

### Sort by Distance

```javascript
const sorted = sortByDistance(professionals, 37.7749, -122.4194);
// Returns professionals sorted by distance (nearest first)
```

### Get Location Bounds

```javascript
const bounds = getLocationBounds(37.7749, -122.4194, 5);
// Returns: { minLat, maxLat, minLon, maxLon }
// Useful for map view bounds
```

---

## Performance Optimization

### Reduce Battery Drain

```javascript
// Update only when moved 50+ meters
await Location.watchPositionAsync(
  { distanceInterval: 50 }, // Instead of every position
  onLocationUpdate
);
```

### Batch Updates

```javascript
let updateBuffer = [];

// Collect updates
socket.on("update-location", (data) => {
  updateBuffer.push(data);
});

// Send batch every 30 seconds
setInterval(() => {
  if (updateBuffer.length > 0) {
    processBatchUpdates(updateBuffer);
    updateBuffer = [];
  }
}, 30000);
```

### Conditional Tracking

```javascript
// Only track during emergency
if (emergency.status === "active") {
  startLocationTracking();
} else {
  stopLocationTracking();
}
```

---

## Testing Geolocation

### iOS Simulator

1. Features > Location > Custom
2. Enter test coordinates
3. Simulator will use mocked location

### Android Emulator

1. Extended controls > Location
2. Enter test latitude/longitude
3. Emulator will use mocked location

### Real Device

1. Grant location permission
2. Actual GPS used
3. Test with 2+ devices

---

## Files Added/Modified

### New Files

- ✅ `backend/utils/geolocation.js` - Utility functions
- ✅ `GEOLOCATION_GUIDE.md` - Complete guide

### Modified Files

- ✅ `backend/routes/users.js` - Integrated utilities
- ✅ `API_DOCUMENTATION.md` - Added geolocation section
- ✅ `frontend/app/(tabs)/index.tsx` - Location tracking (existing)
- ✅ `frontend/app/emergency/tracking.tsx` - Emergency tracking (existing)

---

## Integration Points

### All Screens Using Geolocation

1. **Home Screen** - Captures emergency location
2. **Appointment Booking** - Shows nearby doctors
3. **Ambulance Booking** - Shows nearby ambulances
4. **Doctors Map** - Displays professional locations
5. **Emergency Tracking** - Real-time responder tracking

---

## Socket.io Events (Geolocation)

### Client → Server

```javascript
socket.emit("update-location", {
  userId: "user123",
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 10,
  timestamp: Date.now(),
});
```

### Server → Clients

```javascript
socket.emit("location-update", {
  userId: "user123",
  latitude: 37.7749,
  longitude: -122.4194,
});
```

---

## Database Optimization

### Geospatial Indexes (Future Enhancement)

```javascript
// Create index for faster queries
db.users.createIndex({ latitude: 1, longitude: 1 });

// Or use MongoDB geospatial index
db.users.createIndex({ location: "2dsphere" });
```

### Location History with TTL

```javascript
// Auto-delete old locations after 24 hours
db.locations.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });
```

---

## Accuracy Comparison

| Formula   | Accuracy          | Speed   | Used   |
| --------- | ----------------- | ------- | ------ |
| Haversine | Very High (~0.5%) | Fast    | ✅ Yes |
| Vincenty  | Extremely High    | Slower  | -      |
| Euclidean | Low (varies)      | Fastest | -      |

**Haversine chosen for perfect balance of accuracy and performance**

---

## Privacy & Compliance

✅ **Location Privacy**

- Only stored during emergency
- TTL index removes after 24 hours
- User can disable location sharing
- Secure transmission via HTTPS

✅ **Permissions**

- Explicitly requested from user
- iOS: Settings > Location
- Android: App Permissions > Location
- Users can revoke at any time

---

## Next Steps for Production

1. **Geospatial Indexes**

   - Add MongoDB 2dsphere index
   - Improve query performance

2. **Map Integration**

   - Integrate Google Maps API
   - Show real-time routes

3. **ETA Calculation**

   - Calculate estimated arrival time
   - Update with real data

4. **Offline Support**
   - Cache nearby locations
   - Use offline map data

---

## Quick Reference

### Common Tasks

**Find Nearby Doctors:**

```javascript
GET /api/users/nearby/professionals/doctor?latitude=37.7749&longitude=-122.4194&radius=10
```

**Find Nearest Ambulance:**

```javascript
const ambulances = await getNearbyAmbulances(lat, lon, 50);
const nearest = findNearest(ambulances, lat, lon);
```

**Start Location Tracking:**

```javascript
const subscription = await Location.watchPositionAsync(
  { accuracy: Location.Accuracy.High },
  onUpdate
);
```

**Trigger Emergency with Location:**

```javascript
const location = await Location.getCurrentPositionAsync();
await emergencyAPI.triggerEmergency({
  latitude: location.coords.latitude,
  longitude: location.coords.longitude,
  severity: "critical",
});
```

---

## Support & Troubleshooting

### Location Not Updating

- Check location services enabled on device
- Verify app has location permission
- Ensure GPS/WiFi available
- Check accuracy level setting

### Inaccurate Location

- Use `Accuracy.High` or `Accuracy.Highest`
- Wait for GPS lock (30+ seconds)
- Move outdoors for better signal
- Reduce update frequency

### Performance Issues

- Reduce update frequency
- Lower accuracy level
- Stop tracking when not needed
- Use `distanceInterval` instead of time-based

---

**Version**: 1.0.0
**Status**: Complete ✅
**Last Updated**: December 22, 2025
