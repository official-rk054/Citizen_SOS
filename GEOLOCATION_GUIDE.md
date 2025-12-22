# Geolocation Features Guide

## Overview

The Smart Healthcare App includes comprehensive geolocation functionality for:

- Real-time location tracking
- Finding nearby healthcare professionals
- Emergency response dispatch
- Volunteer alerts based on proximity
- Distance calculations and mapping

---

## Frontend Geolocation (React Native/Expo)

### Location Permissions

The app uses **Expo Location** to request and manage location permissions:

```javascript
import * as Location from "expo-location";

// Request location permission
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== "granted") {
  console.log("Permission denied");
}
```

### Current Location

Get user's current location:

```javascript
const location = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.High,
});

const { latitude, longitude } = location.coords;
```

### Watch Location (Real-time Tracking)

Track location continuously (for emergency response):

```javascript
const subscription = await Location.watchPositionAsync(
  {
    accuracy: Location.Accuracy.High,
    timeInterval: 10000, // Update every 10 seconds
    distanceInterval: 50, // Or when moved 50 meters
  },
  (location) => {
    const { latitude, longitude, accuracy } = location.coords;
    // Update location in backend
    updateLocationAPI(latitude, longitude);
  }
);

// Stop tracking when done
subscription.remove();
```

### Geocoding (Address to Coordinates)

Convert address to latitude/longitude:

```javascript
const geocode = await Location.geocodeAsync("1 Apple Park Way, Cupertino, CA");
const { latitude, longitude } = geocode[0];
```

### Reverse Geocoding (Coordinates to Address)

Convert coordinates to human-readable address:

```javascript
const addressList = await Location.reverseGeocodeAsync({
  latitude: 37.3349,
  longitude: -122.009,
});

const address = addressList[0].city + ", " + addressList[0].region;
```

### Background Location Tracking

For continuous tracking even when app is in background:

```javascript
import * as TaskManager from "expo-task-manager";

const LOCATION_TRACKING = "location-tracking";

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }

  if (data) {
    const { locations } = data;
    // Process locations
  }
});

// Start background tracking
await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
  accuracy: Location.Accuracy.High,
  timeInterval: 60000, // Every minute
  foregroundService: {
    notificationTitle: "Location Tracking",
    notificationBody: "Tracking your emergency response...",
  },
});
```

---

## Backend Geolocation Utilities

### Distance Calculation (Haversine Formula)

Calculate distance between two points:

```javascript
const { calculateDistance } = require("./utils/geolocation");

const distance = calculateDistance(
  37.7749, // User latitude
  -122.4194, // User longitude
  37.3349, // Professional latitude
  -122.009 // Professional longitude
);

console.log(`Distance: ${distance} km`);
```

**Returns**: Distance in kilometers (number)

### Filter by Radius

Find all locations within a radius:

```javascript
const { filterByRadius } = require("./utils/geolocation");

const nearbyUsers = filterByRadius(
  allUsers,
  centerLat,
  centerLon,
  5 // 5 km radius
);
```

**Parameters**:

- `locations` - Array of location objects
- `centerLat` - Center latitude
- `centerLon` - Center longitude
- `radiusKm` - Search radius in kilometers

**Returns**: Filtered array of locations

### Find Nearest

Get the closest location from a list:

```javascript
const { findNearest } = require("./utils/geolocation");

const nearestAmbulance = findNearest(ambulances, 37.7749, -122.4194);

console.log(`Nearest: ${nearestAmbulance.distance} km away`);
```

**Returns**: Object with location data and distance

### Sort by Distance

Sort locations by distance from center:

```javascript
const { sortByDistance } = require("./utils/geolocation");

const sortedProfessionals = sortByDistance(professionals, 37.7749, -122.4194);

// Now sorted nearest to farthest
```

### Get Location Bounds

Get bounding box for a radius (useful for maps):

```javascript
const { getLocationBounds } = require("./utils/geolocation");

const bounds = getLocationBounds(
  37.7749,
  -122.4194,
  5 // 5 km radius
);

// bounds = {
//   minLat: 37.7229,
//   maxLat: 37.8269,
//   minLon: -122.4714,
//   maxLon: -122.3674
// }
```

