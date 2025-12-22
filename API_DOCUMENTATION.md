# Smart Healthcare API Documentation

Complete API reference for the Smart Healthcare Emergency Response App.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User

Register a new user account.

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "userType": "user|doctor|nurse|ambulance|volunteer",
  "emergencyContacts": [
    {
      "name": "Jane Doe",
      "phone": "9876543211",
      "relationship": "Sister"
    }
  ],
  // For doctors/nurses:
  "licenseNumber": "LIC123456",
  "specialization": "Cardiology",
  "yearsOfExperience": 5,
  // For ambulance:
  "ambulanceType": "Advanced",
  "vehicleNumber": "MH-01-AB-1234",
  "operatorName": "Ram Kumar",
  "operatorPhone": "9876543212"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "userType": "user"
  }
}
```

### Login

Authenticate and get JWT token.

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "userType": "user"
  }
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "userType": "user",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "isAvailable": true,
  "emergencyContacts": [...]
}
```

---

## User Management Endpoints

### Get User Profile

```http
GET /users/:userId
```

**Response:**

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Dr. Rajesh",
  "email": "rajesh@hospital.com",
  "phone": "9876543210",
  "userType": "doctor",
  "specialization": "Cardiology",
  "yearsOfExperience": 10,
  "latitude": 28.6139,
  "longitude": 77.209,
  "isAvailable": true
}
```

### Update User Profile

```http
PUT /users/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "phone": "9876543210",
  "isAvailable": true
}
```

**Response:**

```json
{
  "message": "Profile updated",
  "user": {
    /* updated user object */
  }
}
```

### Update Location

```http
POST /users/update-location/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

### Get Nearby Professionals

```http
GET /users/nearby/professionals/:userType?latitude=28.6139&longitude=77.2090&radius=10
```

**Parameters:**

- `userType`: doctor | nurse
- `latitude`: User's latitude
- `longitude`: User's longitude
- `radius`: Search radius in km (default: 5)

**Response:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Dr. Rajesh",
    "specialization": "Cardiology",
    "yearsOfExperience": 10,
    "latitude": 28.6139,
    "longitude": 77.209,
    "isAvailable": true
  }
]
```

### Get Nearby Ambulances

```http
GET /users/nearby/ambulances?latitude=28.6139&longitude=77.2090&radius=10
```

**Response:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "City Ambulance Service",
    "ambulanceType": "Advanced",
    "vehicleNumber": "MH-01-AB-1234",
    "operatorName": "Ram Kumar",
    "operatorPhone": "9876543212",
    "latitude": 28.6139,
    "longitude": 77.209,
    "isAvailable": true
  }
]
```

### Get Nearby Volunteers

```http
GET /users/nearby/volunteers?latitude=28.6139&longitude=77.2090&radius=5
```

---

## Appointment Endpoints

### Book Appointment

```http
POST /appointments/book
Authorization: Bearer <token>
Content-Type: application/json

{
  "professionalId": "507f1f77bcf86cd799439011",
  "appointmentDate": "2024-12-25T10:00:00Z",
  "timeSlot": "10:00 AM",
  "reason": "Regular checkup"
}
```

**Response:**

```json
{
  "message": "Appointment booked successfully",
  "appointment": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "professionalId": "507f1f77bcf86cd799439013",
    "appointmentDate": "2024-12-25T10:00:00.000Z",
    "timeSlot": "10:00 AM",
    "reason": "Regular checkup",
    "status": "scheduled",
    "createdAt": "2024-12-22T10:00:00.000Z"
  }
}
```

### Get User Appointments

```http
GET /appointments/user/:userId
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "userId": {
      /* user object */
    },
    "professionalId": {
      /* professional object */
    },
    "appointmentDate": "2024-12-25T10:00:00.000Z",
    "timeSlot": "10:00 AM",
    "status": "scheduled"
  }
]
```

### Get Upcoming Appointments

```http
GET /appointments/upcoming/:userId
Authorization: Bearer <token>
```

**Response:** Same as above, filtered for upcoming appointments only

### Update Appointment Status

```http
PUT /appointments/:appointmentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed|cancelled|no-show"
}
```

---

## Emergency Endpoints

### Trigger Emergency

Create and broadcast an emergency alert.

```http
POST /emergency/trigger
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "description": "Heart attack symptoms",
  "emergencyContactId": "507f1f77bcf86cd799439011",
  "severity": "critical"
}
```

**Response:**

