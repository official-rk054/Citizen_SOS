# Android TurboModule Error Fix Guide

## Error Encountered

```
[runtime not ready]: Invariant Violation:
TurboModuleRegistry.getEnforcing(...): 'PlatformConstants' could not be found
```

## Root Cause

This error occurs when:

- React Native native modules are not properly built
- Bridgeless mode is incompatible with current React Native version
- TurboModule registry is missing required platform constants
- Gradle/Android build cache is corrupted

## Solution

### Method 1: Quick Fix (Try First)

**Option A: Clear Cache and Reinstall**

1. **On Windows, run the provided script:**

   ```bash
   cd frontend
   ./fix-android-build.bat
   ```

2. **Then start fresh:**
   ```bash
   npm start
   # Press 'a' for Android
   ```

**Option B: Manual Cache Clear**

```bash
cd frontend

# Clear all caches
npx expo cache clean
npm cache clean --force
rm -rf node_modules
rm -rf .expo
rm -rf .expo-shared
rm package-lock.json

# Clear Android build
rm -rf android/.gradle
rm -rf android/build
rm -rf android/app/build

# Reinstall
npm install

# Start fresh
npm start
```

### Method 2: Update app.json Configuration

✅ **Already applied** - The following fixes have been made:

1. **Disabled newArchEnabled**

   ```json
   "newArchEnabled": false
   ```

2. **Added Android-specific settings**

   ```json
   "android": {
     "enableDangerousExperimentalLeanBuildForAndroid": false,
     ...
   }
   ```

3. **Updated experiments**
   ```json
   "experiments": {
     "typedRoutes": true,
     "reactCompiler": false,
     "tsconfigPaths": false
   }
   ```

### Method 3: Alternative - Use Managed Expo Build

```bash
# Use Expo managed build instead of local
eas build --platform android
```

### Method 4: Full Clean Rebuild

```bash
# Navigate to frontend
cd frontend

# Full clean
npm run reset-project

# Remove all build artifacts
rm -rf node_modules
rm -rf .expo-shared
rm -rf .expo
rm -rf android

# Reinstall from scratch
npm install

# Start Expo
npm start
```

## Step-by-Step Instructions

### Windows Users:

1. Open PowerShell in the `frontend` folder
2. Run: `./fix-android-build.bat`
3. Wait for npm install to complete
4. Run: `npm start`
5. Press 'a' to build for Android

### Mac/Linux Users:

1. Open Terminal in the `frontend` folder
2. Run:
   ```bash
   npx expo cache clean
   npm cache clean --force
   rm -rf node_modules .expo .expo-shared android/.gradle android/build android/app/build
   npm install
   npm start
   ```
3. Press 'a' to build for Android

## Verification Steps

After applying the fix:

1. ✅ No red error screen appears
2. ✅ App loads the login/home screen
3. ✅ Navigation works
4. ✅ Buttons are clickable
5. ✅ Maps display properly
6. ✅ Location services work
7. ✅ API calls complete

## If Error Persists

### Check these conditions:

1. **Node.js Version**

   ```bash
   node --version  # Should be v18 or higher
   npm --version   # Should be v9 or higher
   ```

2. **Java Version (for Android)**

   ```bash
   java -version  # Should be Java 11 or 17
   ```

3. **Android SDK**

   - Ensure Android SDK is properly installed
   - Update to latest SDK tools

4. **Expo CLI Version**
   ```bash
   npm list expo
   # Should be ~54.0.30
   ```

### Last Resort Options

**Option 1: Downgrade React Native**

```json
{
  "react-native": "^0.72.0" // Instead of ^0.73.0
}
```

**Option 2: Use Expo Go**

- Install Expo Go app on Android device
- Use `expo start` and scan QR code
- This bypasses native module compilation

**Option 3: Rebuild from fresh Expo project**

```bash
expo init frontend-new --template expo-template-tabs
# Copy over your custom files
```

## Environment Variables to Check

```bash
# .env file for frontend (if using one)
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

## Common Mistakes to Avoid

❌ Don't forget to clear Android build cache
❌ Don't skip node_modules deletion
❌ Don't use incompatible Node/npm versions
❌ Don't forget to reinstall dependencies after clearing
❌ Don't use cached APK - rebuild fresh

## Prevention Tips

1. Keep React Native and Expo versions compatible
2. Regularly update dependencies: `npm update`
3. Use `.gitignore` to exclude build artifacts
4. Always clean before switching between devices
5. Document your working configuration

## Support Resources

- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **GitHub Issues**: Search "TurboModuleRegistry PlatformConstants"
- **Expo Slack**: Community support available

## Configuration Files Modified

✅ `app.json` - Updated Android and experiments settings
✅ `package.json` - Dependencies already correct

No other files need modification for this fix.

---

## Quick Summary

1. Run the fix script or clear cache manually
2. Reinstall dependencies
3. Start the app fresh
4. Test on Android device/emulator

**Expected Result**: App runs without TurboModule errors ✅
