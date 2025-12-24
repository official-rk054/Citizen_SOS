import { View, Text, StyleSheet, Platform } from 'react-native';

// Platform detection utilities for web
export const isWeb = Platform.OS === 'web';

// Override console for web debugging
if (isWeb) {
  console.log('[WEB] Expo DNS Assist running on web platform');
}

// Web-specific polyfills
if (isWeb) {
  // Add any web-specific polyfills here
  if (typeof window !== 'undefined') {
    // Setup web environment if needed
  }
}
