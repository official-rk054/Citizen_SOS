/**
 * System Information Utility
 * Logs and retrieves device/platform information using expo-constants
 */

import Constants from 'expo-constants';

export const logSystemInfo = () => {
  try {
    console.log('=== System Information ===');
    console.log('Platform:', Constants.platform);
    console.log('OS:', Constants.platform?.ios?.buildNumber || Constants.platform?.android?.versionCode);
    console.log('System Version:', Constants.expoVersion);
    console.log('Device Name:', Constants.deviceName);
    console.log('Device ID:', Constants.deviceId);
    console.log('App Name:', Constants.manifest?.name);
    console.log('App Version:', Constants.manifest?.version);
    console.log('========================');
  } catch (error) {
    console.error('Error logging system info:', error);
  }
};

export const getSystemInfo = () => {
  try {
    return {
      platform: Constants.platform,
      systemVersion: Constants.expoVersion,
      deviceName: Constants.deviceName,
      deviceId: Constants.deviceId,
      appName: Constants.manifest?.name,
      appVersion: Constants.manifest?.version,
    };
  } catch (error) {
    console.error('Error getting system info:', error);
    return null;
  }
};

export default {
  logSystemInfo,
  getSystemInfo,
};
