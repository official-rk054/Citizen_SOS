import { View, Text, StyleSheet, Platform } from 'react-native';

// Platform detection utilities for web
export const isWeb = Platform.OS === 'web';

// Override console for web debugging
if (isWeb) {
  console.log('[WEB] Web location services initialized');
}

// Web-specific polyfills
if (isWeb) {
  // Add any web-specific polyfills here
  if (typeof window !== 'undefined') {
    // Setup web environment if needed
    
    // Polyfill for navigator.geolocation if not available
    if (!navigator.geolocation) {
      console.warn('[WEB] Geolocation API not available on this browser');
    }
    
    // Polyfill for Permissions API
    if (!navigator.permissions) {
      console.warn('[WEB] Permissions API not available, fallback to direct API calls');
    }

    // Add Web Location Service globals
    window.__webLocationService = {
      isGeolocationSupported: () => !!navigator.geolocation,
      isPermissionsAPISupported: () => !!navigator.permissions,
    };
  }
}

// Export polyfill utilities
export const webLocationPolyfills = {
  isGeolocationSupported: () => {
    if (typeof navigator !== 'undefined') {
      return !!navigator.geolocation;
    }
    return false;
  },
  
  isPermissionsAPISupported: () => {
    if (typeof navigator !== 'undefined') {
      return !!navigator.permissions;
    }
    return false;
  },

  // Test connectivity to geolocation services
  testGeolocation: (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(false);
        return;
      }

      const timeout = setTimeout(() => resolve(false), 5000);

      navigator.geolocation.getCurrentPosition(
        () => {
          clearTimeout(timeout);
          resolve(true);
        },
        () => {
          clearTimeout(timeout);
          resolve(false);
        }
      );
    });
  },
};