```json
{
  "message": "Emergency alert triggered",
  "emergency": {
    "_id": "507f1f77bcf86cd799439014",
    "victimId": "507f1f77bcf86cd799439011",
    "victimName": "John Doe",
    "latitude": 28.6139,
    "longitude": 77.209,
    "assignedAmbulanceId": "507f1f77bcf86cd799439015",
    "assignedNurseId": "507f1f77bcf86cd799439016",
    "alertedVolunteerIds": ["507f1f77bcf86cd799439017"],
    "status": "active",
    "severity": "critical",
    "createdAt": "2024-12-22T10:00:00.000Z"
  }
}
```

### Get Nearby Emergencies

```http
GET /emergency/nearby?latitude=28.6139&longitude=77.2090&radius=5
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "victimId": {
      /* victim object */
    },
    "latitude": 28.6139,
    "longitude": 77.209,
    "status": "active",
    "severity": "critical",
    "assignedAmbulanceId": {
      /* ambulance object */
    }
  }
]
```

### Get Emergency Details

```http
GET /emergency/:emergencyId
```

**Response:**

```json
{
  "_id": "507f1f77bcf86cd799439014",
  "victimId": {
    /* victim details */
  },
  "assignedAmbulanceId": {
    /* ambulance details */
  },
  "assignedNurseId": {
    /* nurse details */
  },
  "alertedVolunteerIds": [
    /* array of volunteer details */
  ],
  "status": "active",
  "latitude": 28.6139,
  "longitude": 77.209,
  "description": "Heart attack symptoms",
  "severity": "critical"
}
```

### Update Emergency Status

```http
PUT /emergency/:emergencyId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "responding|completed|cancelled"
}
```

---

## Location Endpoints

### Update Location

Track user's real-time location.

```http
POST /location/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "address": "Delhi, India",
  "accuracy": 10,
  "emergencyId": "507f1f77bcf86cd799439014"
}
```

**Response:**

```json
{
  "message": "Location updated",
  "location": {
    "_id": "507f1f77bcf86cd799439018",
    "userId": "507f1f77bcf86cd799439011",
    "latitude": 28.6139,
    "longitude": 77.209,
    "address": "Delhi, India",
    "accuracy": 10,
    "timestamp": "2024-12-22T10:00:00.000Z",
    "emergencyId": "507f1f77bcf86cd799439014"
  }
}
```

### Get Location History

```http
GET /location/history/:userId
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "_id": "507f1f77bcf86cd799439018",
    "userId": "507f1f77bcf86cd799439011",
    "latitude": 28.6139,
    "longitude": 77.209,
    "address": "Delhi, India",
    "timestamp": "2024-12-22T10:00:00.000Z"
  }
]
```

### Get Current Location

```http
GET /location/current/:userId
```

**Response:**

```json
{
  "_id": "507f1f77bcf86cd799439018",
  "userId": "507f1f77bcf86cd799439011",
  "latitude": 28.6139,
  "longitude": 77.209,
  "address": "Delhi, India",
  "timestamp": "2024-12-22T10:00:00.000Z"
}
```

---

## Real-time Events (Socket.io)

### Client Events

#### Update Location

```javascript
socket.emit("update-location", {
  userId: "507f1f77bcf86cd799439011",
  latitude: 28.6139,
  longitude: 77.209,
});
```

#### Emergency Alert

```javascript
socket.emit("emergency-alert", {
  victimId: "507f1f77bcf86cd799439011",
  victimName: "John Doe",
  latitude: 28.6139,
  longitude: 77.209,
  emergencyContactPhone: "9876543210",
});
```

#### Ambulance Request

```javascript
socket.emit("ambulance-request", {
  requestId: "507f1f77bcf86cd799439019",
  latitude: 28.6139,
  longitude: 77.209,
  priority: "high",
});
```

### Server Events

#### Location Update

```javascript
socket.on("location-update", (data) => {
  console.log(data);
  // {
  //   userId: '507f1f77bcf86cd799439011',
  //   latitude: 28.6139,
  //   longitude: 77.2090,
  //   timestamp: '2024-12-22T10:00:00Z'
  // }
});
```

#### Emergency Broadcast

