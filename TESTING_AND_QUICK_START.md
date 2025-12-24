# Quick Start Guide - Testing All Features

## Prerequisites

- Node.js v18+ and npm
- MongoDB running locally or connection string configured
- Android/iOS emulator or physical device for testing

---

## 🚀 Starting the Application

### 1. Start the Backend Server

```bash
# Navigate to backend folder
cd backend

# Install dependencies (if not already installed)
npm install

# Start the server
npm start
```

**Expected Output:**

```
MongoDB connected
Server running on port 5000
```

### 2. Start the Frontend Application

```bash
# In a new terminal, navigate to frontend folder
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the frontend
npm start
```

**Expected Output:**

```
Expo server started on ...
Web URL: ...
```

---

## ✅ Testing Features

### Test 1: Appointment Booking

**Steps:**

1. Login to the app
2. Tap "Quick Actions" → "Book Appointment"
3. Allow location permissions when prompted
4. See nearby doctors/nurses loaded
5. Select a professional
6. Pick a date using the date picker
7. Select a time slot
8. Enter reason for appointment
9. Click "Book Appointment"
10. Should see success message and return to home

**Expected Result:** Appointment booked successfully with backend

---

### Test 2: Ambulance Booking

**Steps:**

1. From home screen, tap "Quick Actions" → "Book Ambulance"
2. Allow location permissions
3. See nearby ambulances list populated
4. Select an ambulance
5. Click "Book Ambulance"
6. Should see success message

**Expected Result:** Ambulance booked via new booking API

---

### Test 3: Google Maps Integration

**Steps:**

1. Go to "Doctors" tab (doctors/map.tsx)
2. Map should display with current user location (green marker)
3. Doctors, nurses, ambulances should show as colored markers:
   - Blue: Doctors
   - Red: Nurses
   - Orange: Ambulances
4. Tap on markers to see details
5. Legend at bottom shows color coding
6. Try filtering by doctor/nurse/ambulance
7. Tap "My Location" button to recenter map

**Expected Result:**

- Map displays correctly
- Markers show proper locations
- API key working (no "Maps API error" messages)
- Filtering and controls work

---

### Test 4: Emergency SOS

**Steps:**

1. From home screen, tap the large red "SOS" button
2. Should see pulsing animation
3. App requests location permission
4. Should navigate to emergency tracking screen
5. Verify emergency details display
6. Check nearby responders tab

**Expected Result:**

- Emergency triggered
- Real-time socket updates work
- Location tracking active

---

### Test 5: Nearby Services

**Steps:**

1. Tap "Find Nearby" from Quick Actions
2. Allow location permissions
3. See tabs: Doctors | Nurses | Ambulances
4. Professionals list with distance/rating shows
5. Use search filter
6. Adjust radius slider (5-50 km)
7. Tap "Book" to book appointment/ambulance

**Expected Result:**

- Services load from API
- Filter and search work
- Responsive layout on different screen sizes

---

### Test 6: Responsive Design

**Steps:**

1. Test on different screen sizes:
   - Small phone (SE): 375x667
   - Regular phone: 390x844
   - Large phone: 412x915
   - Tablet: 768x1024
2. Check that all elements are touchable (48x48 min)
3. Verify text is readable
4. Check scrolling works when needed
5. Verify no text overflow

**Expected Result:**

- All UI elements properly sized
- Text readable on all sizes
- No layout broken on any screen size

---

## 🔍 API Endpoints to Test

### Using Postman or curl:

