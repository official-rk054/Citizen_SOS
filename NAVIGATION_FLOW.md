# 🏥 SmartHealth - Complete Navigation Flow

## Application Flow Structure

### Entry Point (Auto-Routing)

**Root Layout** (`app/_layout.tsx`)

- ✅ Checks for existing authentication token
- ✅ Loads user data from storage
- ✅ Routes to appropriate screen:
  - If logged in → `/( tabs)` (Home)
  - If not logged in → `/auth` (Welcome Screen)

---

## 🔐 Authentication Flow

### 1. **Welcome Screen** `/auth/index.tsx`

- **Features:**

  - Modern hero section with app branding
  - Key features showcase
  - Two main action buttons

- **Navigation Options:**
  - **"Sign In"** → `/auth/login` (for existing users)
  - **"Create Account"** → `/auth/register-type` (for new users)

---

### 2. **Login Screen** `/auth/login.tsx`

- **Features:**

  - Mobile number input field
  - Email address input field
  - Password input with visibility toggle
  - "Forgot password?" link
  - Back button → `/auth` (Welcome)
  - Sign In button → `/(tabs)` (Home) on success

- **API Integration:**
  - Calls `authAPI.login()`
  - Stores token in secure storage
  - Saves user data locally

---

### 3. **Registration - Role Selection** `/auth/register-type.tsx`

- **Features:**
  - Modern role card selection
  - 5 role options with descriptions:
    - 👤 **Patient** - Book appointments
    - 👨‍⚕️ **Doctor** - Manage consultations
    - 👩‍⚕️ **Nurse** - Home care services
    - 🚑 **Ambulance Service** - Emergency response
    - 🙋‍♂️ **Volunteer** - Community help
  - "Continue" button → `/auth/register-details?userType=X`
  - "Already have account?" link → `/auth/login`

---

### 4. **Registration - Details** `/auth/register-details.tsx`

- **Dynamic Form Fields Based on Role:**

  **All Users:**

  - Full Name
  - Email
  - Phone Number
  - Password
  - Confirm Password

  **Doctors & Nurses:**

  - License Number
  - Specialization
  - Years of Experience

  **Ambulance Service:**

  - Ambulance Type
  - Vehicle Number
  - Operator Name
  - Operator Phone

  **Patients:**

  - Emergency Contact Name
  - Emergency Contact Phone
  - Relationship

- **Navigation:**
  - Back button → `/auth/register-type`
  - Submit → `/(tabs)` (Home) on success

---

## 🏠 Main App Navigation

### Home Screen `/app/(tabs)/index.tsx`

- **Features:**

  - Welcome greeting with user info
  - Location tracking (automatic)
  - Nearby services display
  - Upcoming appointments
  - Emergency SOS button
  - Quick action buttons

- **Access Only If:**
  - User is logged in
  - Auth token is valid
  - User data is loaded

---

## 📱 Available Screens

### Tabs Navigation:

1. **Home** `/app/(tabs)/index.tsx` - Main dashboard
2. **Explore** `/app/(tabs)/explore.tsx` - Discover services

### Additional Pages:

- `/profile/index` - User profile
- `/appointments/index` - View appointments
- `/appointments/book` - Book new appointment
- `/ambulance/book` - Request ambulance
- `/emergency/tracking` - Emergency tracking
- `/doctors/map` - Nearby doctors map
- `/nearby/index` - Nearby services
- `/settings/payment` - Payment methods
- `/settings/orders` - Order history
- `/settings/contact` - Contact info
- `/settings/help` - Help center
- `/settings/faq` - FAQ

---

## 🔄 State Management

### Authentication Context (`context/AuthContext.tsx`)

- Manages user state globally
- Handles login/logout/register
- Provides location update functions
- Stores auth token
- Persists user data

### Storage Service (`utils/storage.ts`)

- Secure token storage
- User data persistence
- Recovery of auth state on app restart

---

## ✅ All Features Implemented

✨ **Modern UI**

- Smooth animations
- Gradient backgrounds
- Professional color scheme (#5B5FFF primary)
- Responsive design

🔐 **Security**

- Token-based authentication
- Secure storage
- Automatic re-authentication
- Password visibility toggle

📍 **Location Services**

- Real-time GPS tracking
- Nearby professionals discovery
- Emergency response optimization

🎯 **User Experience**

- Intuitive navigation
- Form validation
- Loading states
- Error handling
- Auto-redirects based on auth status

---

## 🚀 How to Test

1. **Fresh Install (No Account):**

   - App opens → Welcome Screen
   - Click "Create Account"
   - Select role
   - Fill details
   - Auto-redirect to Home

2. **Returning User (Have Account):**

   - App opens → Home (if token valid)
   - Or Welcome Screen → Sign In
   - Enter credentials
   - Auto-redirect to Home

3. **Logout:**
   - Go to Settings
   - Click Logout
   - Back to Welcome Screen

---

## 📡 API Endpoints Connected

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/users/nearby/professionals/{type}` - Find professionals
- `GET /api/users/nearby/ambulances` - Find ambulances
- `POST /api/users/update-location/{userId}` - Update location

---

## 🎯 Current Status

✅ All pages connected and functional
✅ Navigation flow fully implemented
✅ Authentication integrated
✅ Modern UI applied throughout
✅ Backend API connected
✅ Real-time location tracking ready
✅ Ready for testing!
