# Smart Healthcare App - Setup Guide

## Quick Start

This guide will help you set up and run the Smart Healthcare Emergency Response App locally.

## System Requirements

- **Node.js**: v14 or higher
- **npm**: v6 or higher
- **MongoDB**: Latest version
- **Expo CLI**: Latest version
- **Git**: For version control

### Operating System

- Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)

## Step 1: Install Dependencies

### Global Dependencies

```bash
# Install Node.js and npm from https://nodejs.org/

# Install Expo CLI globally
npm install -g expo-cli

# Install MongoDB Community Edition
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: Follow official MongoDB installation guide
```

## Step 2: Clone/Setup Project

```bash
# Navigate to your workspace
cd "C:\Users\rishi\OneDrive\Desktop\DNA"

# The project structure should already exist
```

## Step 3: Setup Backend

### 3.1 Navigate to Backend

```bash
cd backend
```

### 3.2 Install Backend Dependencies

```bash
npm install
```

### 3.3 Create Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/smart-healthcare

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Configuration
PORT=5000
NODE_ENV=development

# Optional: For production deployment
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-healthcare
```

### 3.4 Start MongoDB

**Windows (PowerShell as Admin):**

```powershell
# If installed via MSI
net start MongoDB

# Or run mongod directly from installation directory
C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe
```

**macOS:**

```bash
# If installed via Homebrew
brew services start mongodb-community
```

**Linux (Ubuntu):**

```bash
sudo systemctl start mongod
```

### 3.5 Start Backend Server

```bash
npm run dev
```

You should see:

```
Server running on port 5000
MongoDB connected
```

**Keep this terminal open!**

## Step 4: Setup Frontend

### 4.1 Open New Terminal and Navigate to Frontend

```bash
cd frontend
```

### 4.2 Install Frontend Dependencies

```bash
npm install
```

### 4.3 Install Additional Packages

The required packages should already be in package.json. If there are issues:

```bash
npm install @react-native-async-storage/async-storage
npm install expo-secure-store
```

### 4.4 Start Expo Development Server

```bash
npm start
```

You should see:

```
Expo DevTools is running at ...
To open the app on your phone scan this QR code with Expo Go
```

## Step 5: Run the App

### Option A: Run on Physical Device

1. **Download Expo Go** app on your iOS or Android device
2. **Scan the QR code** shown in the Expo DevTools
3. **Wait for the app to load** (first load takes 30-60 seconds)

### Option B: Run on iOS Simulator (macOS only)

```bash
npm run ios
```

### Option C: Run on Android Emulator

```bash
npm run android
```

### Option D: Run on Web

```bash
npm run web
```

## Step 6: Test the App

### Create Test Accounts

#### User Account

- **Email**: user@test.com
- **Password**: password123
- **Phone**: 9876543210
- **Type**: User/Patient

#### Doctor Account

- **Email**: doctor@test.com
- **Password**: password123
- **Phone**: 9876543211
- **Type**: Doctor

#### Ambulance Account

- **Email**: ambulance@test.com
- **Password**: password123
- **Phone**: 9876543212
- **Type**: Ambulance

### Testing Workflow

1. **Login** with any account
2. **Grant location permissions** when prompted
3. **For Users**:
   - Tap the red Emergency button
   - View nearby doctors and ambulances
   - Book an appointment or ambulance
4. **For Doctors/Nurses**:
   - Update your availability
   - Receive appointment requests
5. **For Ambulances**:
   - Update your location
   - Respond to emergency requests

## Step 7: Verify Connection

### Check Backend Connection

Open Postman or use curl:

```bash
# Test backend is running
curl http://localhost:5000/api/auth/login

# Should return error (expected, since we're testing GET)
```

### Check MongoDB Connection

```bash
# Open MongoDB shell
mongo

# In the shell
use smart-healthcare
db.users.find()
```

## Troubleshooting

### Issue: MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**

- Ensure MongoDB is running: `mongod` or `brew services start mongodb-community`
- Check MongoDB is listening on port 27017
- Verify MONGODB_URI in .env file

### Issue: Port 5000 Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

Or change PORT in .env to 5001, 5002, etc.

### Issue: Expo App Won't Connect

**Solution:**

- Ensure phone is on same WiFi as computer
- Verify firewall allows connections
- Try with `--tunnel` flag: `expo start --tunnel`
- Clear Expo cache: `expo start -c`

### Issue: Location Permission Denied

**Solution:**

- Go to App Settings → Permissions → Location
- Enable "While Using the App" or "Always"
- Re-launch the app

### Issue: Module Not Found Errors

**Solution:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Assets or Images Not Loading

**Solution:**

```bash
# Clear Expo cache
expo start -c

# Or restart the dev server
```

## Database Setup

### Create Database and Collections

The app will automatically create collections when records are inserted. However, to be proactive:

```bash
# Connect to MongoDB
mongo

# Use the database
use smart-healthcare

# Create collections
db.createCollection("users")
db.createCollection("appointments")
db.createCollection("emergencies")
db.createCollection("locations")

# Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true })
db.locations.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 86400 })
```

## API Testing

Use Postman to test endpoints. Example:

### Register a New User

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "userType": "user",
  "emergencyContacts": [
    {
      "name": "Jane Doe",
      "phone": "9876543211",
      "relationship": "Sister"
    }
  ]
}
```

### Login

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

## Environment Variables Reference

### Backend (.env)

| Variable    | Default                                    | Description               |
| ----------- | ------------------------------------------ | ------------------------- |
| MONGODB_URI | mongodb://localhost:27017/smart-healthcare | MongoDB connection string |
| JWT_SECRET  | (required)                                 | Secret key for JWT tokens |
| PORT        | 5000                                       | Server port               |
| NODE_ENV    | development                                | Environment mode          |

## Starting Fresh

If you need to reset everything:

```bash
# Kill all Node processes
# Windows
taskkill /F /IM node.exe

# macOS/Linux
killall node

# Remove MongoDB data (warning: deletes all data)
# Windows: Delete C:\Program Files\MongoDB\Server\6.0\data\db\*
# macOS: rm -rf /usr/local/var/mongodb/
# Linux: sudo rm -rf /var/lib/mongodb/*

# Remove node_modules
rm -rf backend/node_modules
rm -rf frontend/node_modules

# Reinstall
cd backend && npm install
cd ../frontend && npm install
```

## Next Steps

1. ✅ Get the app running locally
2. 📝 Create test accounts
3. 🧪 Test all features
4. 🔧 Customize as needed
5. 📱 Deploy to production

## Deployment

For production deployment, refer to:

- **Backend**: Deploy to Heroku, AWS, or DigitalOcean
- **Frontend**: Build with EAS: `eas build --platform all`
- **Database**: Use MongoDB Atlas for managed database

## Support

For issues or questions:

- Check troubleshooting section above
- Review console logs for error details
- Verify all services are running
- Check network connectivity

## Additional Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Socket.io Docs](https://socket.io/docs/)

---

**Setup completed! You're ready to develop the Smart Healthcare App.** 🚀