```bash
# 1. Get nearby doctors
curl -X GET "http://localhost:5000/api/users/nearby/professionals/doctor?latitude=40.7128&longitude=-74.0060&radius=10"

# 2. Get nearby ambulances
curl -X GET "http://localhost:5000/api/users/nearby/ambulances?latitude=40.7128&longitude=-74.0060&radius=10"

# 3. Book appointment (requires auth token)
curl -X POST "http://localhost:5000/api/appointments/book" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "professionalId": "DOCTOR_ID",
    "appointmentDate": "2025-12-25T10:00:00Z",
    "timeSlot": "10:00 AM",
    "reason": "Regular checkup"
  }'

# 4. Book service/ambulance (requires auth token)
curl -X POST "http://localhost:5000/api/booking/book" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ambulanceId": "AMBULANCE_ID",
    "serviceType": "non-emergency-transport",
    "description": "Transport needed",
    "amount": 500
  }'

# 5. Get user bookings (requires auth token)
curl -X GET "http://localhost:5000/api/booking/user/USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Debugging Tips

### Check Backend Logs

```bash
# Terminal where backend is running
# Look for any error messages
# Check MongoDB connection status
```

### Check Frontend Logs

```bash
# In Expo app or browser console
# Enable console logging in developer tools
# Check for API errors in network tab
```

### Common Issues:

**"Cannot reach backend"**

- Ensure backend is running on port 5000
- Check if MongoDB is connected
- Verify network connectivity

**"Location permission denied"**

- Grant location permissions in app settings
- Try restarting the app
- Check device location services

**"Map not loading"**

- Verify Google Maps API key is valid
- Check internet connection
- Verify PROVIDER_GOOGLE is set in MapView

**"Booking fails silently"**

- Check browser console for errors
- Verify auth token is present
- Check backend logs for validation errors

---

## 📊 Data Structure

### User Model

```javascript
{
  name: String,
  email: String,
  phone: String,
  userType: ['user', 'doctor', 'nurse', 'ambulance', 'volunteer'],
  latitude: Number,
  longitude: Number,
  isAvailable: Boolean
}
```

### Appointment Model

```javascript
{
  userId: ObjectId,
  professionalId: ObjectId,
  appointmentDate: Date,
  timeSlot: String,
  reason: String,
  status: ['scheduled', 'confirmed', 'completed', 'cancelled']
}
```

### Booking Model (New)

```javascript
{
  userId: ObjectId,
  ambulanceId: ObjectId,
  serviceType: ['emergency', 'non-emergency-transport', 'routine-checkup', 'vaccination'],
  status: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
  pickupLocation: { latitude, longitude, address },
  dropoffLocation: { latitude, longitude, address },
  amount: Number
}
```

---

## ✨ Feature Checklist

- [x] Appointment booking with location-based search
- [x] Ambulance booking system
- [x] Google Maps integration with markers
- [x] Emergency SOS functionality
- [x] Real-time socket.io updates
- [x] Responsive UI on all screen sizes
- [x] Error handling and user feedback
- [x] Location permission handling
- [x] API authentication with JWT
- [x] Professional service discovery

---

## 📱 Environment Configuration

### Frontend (.env if needed)

```
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (.env)

```
MONGODB_URI=mongodb://localhost:27017/smart-healthcare
JWT_SECRET=your_jwt_secret_key_change_this
PORT=5000
NODE_ENV=development
```

---

## 🎯 Success Criteria

✅ All buttons are functional
✅ Google Maps displays with correct markers
✅ API calls complete without errors
✅ Responsive design works on all screen sizes
✅ Location services work properly
✅ Error messages are user-friendly
✅ Loading states display correctly
✅ Real-time updates via socket.io work
✅ Authentication flows properly
✅ Data persists in MongoDB

---

## 📞 Support

If you encounter any issues:

1. Check the error logs in backend and frontend
2. Verify all services are running
3. Clear app cache and reinstall if needed
4. Check network connectivity
5. Verify MongoDB is accessible
6. Review the FIXES_AND_INTEGRATION_COMPLETE.md for technical details

---

## 🚀 Deployment Readiness

Once testing is complete, before deployment:

1. Move API key to environment variables
2. Update MongoDB connection to production
3. Update JWT secret to secure random value
4. Configure CORS for production domain
5. Enable HTTPS
6. Set up CI/CD pipeline
7. Configure error tracking (Sentry)
8. Set up monitoring and logging
9. Create backup and recovery procedures
10. Perform security audit

---

Enjoy testing the application! All features are now functional and integrated. 🎉
