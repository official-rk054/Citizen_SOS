# 🚀 SmartHealth - Servers Status & How to Access

## ✅ BOTH SERVERS RUNNING SUCCESSFULLY

---

## 📊 Current Server Status

### **Backend Server** ✅

```
Status: RUNNING
Port: 5000
Protocol: HTTP
URL: http://localhost:5000
MongoDB: Connected
Socket.io: Active
Process: Node.js
```

**Running on**: Multiple processes (load balanced)

### **Frontend Server** ✅

```
Status: RUNNING
Port: 8081 (Metro Bundler)
Protocol: HTTP/WebSocket
URL: http://localhost:8081
Expo: Active
Metro Bundler: Compiling
QR Code: Available
```

**Running on**: Expo development server with hot reload

---

## 📱 How to Access the Application

### **Option 1: Expo Go (Recommended for Mobile)**

#### iOS Users:

1. Open **Camera** app
2. Point at **QR Code** displayed in terminal
3. Tap notification → Opens in Expo Go

#### Android Users:

1. Open **Expo Go** app
2. Tap **Scan QR Code**
3. Point at QR Code in terminal
4. App opens automatically

#### Getting the QR Code:

Look in the terminal where frontend is running. You'll see:

```
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █▄▄▄ ▀▄▀█▄█ ▄▄▄▄▄ █
█ █   █ ██▄▀ █  ▀▀█ █   █ █
█ █▄▄▄█ ██▀▄ ▄▀▀█▀█ █▄▄▄█ █
█▄▄▄▄▄▄▄█ ▀▄█ ▀▄█▄█▄▄▄▄▄▄▄█
█▄ ▀▄▄█▄▀▀▄▀█▄▀█▀▀█▄█▀█▀▀▄█
█▀▄  ▄█▄█▀▄██▄▄▄ ▀▀███▄▀▀ █
█▀ ▀ ▀ ▄▀█▄ █▀█▄ █ ▄▀▀█▀ ██
█ ▄▄▀▄ ▄▄▄█ █▀▄▀ ▄▀ ██▄▀  █
█▄████▄▄▄  ▀ ▄▄ █ ▄▄▄  ▄▀▄█
█ ▄▄▄▄▄ ██▄▀▀▄  █ █▄█ ███ █
█ █   █ █ █▄▄ ▀█▄ ▄  ▄ █▀▀█
█ █▄▄▄█ █▀▀▄ ▀█▄ ▄█▀▀▄█   █
█▄▄▄▄▄▄▄█▄▄█▄██▄▄▄▄█▄▄███▄█

› Metro waiting on exp://YOUR-IP:8081
› Scan the QR code above with Expo Go
```

---

### **Option 2: Web Browser**

Simply open in any browser:

```
http://localhost:8081
```

**Note**: Web view works but mobile experience is better with Expo Go

---

### **Option 3: Android Emulator**

If running Android emulator:

1. Press **a** in terminal
2. App opens in emulator automatically

### **Option 4: iOS Simulator**

If running iOS simulator:

1. Press **i** in terminal
2. App opens in simulator automatically

---

## 🔧 Terminal Commands Available

While the Expo server is running, you can press these keys:

```
Key    Action
─────  ─────────────────────────────────
s      Switch to development build
a      Open in Android Emulator
w      Open Web Preview
i      Open iOS Simulator
j      Open Debugger
r      Reload App
m      Toggle Menu
o      Open in Editor
?      Show all commands
q      Quit
```

---

## 🌐 API Endpoints Available

### Authentication Endpoints

```
POST   /api/auth/register     - Create new account
POST   /api/auth/login        - Sign in
GET    /api/auth/me           - Get current user
```

### User Endpoints

```
GET    /api/users/:userId     - Get user profile
PUT    /api/users/:userId     - Update profile
POST   /api/users/update-location/:userId - Update GPS
```

### Search Endpoints

```
GET    /api/users/nearby/professionals/:type
GET    /api/users/nearby/ambulances
GET    /api/users/nearby/volunteers
```

**All endpoints require Bearer token in Authorization header**

---

## 🔒 Authentication Flow

```
1. User logs in
2. Backend validates credentials
3. Backend creates JWT token
4. Token sent to frontend
5. Frontend stores token securely
6. Token added to all API requests
7. Backend validates token on each request
```

---

## 📡 Real-Time Features

Socket.io is configured for:

- Real-time notifications
- Live location updates
- Emergency alerts
- Chat messages
- Status updates

**Server**: `http://localhost:5000`
**Namespace**: `/`

---

## 🚨 If Something Goes Wrong

### Backend Won't Start

```bash
# Check if port 5000 is in use
netstat -ano | find "5000"

# Kill process on port 5000
taskkill /PID [PID] /F

# Try starting again
npm start
```

### Frontend Won't Start

```bash
# Clear cache and restart
npm start -- --clear

# Or completely fresh start
rm -r node_modules package-lock.json
npm install
npm start
```

### Can't Scan QR Code

```bash
# Use web preview instead
Open: http://localhost:8081

# Or use simulator
Press 'a' for Android
Press 'i' for iOS
```

### Connection Issues

```bash
# Verify backend is running
Open: http://localhost:5000/api/auth/me

# You should see error (no auth token)
# This means backend is working!
```

---

## 📊 Performance Tips

1. **Use Expo Go** - Faster than web
2. **Keep terminal open** - Don't close during development
3. **Press 'r' to reload** - Instead of restarting
4. **Check network** - Make sure WiFi is stable
5. **Device near computer** - Reduces latency

---

## 🎯 Quick Start Summary

```
Terminal 1: Backend
├─ cd backend
├─ npm start
└─ Runs on port 5000 ✅

Terminal 2: Frontend
├─ cd frontend
├─ npm start
└─ Shows QR code

Phone/Tablet:
├─ Scan QR with Expo Go
└─ App opens! ✨
```

---

## ✨ You're All Set!

Both servers are ready:

- ✅ Backend API at http://localhost:5000
- ✅ Frontend at http://localhost:8081
- ✅ QR Code visible in terminal
- ✅ Ready to scan and test

**Next Step**: Scan the QR code with Expo Go and see your SmartHealth app!
