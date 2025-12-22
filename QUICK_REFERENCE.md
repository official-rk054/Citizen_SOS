# Smart Healthcare App - Quick Reference

## Project Overview

A complete emergency medical response application with real-time location tracking, emergency dispatch, and professional network integration.

## Quick Commands

### Backend

```bash
cd backend
npm install              # Install dependencies
npm run dev             # Start development server
npm start               # Start production server
```

### Frontend

```bash
cd frontend
npm install              # Install dependencies
npm start               # Start Expo dev server
npm run ios             # Run on iOS simulator
npm run android         # Run on Android emulator
npm run web             # Run on web browser
```

## Directory Structure

```
DNA/
├── backend/                 # Node.js/Express server
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth middleware
│   ├── server.js           # Main server file
│   └── package.json
│
├── frontend/               # React Native app
│   ├── app/               # App screens
│   ├── context/           # Auth context
│   ├── utils/             # API & storage utilities
│   └── package.json
│
├── README.md              # Main documentation
├── SETUP_GUIDE.md         # Setup instructions
├── API_DOCUMENTATION.md   # API reference
└── .gitignore
```

## Key Features

| Feature            | Status | File                            |
| ------------------ | ------ | ------------------------------- |
| User Registration  | ✅     | `app/auth/register-details.tsx` |
| Login              | ✅     | `app/auth/login.tsx`            |
| Emergency Alert    | ✅     | `app/(tabs)/index.tsx`          |
| Emergency Tracking | ✅     | `app/emergency/tracking.tsx`    |
| Book Appointment   | ✅     | `app/appointments/book.tsx`     |
| View Appointments  | ✅     | `app/appointments/index.tsx`    |
| Book Ambulance     | ✅     | `app/ambulance/book.tsx`        |
| Doctor Map View    | ✅     | `app/doctors/map.tsx`           |
| Profile Management | ✅     | `app/profile.tsx`               |
| Real-time Location | ✅     | `routes/location.js`            |
| Socket.io Updates  | ✅     | `server.js`                     |

## User Roles

### 1. **User/Patient**

- Emergency trigger
- Book doctors/nurses
- Book ambulances
- View upcoming appointments
- Manage emergency contacts

### 2. **Doctor**

- Register with license
- Receive appointment requests
- View patient location in emergencies
- Update availability status

### 3. **Nurse**

- Register with credentials
- Respond to emergencies
- Book appointments with patients

### 4. **Ambulance**

- Register service details
- Receive emergency dispatch
- Track location
- Update availability

### 5. **Volunteer**

- Register to help
- Receive emergency alerts
- View victim location
- Provide community support

## API Endpoints

### Auth (`/api/auth`)

- `POST /register` - Register user
- `POST /login` - Login user
- `GET /me` - Get current user

### Users (`/api/users`)

- `GET /:userId` - Get user profile
- `PUT /:userId` - Update profile
- `POST /update-location/:userId` - Update location
- `GET /nearby/professionals/:type` - Get nearby doctors/nurses
- `GET /nearby/ambulances` - Get nearby ambulances
- `GET /nearby/volunteers` - Get nearby volunteers

### Appointments (`/api/appointments`)

- `POST /book` - Book appointment
- `GET /user/:userId` - Get user appointments
- `GET /upcoming/:userId` - Get upcoming appointments
- `PUT /:appointmentId` - Update appointment

### Emergency (`/api/emergency`)

- `POST /trigger` - Trigger emergency
- `GET /nearby` - Get nearby emergencies
- `GET /:emergencyId` - Get emergency details
- `PUT /:emergencyId` - Update emergency status

### Location (`/api/location`)

- `POST /update` - Update location
- `GET /history/:userId` - Get location history
- `GET /current/:userId` - Get current location

## Database Models

### User

- Basic info (name, email, phone, password)
- User type (user, doctor, nurse, ambulance, volunteer)
- Location (latitude, longitude)
- Professional details (license, specialization, experience)
- Emergency contacts

### Appointment

- User ID
- Professional ID
- Date & time
- Reason
- Status (scheduled, completed, cancelled)

### Emergency

- Victim ID
- Location (latitude, longitude)
- Assigned ambulance
- Assigned nurse
- Alerted volunteers
- Status (active, responding, completed)
- Severity level