### Validate Coordinates

Check if coordinates are valid:

```javascript
const { isValidCoordinates } = require("./utils/geolocation");

if (isValidCoordinates(37.7749, -122.4194)) {
  // Valid coordinates
}
```

---

## API Endpoints (Geolocation Related)

### Update Location

```
POST /api/users/update-location/:userId

Request Body:
{
  "latitude": 37.7749,
  "longitude": -122.4194
}

Response:
{
  "message": "Location updated",
  "user": {
    "_id": "...",
    "latitude": 37.7749,
    "longitude": -122.4194
  }
}
```

### Find Nearby Professionals

```
GET /api/users/nearby/professionals/:userType?latitude=37.7749&longitude=-122.4194&radius=5

Query Parameters:
- latitude (required) - User latitude
- longitude (required) - User longitude
- radius (optional) - Search radius in km, default: 5

Response:
[
  {
    "_id": "...",
    "name": "Dr. John Smith",
    "userType": "doctor",
    "specialization": "Emergency Medicine",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "distance": 0.5  // km (calculated on backend)
  },
  ...
]
```

### Find Nearby Ambulances

```
GET /api/users/nearby/ambulances?latitude=37.7749&longitude=-122.4194&radius=5

Response:
[
  {
    "_id": "...",
    "name": "Ambulance Service",
    "userType": "ambulance",
    "ambulanceType": "BLS",
    "vehicleNumber": "AMB-001",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "distance": 1.2  // km
  },
  ...
]
```

### Find Nearby Volunteers

```
GET /api/users/nearby/volunteers?latitude=37.7749&longitude=-122.4194&radius=5

Response:
[
  {
    "_id": "...",
    "name": "John Volunteer",
    "userType": "volunteer",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "distance": 0.8  // km
  },
  ...
]
```

---

## Real-Time Location Tracking

### Socket.io Events

#### Client → Server

```javascript
// Send location update
socket.emit("update-location", {
  userId: "user123",
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 10,
  timestamp: Date.now(),
});
```

#### Server → Clients

```javascript
// Broadcast location update to all connected clients
socket.emit("location-update", {
  userId: "user123",
  latitude: 37.7749,
  longitude: -122.4194,
});
```

---

## Emergency Response Geolocation

### Triggering Emergency

1. **Capture Location**

   ```javascript
   const location = await Location.getCurrentPositionAsync();
   ```

2. **Send to Backend**

   ```javascript
   await emergencyAPI.triggerEmergency({
     latitude: location.coords.latitude,
     longitude: location.coords.longitude,
     severity: "critical",
   });
   ```

3. **Auto-Dispatch**

   - Backend finds nearest ambulance
   - Backend finds nearest nurse
   - Alerts sent to nearby volunteers

4. **Real-Time Tracking**
   - Ambulance location updated every 10 seconds
   - Victim location broadcasted via Socket.io
   - Map shows real-time positions

---

## Location Data Models

### User Location Fields

```javascript
{
  latitude: Number,      // -90 to 90
  longitude: Number,     // -180 to 180
  accuracy: Number,      // in meters
  updatedAt: Date,       // last update timestamp
  isAvailable: Boolean   // for professionals/ambulances
}
```

### Location Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  latitude: Number,
  longitude: Number,
  address: String,
  accuracy: Number,
  createdAt: Date,
  // Auto-delete after 24 hours (TTL index)
}
```

---

## Distance Formulas

### Haversine Formula (Used)

More accurate for Earth's curvature. Used for all distance calculations:

```
a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
c = 2 × atan2(√a, √(1−a))
d = R × c

