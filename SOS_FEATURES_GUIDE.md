# SOS Emergency System - Enhanced Features Guide

## Overview

The SOS Emergency System has been enhanced with dynamic animated UI, live ambulance location tracking, and real-time nurse notifications for immediate assistance.

## New Features

### 1. **Dynamic Animated UI After SOS Button Click**

#### Visual Animations

- **Pulsing Status Badge**: The emergency status badge pulses continuously to draw attention
- **Expanding Alert Circles**: Expanding rings animate outward from the center
- **Rotating Tracking Indicator**: Real-time ambulance tracking shows a rotating indicator
- **Heartbeat Effect**: Responsive elements pulse like a heartbeat for nearby responders

#### User Experience Enhancements

- Device vibration feedback when SOS is triggered
- Alert card with animated icon and timestamp
- Color-coded status indicators (red for critical emergency)
- Real-time progress tracking visualization

**Implementation Details:**

- Uses React Native `Animated` API for smooth animations
- Multiple simultaneous animations with `Animated.parallel()`
- Loop animations with `Animated.loop()` and `Animated.sequence()`
- Native driver optimization for performance

---

### 2. **Live Ambulance Location Map**

#### Features

- **Mock Map Viewer**: Visual representation of emergency location and ambulance movement
- **Interactive Map Tab**: Access via "Live Map" tab on emergency tracking screen
- **Real-time Updates**: Ambulance position updates as it approaches
- **Distance & ETA**: Shows current distance and estimated time of arrival
- **Speed Indicator**: Displays ambulance speed in km/h

#### Map Display Components

```
┌─────────────────────────────┐
│  📍 Live Location Tracking  │
├─────────────────────────────┤
│                             │
│    Grid-based Map View      │
│  - Your Location (red)      │
│  - Ambulance (orange)       │
│  - Nearby Nurses (pink)     │
│                             │
│  Legend & Real-time Info    │
└─────────────────────────────┘
```

#### Tracking Data Provided

- **Distance to Emergency**: Updated as ambulance approaches
- **ETA (Estimated Time of Arrival)**: Calculated from current position
- **Speed**: Real-time speed of the ambulance
- **Progress Bar**: Visual indication of ambulance proximity

**Implementation:**

- Simulated ambulance positions updated every 3 seconds
- Realistic ETA calculations based on distance
- Smooth animation transitions between positions

---

### 3. **Nurse Notification System**

#### Automatic Notification Process

When SOS is triggered:

1. **Geolocation Detection**: System determines user's GPS coordinates
2. **Nurse Discovery**: Searches for available nurses within 5km radius
3. **Instant Alert**: Notifies all nearby nurses through:
   - Socket.io real-time events
   - Push notifications (via system)
   - In-app alert badges

#### Notification Features

- **Immediate Dispatch**: Nurses are notified instantly
- **Location Data**: Precise coordinates sent to responders
- **Severity Level**: Critical severity flag for priority response
- **Confirmation Status**: Visual badges show which nurses are notified

#### Nurse Response Flow

```
User Triggers SOS
    ↓
System Gets Location
    ↓
Find Nearby Nurses (within 5km)
    ↓
Send Real-time Notification via Socket.io
    ↓
Nurses Receive Alert with Location & Severity
    ↓
Nurses Accept/Respond to Emergency
    ↓
Live Tracking Begins
```

#### Backend Endpoints

- **POST** `/api/emergency/:emergencyId/notify-nurses`

  - Request Body: `{ latitude, longitude }`
  - Response: List of notified nurses with distance metrics

- **GET** `/api/emergency/:emergencyId/tracking`
  - Returns: Real-time ambulance tracking data

---

## Socket.io Events

### Client → Server Events

#### Emergency Alerts

