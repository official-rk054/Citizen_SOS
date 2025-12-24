# Fix for "codegenNativeComponent is not a function" Error

## Problem Summary

You were getting the error:

```
(0, _reactNativeWebDistIndex.codegenNativeComponent) is not a function
```

This occurred because:

1. **Incompatible react-native-maps on web**: `react-native-maps` is a native module that uses native iOS/Android code. It doesn't work on the web platform where it tries to call `codegenNativeComponent` which doesn't exist in react-native-web.

2. **Version mismatches**: The package.json had:

   - React Native 0.81.5 (too new)
   - React Native Web 0.21.0 (too old for that version of RN)
   - React 19.1.0 with old Native navigation versions (incompatible)
   - New Architecture enabled (`newArchEnabled: true`) which requires additional setup

3. **Incompatible dependency versions**: Various packages were misaligned causing module resolution issues.

## Solutions Applied

### 1. Created Web Fallback Component (`GoogleMap.web.tsx`)

Created a platform-specific component that automatically loads on web:

- Shows markers in a user-friendly card list instead of a native map
- Displays latitude/longitude coordinates
- Allows filtering by marker type
- Maintains the same API as the native GoogleMap component

### 2. Updated package.json Dependencies

Aligned all versions for compatibility:

```json
"react": "18.3.1",           // Was 19.1.0 (too new)
"react-dom": "18.3.1",       // Was 19.1.0 (too new)
"react-native": "0.73.0",    // Was 0.81.5 (incompatible)
"react-native-web": "^0.19.11",  // Was ~0.21.0 (too old for RN 0.81)
"react-native-gesture-handler": "~2.14.0",     // Updated
"react-native-reanimated": "~3.8.0",           // Updated
"react-native-safe-area-context": "~4.8.0",    // Updated
"react-native-screens": "~3.30.0"              // Updated
```

### 3. Disabled New Architecture

Changed in `app.json`:

```json
"newArchEnabled": false
```

The new architecture requires additional configuration and native build setup that wasn't properly configured.

### 4. Updated .babelrc

Ensured proper Babel configuration for react-native-web:

- Added `react-native-web` plugin
- Added `react-native-reanimated/plugin` for animations
- Set up production environment configuration

### 5. Added Web Polyfills Utility

Created `utils/web-polyfills.ts` for future web-specific compatibility helpers.

## How Platform-Specific Components Work

The Expo/React Native ecosystem automatically uses the `.web.tsx` version when running on web:

```
components/
├── GoogleMap.tsx          ← Used on iOS/Android
└── GoogleMap.web.tsx      ← Automatically used on web (via Expo Router)
```

When you import:

```typescript
import GoogleMap from "../../components/GoogleMap";
```

It will use:

- `GoogleMap.tsx` on native platforms (iOS/Android)
- `GoogleMap.web.tsx` on web platform

## Next Steps

1. **Delete node_modules and reinstall**:

   ```bash
   rm -r node_modules package-lock.json
   npm install
   ```

2. **Run the app**:

   ```bash
   npm start          # For iOS/Android via Expo
   npm run web        # For web
   ```

3. **If issues persist**:
   - Clear Expo cache: `expo start --clear`
   - Clear browser cache in DevTools
   - Check that `new GoogleMap` components are using the new web fallback

## Why This Works

- **Native platforms** (iOS/Android): Continue using native `MapView` from `react-native-maps` which has full functionality
- **Web platform**: Uses a React Native Web compatible card-based interface that displays markers as interactive cards
- **Single codebase**: Same component API works on all platforms without changing your app code

## Additional Notes

- The web fallback is intentionally simpler to avoid native dependencies
- If you need a full-featured web map, you can replace `GoogleMap.web.tsx` with Google Maps Web API or Leaflet later
- All other components remain unchanged and work across platforms