```javascript
socket.on("emergency-broadcast", (data) => {
  console.log(data);
  // {
  //   victimId: '507f1f77bcf86cd799439011',
  //   victimName: 'John Doe',
  //   latitude: 28.6139,
  //   longitude: 77.2090,
  //   emergencyContactPhone: '9876543210',
  //   timestamp: '2024-12-22T10:00:00Z'
  // }
});
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Error Codes

| Status | Error        | Meaning                                  |
| ------ | ------------ | ---------------------------------------- |
| 400    | Bad Request  | Invalid input or missing required fields |
| 401    | Unauthorized | No token provided or invalid token       |
| 403    | Forbidden    | User doesn't have permission             |
| 404    | Not Found    | Resource not found                       |
| 500    | Server Error | Internal server error                    |

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider implementing:

- Max 100 requests per minute per IP
- Max 10 emergency triggers per hour per user

---

## Examples

### Example: Complete Emergency Flow

1. **User triggers emergency:**

```bash
curl -X POST http://localhost:5000/api/emergency/trigger \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 28.6139,
    "longitude": 77.2090,
    "severity": "critical"
  }'
```

2. **Receive emergency ID and track response:**

```bash
curl http://localhost:5000/api/emergency/<emergencyId>
```

3. **Update emergency status when resolved:**

```bash
curl -X PUT http://localhost:5000/api/emergency/<emergencyId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

---

## Testing with Postman

1. Register a user (saves token automatically)
2. Set `Authorization` header to `Bearer {{token}}`
3. Test endpoints in order

---

## Pagination

Currently, most endpoints return all results. For production, consider implementing:

- `?page=1&limit=20` for paginated results
- `?skip=0&take=20` for offset-based pagination

---

## Geolocation Features

### Distance Calculation

All nearby-search endpoints use the **Haversine formula** for accurate distance calculation:

```
Distance = R × arccos(sin(lat1) × sin(lat2) + cos(lat1) × cos(lat2) × cos(lon2-lon1))
where R = Earth's radius (6371 km)
```

### Location Parameters

Most location endpoints accept these query parameters:

```
GET /api/users/nearby/professionals/:userType?latitude=37.7749&longitude=-122.4194&radius=5

Query Parameters:
- latitude (required): User's latitude (-90 to 90)
- longitude (required): User's longitude (-180 to 180)
- radius (optional): Search radius in kilometers, default: 5
```

### Distance-Based Sorting

Results are automatically sorted by distance (nearest first):

```json
{
  "results": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Dr. Smith",
      "latitude": 37.775,
      "longitude": -122.4195,
      "distance": 0.15 // km from user location
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Dr. Johnson",
      "latitude": 37.78,
      "longitude": -122.41,
      "distance": 0.8 // km from user location
    }
  ]
}
```

### Real-Time Location Tracking

Location updates are tracked in real-time via Socket.io:

#### Update Location (HTTP)

```http
POST /api/users/update-location/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

#### Socket.io Events

**Client → Server:**

```javascript
socket.emit("update-location", {
  userId: "user123",
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 10,
  timestamp: Date.now(),
});
```

**Server → All Clients:**

```javascript
socket.on("location-update", (data) => {
  // data = { userId, latitude, longitude, timestamp }
});
```

### Emergency Location Tracking

For emergency situations, location is critical:

1. **Immediate capture**: Get high-accuracy location
2. **Continuous broadcast**: Update every 10 seconds
3. **Multi-recipient delivery**: Send to ambulance, nurse, volunteers

```
Accuracy: High (±10m)
Update Frequency: 10 seconds
Broadcast Range: 5+ km for volunteers
Distance Calculation: Real-time from all responders
```

### Nearby Search Endpoints

All these endpoints support geolocation with distance calculation:

**Find Doctors/Nurses:**

```
GET /api/users/nearby/professionals/doctor?latitude=37.7749&longitude=-122.4194&radius=10
```

**Find Ambulances:**

```
GET /api/users/nearby/ambulances?latitude=37.7749&longitude=-122.4194&radius=10
```

**Find Volunteers:**

```
GET /api/users/nearby/volunteers?latitude=37.7749&longitude=-122.4194&radius=10
```

**Find Emergencies:**

```
GET /api/emergency/nearby?latitude=37.7749&longitude=-122.4194&radius=10
```

### Geolocation Accuracy

Different endpoints use different accuracy levels:

| Endpoint            | Accuracy         | Use Case                          |
| ------------------- | ---------------- | --------------------------------- |
| Emergency Trigger   | ±5m (Highest)    | Critical - needs precise location |
| Ambulance Booking   | ±50m (High)      | Important - for dispatch          |
| Appointment Booking | ±100m (Balanced) | Optional - just for discovery     |
| Volunteer Alerts    | ±100m (Balanced) | Optional - awareness only         |

---

For more details, refer to the source code in the `backend/routes/` directory.
