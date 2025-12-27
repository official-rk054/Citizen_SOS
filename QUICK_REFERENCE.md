# Quick Reference - DNA Smart Healthcare App

**Last Updated:** December 27, 2025  
**All Systems:** ✅ Operational

---

## 🚀 Quick Start

### Start Backend

```bash
cd C:\Users\rishi\OneDrive\Desktop\DNA\backend
node server.js
```

✅ Runs on `http://localhost:5000`

### Start Frontend

```bash
cd C:\Users\rishi\OneDrive\Desktop\DNA\frontend
npm start
```

✅ Available at `http://localhost:8081`

---

## 📱 Features Implemented

### Payment Methods

- **Route:** `/settings/payment`
- **Features:** Add, view, delete, set default
- **API:** `GET/POST/DELETE /api/users/:userId/payment-methods`

### Order History

- **Route:** `/settings/orders`
- **Features:** View orders, filter by status
- **API:** `GET /api/users/:userId/orders`

### Nearby Services

- **Route:** Home page
- **Features:** Doctors, nurses, ambulances, volunteers
- **API:** `GET /api/users/nearby/:type`

### Emergency System

- **Route:** `/emergency/tracking`
- **Features:** SOS, real-time tracking, nurse alerts
- **Socket.io:** `nurse-alert`, `responder-calling`

---

## 🔧 Key Files Modified

### Frontend

```
✅ app/settings/payment.tsx - Payment methods CRUD
✅ app/settings/orders.tsx - Order history display
✅ app/(tabs)/index.tsx - Added volunteers section
✅ package.json - Fixed dependencies
✅ utils/api.ts - Already had endpoints
```

### Backend

```
✅ routes/users.js - Added payment & order endpoints
✅ routes/profile.js - Already complete
✅ server.js - Socket.io handlers active
```

---

## 📊 Database Schema

### User.paymentMethods[]

```javascript
{
  _id: ObjectId,
  type: 'card' | 'upi' | 'wallet' | 'bank_transfer',
  cardLast4: String,
  cardHolderName: String,
  expiryMonth: Number,
  expiryYear: Number,
  isDefault: Boolean,
  isVerified: Boolean,
  createdAt: Date
}
```

### Emergency

```javascript
{
  victimId: ObjectId,
  victimName: String,
  latitude: Number,
  longitude: Number,
  assignedAmbulanceId: ObjectId,
  alertedVolunteerIds: [ObjectId],
  status: 'active' | 'responding' | 'completed',
  severity: 'low' | 'medium' | 'high' | 'critical'
}
```

---

## 🔌 API Endpoints

### Payment Methods

```
GET    /api/users/:userId/payment-methods
POST   /api/users/:userId/payment-methods
DELETE /api/users/:userId/payment-methods/:methodId
POST   /api/users/:userId/payment-methods/:methodId/set-default
```

### Orders

```
GET    /api/users/:userId/orders?filter=Confirmed
```

### Nearby Services

```
GET    /api/users/nearby/professionals/:type
GET    /api/users/nearby/ambulances
GET    /api/users/nearby/volunteers
```

### Emergency

```
POST   /api/emergency/trigger
GET    /api/emergency/:emergencyId
PUT    /api/emergency/:emergencyId
POST   /api/emergency/:emergencyId/notify-nurses
```

---

## 🔍 Debugging Tips

### Check Backend

```bash
# View server logs
node server.js

# Check MongoDB connection
# Should show: "MongoDB connected"
```

### Check Frontend

```bash
# View Metro bundler output
npm start

# Look for: "Web Bundled XXms"
```

### Test APIs

```bash
# Example: Get payment methods
curl http://localhost:5000/api/users/{userId}/payment-methods \
  -H "Authorization: Bearer {token}"
```

---

## 📝 Status Summary

| Component        | Status       | Last Verified |
| ---------------- | ------------ | ------------- |
| Backend Server   | ✅ Running   | Dec 27, 2025  |
| Frontend App     | ✅ Running   | Dec 27, 2025  |
| Payment Methods  | ✅ Working   | Dec 27, 2025  |
| Order History    | ✅ Working   | Dec 27, 2025  |
| Volunteers       | ✅ Working   | Dec 27, 2025  |
| Emergency System | ✅ Working   | Dec 27, 2025  |
| Socket.io        | ✅ Active    | Dec 27, 2025  |
| Database         | ✅ Connected | Dec 27, 2025  |

---

## 🆘 Common Issues & Solutions

### Frontend won't start

```bash
# Clear cache and reinstall
rm -r node_modules
npm install
npm start
```

### API not responding

```bash
# Check backend is running
# Verify port 5000 is accessible
# Check MongoDB connection
```

### Socket.io not connecting

```bash
# Verify backend socket handlers
# Check WebSocket support
# Review console logs
```

---

## 📚 Documentation Files

- `IMPLEMENTATION_COMPLETE.md` - Full feature list
- `FINAL_STATUS.md` - System status report
- `ERRORS_FIXED.md` - Error details and fixes
- `ARCHITECTURE_AND_TROUBLESHOOTING.md` - System architecture
- `DASHBOARD_FINAL_SUMMARY.md` - Dashboard overview

---

**Ready for production testing!** 🎯
