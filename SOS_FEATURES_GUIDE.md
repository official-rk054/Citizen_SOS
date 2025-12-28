# SOS Emergency Features Implementation Guide

## Overview

The emergency SOS button is now fully functional with the following features:

1. **Live Location Sharing** - Share location via SMS to emergency contacts
2. **Emergency Responder Notification** - Alert nearby ambulances, nurses, and volunteers
3. **Live Ambulance Tracking** - Real-time tracking of responding ambulance location
4. **In-App Notifications** - Activity feed showing all emergency events
5. **Demo/Presentation Page** - Interactive interface to showcase all features

## Features Breakdown

### 1. SOS Trigger (Emergency Presentation Page)

- **Route**: `/emergency/sos-demo`
- **Access**: "View SOS Demo & Features" button on home screen
- **Functionality**:
  - Visual emergency status display with animations
  - Location-based responder search
  - Real-time status tracking
  - Activity feed/notifications

### 2. Location Sharing via SMS

- **File**: `frontend/utils/emergencyService.ts`
- **Function**: `sendLocationViaSMS()`
- **Requirements**: `expo-sms` package
- **Features**:
  - Google Maps link included in SMS
  - Precise coordinates (latitude/longitude)
  - Emergency ID for tracking
  - Professional emergency alert format

### 3. Responder Notification System

- **Nearby Search Radius**: 5 km (configurable)
- **Responder Types Alerted**:
  - Ambulances (primary)
  - Nurses (medical support)
  - Doctors (on-demand)
  - Volunteers (community assistance)
- **Real-time Socket Integration** for live updates

### 4. Ambulance Live Tracking

- **Tracking Method**: Real-time location updates from ambulance
- **Demo Mode**: Simulated tracking for presentation (30 seconds)
- **ETA Calculation**: Based on distance and assumed 40 km/h average speed
- **Map Integration**: Google Maps embedded view with markers

### 5. In-App Notification System

- **Types**:
  - Alert notifications (SOS triggered)
  - Responder notifications (ambulance/nurse/doctor alerted)
  - Location sharing confirmations
  - Emergency events and updates
- **Auto-dismiss**: 5 seconds after display
- **Persistent Activity Feed**: Accessible in "Notifications" tab

## File Structure

```
frontend/
├── utils/
│   ├── emergencyService.ts       # Core emergency logic
│   └── locationUtils.ts          # Location calculations & formatting
├── app/
│   ├── (tabs)/
│   │   └── index.tsx            # Updated with SOS demo button
│   └── emergency/
│       ├── tracking.tsx          # Original tracking page
│       └── sos-demo.tsx          # NEW: Interactive presentation page
└── components/
    └── SOSButton.tsx             # Enhanced SOS button
```

## Setup Instructions

### Step 1: Install Dependencies

The main dependency needed is `expo-sms` for SMS functionality:

```bash
cd frontend
npm install expo-sms
# or
yarn add expo-sms
```

### Step 2: Verify Permissions (app.json)

Ensure the following permissions are configured in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-sms",
        {
          "smsPermission": "The app needs SMS permission to send emergency alerts"
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "This app needs your location to send emergency alerts"
      }
    }
  }
}
```

### Step 3: Start Testing

Run the app and navigate to the home screen:

```bash
npm start
# or
yarn start
```

Then:

1. Tap "View SOS Demo & Features" button
2. Tap "TRIGGER SOS" to simulate an emergency
3. Watch the activity feed update with notifications
4. Switch between Status, Ambulance, Notifications, and Actions tabs
5. Use "Share Location" or "Open Maps" actions

## API Endpoints Used

The following backend endpoints are utilized:

```
POST   /emergency/trigger              # Create emergency record
GET    /users/nearby/professionals     # Find nearby doctors/nurses
GET    /users/nearby/ambulances        # Find nearby ambulances
GET    /users/nearby/volunteers        # Find nearby volunteers
POST   /users/update-location/:userId  # Update responder location
```

## Database Models

### Emergency Record

```javascript
{
  victimId: ObjectId,
  victimName: String,
  emergencyContactPhone: String,
  latitude: Number,
  longitude: Number,
  assignedAmbulanceId: ObjectId,
  assignedNurseId: ObjectId,
  alertedVolunteerIds: [ObjectId],
  status: String, // 'active', 'responding', 'completed', 'cancelled'
  severity: String, // 'low', 'medium', 'high', 'critical'
  createdAt: Date,
  completedAt: Date
}
```

## Usage Examples

### Trigger SOS

```typescript
import { triggerSOS } from '../../utils/emergencyService';