where:
- φ is latitude
- λ is longitude
- R is earth's radius (6371 km)
```

### Euclidean (Simple, Less Accurate)

```
d = √((lat2-lat1)² + (lon2-lon1)²)
```

---

## Accuracy Levels

### Expo Location Accuracy Options

```javascript
Location.Accuracy.Lowest; // ~5000m, fastest
Location.Accuracy.Low; // ~1000m
Location.Accuracy.Balanced; // ~100m (default)
Location.Accuracy.High; // ~10m
Location.Accuracy.Highest; // ~1m, slowest
```

**Recommendation for Emergency**: Use `High` or `Highest`

---

## Privacy & Permissions

### iOS

1. Add to `app.json`:

   ```json
   "plugins": [
     ["expo-location", {
       "locationAlwaysAndWhenInUsePermission": "Allow $(PRODUCT_NAME) to access your location"
     }]
   ]
   ```

2. User sees permission request
3. Stored securely by iOS

### Android

1. Automatically handled by Expo
2. Users grant in app settings
3. `ACCESS_FINE_LOCATION` permission required

---

## Performance Optimization

### Reduce Update Frequency

```javascript
// Only update when moved 50+ meters
const subscription = await Location.watchPositionAsync(
  { distanceInterval: 50 }, // 50 meters
  onLocationUpdate
);
```

### Batch Updates

```javascript
// Collect multiple updates, send once every 30 seconds
let locationBuffer = [];
setInterval(() => {
  if (locationBuffer.length > 0) {
    sendBatchUpdate(locationBuffer);
    locationBuffer = [];
  }
}, 30000);
```

### Conditional Tracking

```javascript
// Only track during active emergency
if (emergency.status === "active") {
  startLocationTracking();
} else {
  stopLocationTracking();
}
```

---

## Testing Geolocation

### Mock Location (iOS Simulator)

1. Open simulator
2. Features > Location > Custom
3. Enter coordinates
4. Simulator uses mocked location

### Mock Location (Android Emulator)

1. Extended controls > Location
2. Enter coordinates
3. Emulator uses mocked location

### Real Device

1. Allow location permission
2. Actual GPS is used
3. Test with at least 2 devices

---

## Common Use Cases

### 1. Find Nearest Doctor

```javascript
const location = await Location.getCurrentPositionAsync();
const doctors = await usersAPI.getNearbyProfessionals(
  "doctor",
  location.coords.latitude,
  location.coords.longitude,
  10 // 10 km radius
);
// Show closest doctors first
```

### 2. Emergency Auto-Dispatch

```javascript
const ambulances = await getAmbulancesInRadius(userLat, userLon, 5);
const nearest = findNearest(ambulances, userLat, userLon);
dispatch(nearest);
notifyVolunteers(userLat, userLon, 2); // 2 km radius
```

### 3. Track Ambulance Response

```javascript
const emergency = await emergencyAPI.getEmergencyDetails(emergencyId);
const ambulanceLocation = {
  lat: emergency.assignedAmbulance.latitude,
  lon: emergency.assignedAmbulance.longitude,
  eta: calculateETA(emergency),
};
showOnMap(ambulanceLocation);
```

---

## Troubleshooting

### Location Permission Denied

- iOS: Settings > App > Location > Allow Always/While Using App
- Android: App Settings > Permissions > Location > Allow

### Inaccurate Location

- Ensure location accuracy is set to `High` or `Highest`
- Wait for GPS lock (watch for accuracy < 50m)
- Use indoors with WiFi or GPS outside

### Location Not Updating

- Check device location services are enabled
- Verify app has background location permission
- Check subscription is not unsubscribed

### Performance Issues

- Reduce update frequency with `distanceInterval`
- Reduce accuracy level if battery drain is issue
- Stop tracking when not needed

---

## Best Practices

✅ **Do's**:

- Request location only when needed
- Handle permission denials gracefully
- Use appropriate accuracy levels
- Stop tracking when not active
- Validate coordinates before use

❌ **Don'ts**:

- Request location constantly
- Use `Highest` accuracy for all operations
- Track location without user permission
- Store raw location data indefinitely
- Use location without checking validity

---

## Resources

- [Expo Location API](https://docs.expo.dev/versions/latest/sdk/location/)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [Geospatial Indexing](https://docs.mongodb.com/manual/geospatial-queries/)
- [Google Maps API](https://developers.google.com/maps)

---

Generated: December 22, 2025
Updated: Smart Healthcare v1.0.0