```javascript
// Trigger emergency alert
socket.emit('emergency-alert', {
  victimId: string,
  victimName: string,
  latitude: number,
  longitude: number,
  emergencyContactPhone: string,
  liveTracking: boolean,
  timestamp: Date
});

// Notify nearby volunteers
socket.emit('volunteer-alert', {
  victimId: string,
  victimName: string,
  latitude: number,
  longitude: number,
  severity: 'low' | 'medium' | 'high' | 'critical',
  timestamp: Date
});

// Nurse-specific notification
socket.emit('nurse-notification', {
  emergencyId: string,
  victimId: string,
  victimName: string,
  latitude: number,
  longitude: number,
  severity: string,
  nurseIds: string[],
  timestamp: Date,
  message: string
});

// Ambulance location update
socket.emit('ambulance-location', {
  emergencyId: string,
  ambulanceId: string,
  latitude: number,
  longitude: number,
  speed: number,
  heading: number,
  eta: number,
  distance: number,
  status: 'en-route' | 'arrived' | 'completed',
  timestamp: Date
});

// Responder call initiation
socket.emit('responder-call', {
  emergencyId: string,
  responderId: string,
  responderName: string,
  responderPhone: string
});
```

### Server → Client Events (Broadcasts)

```javascript
// Emergency broadcast to all users
io.emit('emergency-broadcast', {
  victimId: string,
  victimName: string,
  latitude: number,
  longitude: number,
  emergencyContactPhone: string,
  timestamp: Date,
  liveTracking: boolean
});

// Volunteer notification broadcast
io.emit('volunteer-notification', {
  victimId: string,
  victimName: string,
  latitude: number,
  longitude: number,
  severity: string,
  timestamp: Date,
  message: string
});

// Nurse alert broadcast
io.emit('nurse-alert', {
  emergencyId: string,
  victimId: string,
  victimName: string,
  latitude: number,
  longitude: number,
  severity: string,
  nurseIds: string[],
  timestamp: Date,
  message: string
});

// Direct nurse alert
io.emit('direct-nurse-alert', {
  emergencyId: string,
  targetNurses: string[],
  victimName: string,
  location: { latitude: number, longitude: number },
  severity: string,
  timestamp: Date
});

// Ambulance update
io.emit('ambulance-update', {
  emergencyId: string,
  ambulanceId: string,
  latitude: number,
  longitude: number,
  speed: number,
  heading: number,
  eta: number,
  distance: number,
  status: string,
  timestamp: Date
});

// Responder calling notification
io.emit('responder-calling', {
  emergencyId: string,
  responderId: string,
  responderName: string,
  responderPhone: string,
  timestamp: Date
});
```

---

## UI/UX Enhancements

### Emergency Tracking Screen Tabs

1. **Status Tab** (Default)

   - SOS Alert Card with animation
   - Ambulance tracking with progress
   - Nurse notification status
   - Emergency location coordinates
   - Emergency details and severity

2. **Live Map Tab** (New)

   - Interactive mock map viewer
   - Real-time position markers
   - Map legend for marker types
   - Live tracking information
   - Distance and ETA metrics

3. **Responders Tab**

   - Nearby ambulances
   - Nearby doctors
   - Nearby nurses
   - Distance and ETA for each
   - One-touch calling

4. **Contacts Tab**
   - Emergency contacts list
   - Quick call buttons
   - Contact details

### Animation States

#### SOS Active States

| State         | Animation                | Duration    |
| ------------- | ------------------------ | ----------- |
| Status Badge  | Pulse (1.0 → 1.15 → 1.0) | 1600ms loop |
| Alert Circle  | Expand (0 → 1 → 0)       | 2000ms loop |
| Tracking Icon | Rotate (0° → 360°)       | 3000ms loop |
| Nurse Badges  | Heartbeat (1 → 1.1 → 1)  | 600ms loop  |

### Color Scheme

