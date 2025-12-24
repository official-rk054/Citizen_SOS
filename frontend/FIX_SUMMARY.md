# Quick Fix Guide - codegenNativeComponent Error

## Changes Made

✅ **Created `components/GoogleMap.web.tsx`** - Web-compatible map fallback component
✅ **Updated `package.json`** - Fixed incompatible dependency versions
✅ **Updated `app.json`** - Disabled `newArchEnabled` for stability
✅ **Updated `.babelrc`** - Added proper react-native-web plugin configuration
✅ **Created `utils/web-polyfills.ts`** - Web compatibility helpers

## To Activate These Fixes

Run these commands in your `frontend` directory:

```bash
# Remove old dependencies
rm -r node_modules package-lock.json

# Reinstall with fixed versions
npm install

# Clear Expo cache
npm start -- --clear

# For web testing
npm run web

# For native testing
npm run android
npm run ios
```

## Root Cause

The error occurred because:

1. **react-native-maps** (native iOS/Android module) was being loaded on **web platform**
2. **Version mismatch**: React Native 0.81.5 with React Native Web 0.21.0 are incompatible
3. **New Architecture enabled** but not properly configured
4. **React 19.1.0** with old navigation library versions

## What Was Fixed

| Issue                   | Fix                                                     |
| ----------------------- | ------------------------------------------------------- |
| Native maps on web      | Created platform-specific `.web.tsx` fallback           |
| Version conflicts       | Updated to compatible versions (RN 0.73.0, RNW 0.19.11) |
| New Architecture issues | Disabled `newArchEnabled`                               |
| React version mismatch  | Updated React to 18.3.1                                 |
| Dependencies misaligned | Updated gesture-handler, reanimated, screens            |

## Platform-Specific Behavior

After fixing:

- **iOS/Android**: Uses native `MapView` from `react-native-maps` (full functionality)
- **Web**: Uses card-based marker display (GoogleMap.web.tsx)

The same `GoogleMap` import automatically uses the correct version!

## If Issues Persist

1. Check that `node_modules` is completely removed and reinstalled
2. Clear browser cache if testing on web
3. Run `npx expo start --clear` to reset Expo cache
4. Check that all files were updated correctly (see WEB_FIX_DOCUMENTATION.md)

See **WEB_FIX_DOCUMENTATION.md** for detailed technical information.