### Location

- User ID
- Latitude & longitude
- Address
- Timestamp
- Associated emergency ID

## Environment Variables

### Backend (.env)

```
MONGODB_URI=mongodb://localhost:27017/smart-healthcare
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
```

## Socket.io Events

### Emitted by Client

- `update-location` - Send location
- `emergency-alert` - Broadcast emergency
- `ambulance-request` - Request ambulance

### Received from Server

- `location-update` - Location update
- `emergency-broadcast` - Emergency alert
- `ambulance-alert` - Ambulance dispatch

## Common Tasks

### Add New Screen

```bash
# Create screen file in appropriate directory
touch app/[feature]/[screen].tsx

# Add route in app/_layout.tsx
<Stack.Screen name="[screen]" options={{ headerShown: false }} />
```

### Add New API Endpoint

```bash
# Create route file
touch backend/routes/[feature].js

# Add to server.js
app.use('/api/[feature]', require('./routes/[feature]'));
```

### Create New Model

```bash
# Create model file
touch backend/models/[Model].js

# Use in routes
const Model = require('../models/[Model]');
```

## Testing Checklist

- [ ] Create user account
- [ ] Login successfully
- [ ] Grant location permissions
- [ ] Trigger emergency alert
- [ ] View nearby doctors
- [ ] Book appointment
- [ ] View upcoming appointments
- [ ] Book ambulance
- [ ] Update profile
- [ ] Logout

## Performance Tips

1. **Location Updates**: Debounce to 10-second intervals
2. **API Calls**: Use Promise.all for parallel requests
3. **Database**: Add indexes on frequently queried fields
4. **Images**: Compress and optimize
5. **Bundle**: Tree-shake unused code

## Security Best Practices

✅ Implemented:

- JWT authentication
- Password hashing (bcryptjs)
- Protected routes with auth middleware
- Secure token storage (expo-secure-store)

🔒 For Production:

- Use HTTPS
- Implement rate limiting
- Add request validation
- Enable CORS properly
- Use environment variables
- Implement API versioning

## Debugging

### Check Backend Logs

```bash
# See all server logs
npm run dev

# Check specific errors
# Look for "Error:" messages
```

### Check Frontend Logs

```bash
# Expo shows logs in terminal
# Or use console.log() in code

# React Native Debugger
npx react-native start --experimental-debugger
```

### Check Database

```bash
# Open MongoDB shell
mongo smart-healthcare

# View users
db.users.find()

# Count documents
db.users.count()

# Find specific user
db.users.findOne({ email: "user@example.com" })
```

## File Size Reference

| Item                  | Size   |
| --------------------- | ------ |
| backend/node_modules  | ~200MB |
| frontend/node_modules | ~600MB |
| MongoDB default       | ~50MB  |
| Source code           | ~5MB   |

## Deployment Checklist

- [ ] Update API URL to production
- [ ] Set JWT_SECRET to strong value
- [ ] Use MongoDB Atlas or similar
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Add rate limiting
- [ ] Setup monitoring/logging
- [ ] Test all endpoints
- [ ] Setup CI/CD pipeline

## Useful Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [MongoDB Query Language](https://docs.mongodb.com/manual/reference/method/js-collection/)
- [Socket.io Documentation](https://socket.io/docs/v4/socket-io-protocol/)
- [JWT.io](https://jwt.io/)

## Getting Help

1. **Check console logs** - Most errors are logged
2. **Read documentation** - Listed in resources above
3. **Search error message** - Stack Overflow has most answers
4. **Check GitHub issues** - Look at package repos
5. **Ask in community** - React Native, Expo, MongoDB communities

## Common Issues & Solutions

| Issue                      | Solution                     |
| -------------------------- | ---------------------------- |
| MongoDB connection error   | Ensure MongoDB is running    |
| Port already in use        | Kill process or change PORT  |
| Module not found           | Run npm install again        |
| Location permission denied | Grant in app settings        |
| API not responding         | Check backend is running     |
| Expo won't load            | Clear cache: `expo start -c` |

---

**Last Updated:** December 2024
**Version:** 1.0.0
**Status:** Production Ready