- **Red (#E53935)**: Critical emergency, alerts
- **Orange (#F44336)**: Ambulance, urgent
- **Pink (#E91E63)**: Nurses, medical
- **Green (#4CAF50)**: Confirmation, success
- **Gray (#999)**: Secondary info

---

## Implementation Details

### Frontend Components Modified

**File**: `frontend/app/emergency/tracking.tsx`

#### New State Variables

```typescript
const [ambulanceLocation, setAmbulanceLocation] = useState<any>(null);
const [notifiedNurses, setNotifiedNurses] = useState<string[]>([]);
const [sosTimestamp, setSosTimestamp] = useState<Date | null>(null);
const scaleAnim = useRef(new Animated.Value(0)).current;
const rotateAnim = useRef(new Animated.Value(0)).current;
const heartbeatAnim = useRef(new Animated.Value(1)).current;
```

#### New Functions

- `startSOSAnimations()`: Initiates all animations
- `notifyNearbyNurses()`: Fetches and notifies nearby nurses
- `simulateAmbulanceTracking()`: Simulates ambulance position updates

#### New Tab

- `activeTab === 'map'`: Live map viewer

### Backend Enhancements

**File**: `backend/routes/emergency.js`

#### New Routes

- `POST /api/emergency/:emergencyId/notify-nurses`
- `GET /api/emergency/:emergencyId/tracking`

**File**: `backend/server.js`

#### New Socket Events

- `nurse-notification`
- `ambulance-location`
- `responder-call`

---

## Testing the Features

### Test SOS Trigger

1. Open the app and navigate to home
2. Click the SOS button
3. Observe:
   - Device vibration
   - Animated status badge
   - Animated alert card
   - Notification alert for nearby nurses
   - "Live Map" tab appears

### Test Live Map

1. After SOS is triggered, click "Live Map" tab
2. Observe:
   - Map grid with markers
   - Pulsing victim location (center)
   - Animated ambulance marker approaching
   - Nurse location markers
   - Real-time distance and ETA updates

### Test Nurse Notifications

1. Trigger SOS at a location
2. Check that nearby nurses (within 5km) are notified
3. Observe green notification badges showing nurse count
4. Verify socket events in browser console (if debugging)

---

## Performance Optimization

### Animation Optimization

- Uses native driver (`useNativeDriver: true`)
- Parallel animations for multiple effects
- Loop animations stop automatically on cleanup

### Socket.io Optimization

- Broadcasts only to relevant clients
- Direct nurse alerts for specific targets
- Debounced location updates

### Memory Management

- Animation refs cleaned up on unmount
- Socket listeners removed on component unmount
- Location tracking intervals cleared when complete

---

## Future Enhancements

1. **Real Map Integration**: Replace mock map with Google Maps API
2. **Voice Notifications**: Audio alerts for nurses
3. **Two-way Communication**: Chat with responders during emergency
4. **Video Call Support**: Video consultation with available doctors
5. **Advanced Pathfinding**: Optimal route calculation for ambulances
6. **Historical Analytics**: Emergency response metrics and statistics
7. **Multi-language Support**: Localized notifications
8. **Accessibility Features**: Voice commands, larger fonts, high contrast

---

## Troubleshooting

### Animations Not Showing

- Verify `useNativeDriver: true` is set
- Check that animated components are properly wrapped
- Ensure animations are started in `useEffect`

### Nurse Notifications Not Received

- Check that user location permission is granted
- Verify nurses are available in database
- Confirm Socket.io connection is established
- Check console for error messages

### Map Not Updating

- Ensure ambulance location simulation interval is active
- Check that `ambulanceLocation` state updates properly
- Verify marker positioning logic

### Performance Issues

- Reduce animation loop count in development
- Use React DevTools Profiler to identify bottlenecks
- Check network tab for socket event frequency

---

## API Reference

### Emergency API Calls

```typescript
// Trigger emergency
emergencyAPI.triggerEmergency({
  latitude: number,
  longitude: number,
  description: string,
  emergencyContactId?: string,
  severity: 'low' | 'medium' | 'high' | 'critical'
});

// Get emergency details
emergencyAPI.getEmergencyDetails(emergencyId: string);

// Update emergency status
emergencyAPI.updateEmergencyStatus(
  emergencyId: string,
  status: 'active' | 'responding' | 'completed' | 'cancelled'
);

// Get nearby professionals
usersAPI.getNearbyProfessionals(
  type: 'doctor' | 'nurse' | 'volunteer',
  latitude: number,
  longitude: number,
  radius: number
);

// Get nearby ambulances
usersAPI.getNearbyAmbulances(
  latitude: number,
  longitude: number,
  radius: number
);
```

---

## Contact & Support

For questions or issues with the SOS Emergency System, please refer to the main documentation or contact the development team.
