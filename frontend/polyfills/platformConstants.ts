/**
 * Platform Constants Polyfill
 * This polyfill provides platform-specific constants for React Native
 * when running in Bridgeless mode with Expo Go
 */

import { Platform } from 'react-native';

const PlatformConstants = {
  // React Native version
  reactNativeVersion: {
    major: 0,
    minor: 73,
    patch: 11,
    prerelease: null,
  },
  // Current OS
  OS: Platform.OS,
  // Architecture
  Architecture: Platform.OS === 'android' ? 'arm64-v8a' : 'arm64',
  // Device info
  Fingerprint: 'unknown',
  isTesting: false,
  // UI constraints
  isDisableUIKitTextIntrinsicContentSizeWorkaround: false,
};

export default PlatformConstants;
