# Smart Healthcare Emergency Response App

A comprehensive mobile application built with React Native, Node.js/Express, and MongoDB for managing emergency medical situations with real-time location tracking and professional network integration.

## Features

### 1. **Registration System**

- Multi-role registration: User/Patient, Doctor, Nurse, Ambulance Service, Volunteer
- Profile-specific information collection
- Emergency contact management

### 2. **Emergency Response System**

- **Red Emergency Button** on home screen for immediate help
- Real-time location sharing to emergency contacts
- Automatic nearby ambulance detection and dispatch
- Alerts to nearby medical professionals (doctors/nurses)
- Volunteer network notification system
- Live tracking of emergency response

### 3. **Appointment Booking**

- Browse available doctors and nurses
- Schedule appointments with date and time selection
- View upcoming appointments
- Manage appointment status

### 4. **Ambulance Booking**

- Book ambulances for non-emergency transport
- View nearby ambulance services
- Check ambulance details and operators

### 5. **Real-time Features**

- Live location tracking
- Socket.IO for real-time emergency alerts
- Distance-based service discovery
- Real-time professional availability status

### 6. **Map Integration**

- View nearby doctors, nurses, and ambulances on map
- Distance calculations
- Location-based services

## Technology Stack

### Frontend

- **React Native** with Expo
- **Expo Router** for navigation
- **Expo Location** for GPS tracking
- **Socket.io-client** for real-time updates
- **Axios** for API calls
- **React Native Maps** for location visualization

### Backend

- **Node.js** runtime
- **Express.js** web framework
- **Socket.io** for real-time communication
- **Mongoose** for MongoDB ODM
- **JWT** for authentication
- **Bcryptjs** for password hashing

### Database

- **MongoDB** for data persistence
- Geospatial indexing for location-based queries
- TTL indexes for automatic location data cleanup

## Project Structure

```
DNA/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   ├── Emergency.js
│   │   └── Location.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── appointments.js
│   │   ├── emergency.js
│   │   └── location.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── app/
    │   ├── (tabs)/
    │   │   └── index.tsx (Home Screen)
    │   ├── auth/
    │   │   ├── login.tsx
    │   │   ├── register-type.tsx
    │   │   └── register-details.tsx
    │   ├── appointments/
    │   │   ├── index.tsx
    │   │   └── book.tsx
    │   ├── ambulance/
    │   │   └── book.tsx
    │   ├── emergency/
    │   │   └── tracking.tsx
    │   ├── profile.tsx
    │   └── _layout.tsx
    ├── context/
    │   └── AuthContext.tsx
    ├── utils/
    │   ├── api.ts
    │   └── storage.ts
    └── package.json
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Expo CLI: `npm install -g expo-cli`
- iOS/Android development environment

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/smart-healthcare
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development
```

4. Start MongoDB:

```bash
# On Windows
mongod

# On macOS
brew services start mongodb-community
```

5. Start the server:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start Expo:

```bash
npm start
```

4. Run on iOS or Android:

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users

- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update profile
- `POST /api/users/update-location/:userId` - Update location
- `GET /api/users/nearby/professionals/:userType` - Get nearby doctors/nurses
- `GET /api/users/nearby/ambulances` - Get nearby ambulances
- `GET /api/users/nearby/volunteers` - Get nearby volunteers

### Appointments

- `POST /api/appointments/book` - Book appointment
- `GET /api/appointments/user/:userId` - Get user appointments
- `GET /api/appointments/upcoming/:userId` - Get upcoming appointments
- `PUT /api/appointments/:appointmentId` - Update appointment status

### Emergency

- `POST /api/emergency/trigger` - Trigger emergency alert
- `GET /api/emergency/nearby` - Get nearby active emergencies
- `GET /api/emergency/:emergencyId` - Get emergency details
- `PUT /api/emergency/:emergencyId` - Update emergency status

### Location

- `POST /api/location/update` - Update location
- `GET /api/location/history/:userId` - Get location history
- `GET /api/location/current/:userId` - Get current location

## Real-time Events (Socket.io)

### Client Events

- `update-location` - Send location updates
- `emergency-alert` - Broadcast emergency
- `ambulance-request` - Request ambulance

### Server Events

- `location-update` - Receive location updates
- `emergency-broadcast` - Receive emergency alerts
- `ambulance-alert` - Receive ambulance alerts

## User Roles

### 1. **User/Patient**

- Trigger emergencies
- Book appointments
- Book ambulances
- View nearby services
- Manage emergency contacts

### 2. **Doctor**

- Register with license details
- View incoming appointment requests
- Accept/decline appointments
- Track emergency alerts in vicinity

### 3. **Nurse**

- Register with credentials
- Book appointments
- Respond to emergencies
- View patient location in emergencies

### 4. **Ambulance Service**

- Register ambulance details
- Receive emergency dispatch requests
- Update availability status
- Track bookings

### 5. **Volunteer**

- Register as community helper
- Receive emergency alerts
- View victim location
- Provide community support

## Key Features Implementation

### Emergency Response Flow

1. User taps emergency button
2. System captures current location
3. Finds nearest ambulance (geospatial query)
4. Finds nearest available doctor/nurse
5. Alerts nearby volunteers within 5km radius
6. Sends real-time updates via Socket.io
7. User can track response in real-time

### Location Tracking

- Continuous background location updates
- Geospatial distance calculations
- Auto-cleanup of old location data
- Privacy-respecting location sharing

### Appointment System

- Browse available professionals
- Time slot selection
- Automatic confirmation
- Rescheduling capability
- Appointment history

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected routes with auth middleware
- Secure storage of auth tokens
- Location privacy controls

## Error Handling

- Comprehensive error messages
- Network error recovery
- Location permission handling
- Validation of all inputs
- Error logging

## Performance Optimizations

- Debounced location updates
- Cached professional listings
- Efficient geospatial queries
- TTL indexes for data cleanup
- Optimized socket connections

## Testing

### Manual Testing Checklist

- [ ] User registration with all roles
- [ ] Login/logout functionality
- [ ] Emergency alert triggering
- [ ] Real-time location tracking
- [ ] Appointment booking
- [ ] Ambulance booking
- [ ] Profile management
- [ ] Emergency tracking

### API Testing

Use Postman or similar tools to test endpoints:

1. Create test accounts for each role
2. Verify location tracking
3. Test emergency alert dispatch
4. Confirm real-time updates

## Troubleshooting

### Location Permission Issues

- Ensure location permissions granted in app settings
- Check device location services enabled
- Verify expo-location configuration

### Connection Issues

- Verify MongoDB is running
- Check backend server is active
- Ensure API URL is correct
- Check network connectivity

### Real-time Updates Not Working

- Verify Socket.io connection
- Check server Socket.io events
- Review browser/app console for errors
- Confirm event names match

## Future Enhancements

- [ ] Video consultation integration
- [ ] Medical records management
- [ ] Prescription management
- [ ] Payment integration
- [ ] Insurance verification
- [ ] Multi-language support
- [ ] Offline functionality
- [ ] Advanced analytics
- [ ] Notification system
- [ ] Rating and reviews

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions:

- Email: support@smarthealthcare.com
- Create GitHub issues
- Contact development team

## Disclaimer

This application is designed for emergency response purposes. Always ensure proper permissions and licenses for medical professionals. Follow local regulations for emergency dispatch services.

---

**Made with ❤️ for emergency healthcare response**
