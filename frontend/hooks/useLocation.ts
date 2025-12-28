import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as WebLocationService from '../utils/webLocationService';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  timestamp?: number;
  error?: string;
}

export interface UseLocationOptions {
  enableWatch?: boolean;
  highAccuracy?: boolean;
  updateInterval?: number; // milliseconds
  onError?: (error: string) => void;
}

/**
 * Cross-platform location hook
 * Works on Native (iOS/Android) and Web platforms
 */
export const useLocation = (options: UseLocationOptions = {}) => {
  const {
    enableWatch = false,
    highAccuracy = true,
    updateInterval = 5000,
    onError,
  } = options;

  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const watchRef = useRef<any>(null);
  const isWeb = Platform.OS === 'web';

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (isWeb) {
        // Web platform
        const permission = await WebLocationService.getLocationPermissionStatus();
        if (permission !== 'granted') {
          throw new Error('Location permission denied');
        }

        const webLocation = await WebLocationService.getCurrentPosition();
        const address = await WebLocationService.geocodeToAddress(
          webLocation.latitude,
          webLocation.longitude
        );

        const locationData: LocationData = {
          latitude: webLocation.latitude,
          longitude: webLocation.longitude,
          accuracy: webLocation.accuracy,
          address,
          timestamp: webLocation.timestamp,
        };

        setLocation(locationData);
        setAccuracy(webLocation.accuracy || null);
      } else {
        // Native platform (iOS/Android)
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Location permission denied');
        }

        const nativeLocation = await Location.getCurrentPositionAsync({
          accuracy: highAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
        });

        const locationData: LocationData = {
          latitude: nativeLocation.coords.latitude,
          longitude: nativeLocation.coords.longitude,
          accuracy: nativeLocation.coords.accuracy,
          timestamp: nativeLocation.timestamp,
        };

        setLocation(locationData);
        setAccuracy(nativeLocation.coords.accuracy);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isWeb, highAccuracy, onError]);

  // Request location permission
  const requestPermission = useCallback(async () => {
    try {
      if (isWeb) {
        await WebLocationService.requestLocationPermission();
      } else {
        await Location.requestForegroundPermissionsAsync();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permission';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [isWeb, onError]);

  // Start watching location
  const startWatching = useCallback(async () => {
    try {
      if (!enableWatch) return;

      if (isWeb) {
        // Web platform
        watchRef.current = WebLocationService.watchPosition(
          (webLocation) => {
            const locationData: LocationData = {
              latitude: webLocation.latitude,
              longitude: webLocation.longitude,
              accuracy: webLocation.accuracy,
              timestamp: webLocation.timestamp,
            };
            setLocation(locationData);
            setAccuracy(webLocation.accuracy || null);
          },
          (error) => {
            setError(error.message);
            onError?.(error.message);
          },
          {
            enableHighAccuracy: highAccuracy,
            timeout: 10000,
            maximumAge: updateInterval,
          }
        );
      } else {
        // Native platform
        watchRef.current = await Location.watchPositionAsync(
          {
            accuracy: highAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
            timeInterval: updateInterval,
            distanceInterval: 10, // update on 10m movement
          },
          (nativeLocation: any) => {
            const locationData: LocationData = {
              latitude: nativeLocation.coords.latitude,
              longitude: nativeLocation.coords.longitude,
              accuracy: nativeLocation.coords.accuracy,
              timestamp: nativeLocation.timestamp,
            };
            setLocation(locationData);
            setAccuracy(nativeLocation.coords.accuracy);
          }
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start watching location';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [enableWatch, isWeb, highAccuracy, updateInterval, onError]);

  // Stop watching location
  const stopWatching = useCallback(() => {
    if (watchRef.current) {
      if (isWeb) {
        WebLocationService.clearWatch(watchRef.current);
      } else {
        watchRef.current.remove?.();
      }
      watchRef.current = null;
    }
  }, [isWeb]);

  // Check location support
  const isLocationSupported = useCallback((): boolean => {
    if (isWeb) {
      return WebLocationService.isGeolocationSupported();
    }
    return true; // Native always supports location
  }, [isWeb]);

  // Retry location
  const retry = useCallback(async () => {
    setError(null);
    await getCurrentLocation();
  }, [getCurrentLocation]);

  // Initialize
  useEffect(() => {
    getCurrentLocation();
    if (enableWatch) {
      startWatching();
    }

    return () => {
      stopWatching();
    };
  }, [enableWatch, getCurrentLocation, startWatching, stopWatching]);

  return {
    location,
    loading,
    error,
    accuracy,
    getCurrentLocation,
    requestPermission,
    startWatching,
    stopWatching,
    retry,
    isLocationSupported,
    isWeb,
  };
};

export default useLocation;