const result = await triggerSOS(
  { latitude: 28.7041, longitude: 77.1025 },  // User location
  { name: 'John Doe', emergencyContacts: [...] }, // User data
  emergencyContactId  // Optional
);
```

### Get Nearby Responders

```typescript
import { getNearbyResponders } from "../../utils/emergencyService";

const responders = await getNearbyResponders(
  28.7041, // latitude
  77.1025, // longitude
  5 // radius in km
);
```

### Send Location via SMS

```typescript
import { sendLocationViaSMS } from "../../utils/emergencyService";

await sendLocationViaSMS(
  "+919876543210", // Phone number
  28.7041, // Latitude
  77.1025, // Longitude
  "John Doe", // User name
  "emergency123" // Emergency ID
);
```

## Animation Effects

The presentation page includes several animations:

1. **Pulse Animation**: SOS button pulses to indicate active state
2. **Scale Animation**: Expanding ripple effect for emergency status
3. **Tracking Animation**: Ambulance location updates with smooth transitions
4. **Heartbeat Animation**: Responders list pulses as new responders are alerted

## Socket.io Integration

Real-time events are emitted via Socket.io:

```javascript
// Emergency alert
socket.emit("emergency-alert", {
  victimId,
  victimName,
  latitude,
  longitude,
  emergencyContactPhone,
  timestamp,
  liveTracking,
});

// Volunteer alert
socket.emit("volunteer-alert", {
  victimId,
  victimName,
  latitude,
  longitude,
  severity,
});

// Cancel emergency
socket.emit("emergency-cancel", { victimId });
```

## Customization Options

### Change Responder Search Radius

Edit `emergencyService.ts`:

```typescript
const enrichedAmbulances = enrichResponders(ambResponse).slice(0, 5); // Get top 5 instead of 3
```

### Modify SMS Message Format

Edit `sendLocationViaSMS()` function to customize the message template.

### Adjust Ambulance Tracking Speed

Edit `simulateLiveTracking()` to change duration (currently 30 seconds).

### Change ETA Calculation

Edit `locationUtils.ts` `estimateETA()` function to adjust average speed assumption.

## Testing Checklist

- [ ] Location permission is granted
- [ ] User has emergency contacts configured
- [ ] Backend API endpoints are responding
- [ ] Socket.io connection is established
- [ ] SMS functionality works (test device must support SMS)
- [ ] Nearby responders are populated correctly
- [ ] Animations run smoothly
- [ ] Notifications display properly
- [ ] Map view loads correctly

## Troubleshooting

### SMS Not Sending

- Ensure device supports SMS
- Check SMS permissions in app settings
- Verify `expo-sms` is installed
- Test on physical device (not emulator)

### Location Not Found

- Grant location permissions
- Ensure GPS is enabled
- Check location accuracy settings

### No Nearby Responders Found

- Verify backend has responder data
- Check database for users with latitude/longitude
- Ensure responders are marked as available

### Socket.io Connection Issues

- Verify backend server is running
- Check `SOCKET_URL` in code (http://localhost:5000)
- Ensure CORS is configured on backend

## Future Enhancements

1. **Video Call Integration**: Direct video call with nearest responder
2. **Medical History Sharing**: Automatically share patient medical records
3. **Multi-Contact Alerting**: Send SMS to multiple emergency contacts
4. **Panic Button Lock**: Require double-tap or code to activate
5. **Emergency Kit**: Pre-defined message templates
6. **Historical Tracking**: Save and review past emergency routes
7. **Police/Fire Alert**: Integration with public emergency services

## Support

For issues or questions, refer to:

- Expo documentation: https://docs.expo.dev/
- Socket.io client: https://socket.io/docs/v4/client-api/
- React Native Maps: https://github.com/react-native-maps/react-native-maps
