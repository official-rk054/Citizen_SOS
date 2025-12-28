/**
 * Web Geolocation Service
 * Provides location services for web platform using Geolocation API
 * Falls back to IP-based location if Geolocation API is unavailable
 */

export interface WebLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

/**
 * Get current position using Web Geolocation API
 */
export const getCurrentPosition = (): Promise<WebLocation> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Fallback to IP-based location if Geolocation API not available
      getIPBasedLocation()
        .then(resolve)
        .catch(() => {
          reject({
            code: 0,
            message: 'Geolocation API not available and IP-based location failed',
          } as LocationError);
        });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Try IP-based fallback
        getIPBasedLocation()
          .then(resolve)
          .catch(() => {
            reject({
              code: error.code,
              message: error.message,
            } as LocationError);
          });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

/**
 * Watch position with continuous updates
 */
export const watchPosition = (
  callback: (location: WebLocation) => void,
  errorCallback?: (error: LocationError) => void,
  options?: PositionOptions
): number => {
  if (!navigator.geolocation) {
    errorCallback?.({
      code: 0,
      message: 'Geolocation API not available',
    });
    return -1;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      console.error('Watch position error:', error);
      errorCallback?.({
        code: error.code,
        message: error.message,
      });
    },
    options || {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    }
  );
};

/**
 * Clear watch position
 */
export const clearWatch = (watchId: number): void => {
  if (navigator.geolocation && watchId >= 0) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Get location based on IP address (fallback)
 * Uses ip-api.com free service
 */
export const getIPBasedLocation = (): Promise<WebLocation> => {
  return fetch('https://ipapi.co/json/')
    .then((response) => response.json())
    .then((data) => {
      if (data.latitude && data.longitude) {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: 5000, // IP-based location is typically 5km accurate
          timestamp: Date.now(),
        } as WebLocation;
      }
      throw new Error('Invalid IP-based location data');
    })
    .catch((error) => {
      console.error('IP-based location error:', error);
      throw error;
    });
};

/**
 * Check if Geolocation API is supported
 */
export const isGeolocationSupported = (): boolean => {
  return !!navigator.geolocation;
};

/**
 * Request permission for location access
 */
export const requestLocationPermission = (): Promise<string> => {
  if (!navigator.permissions) {
    // Fallback for browsers without Permissions API
    return Promise.resolve('granted');
  }

  return navigator.permissions
    .query({ name: 'geolocation' as PermissionName })
    .then((permission) => permission.state)
    .catch(() => 'granted');
};

/**
 * Get location permission status
 */
export const getLocationPermissionStatus = (): Promise<string> => {
  if (!navigator.permissions) {
    return Promise.resolve('granted');
  }

  return navigator.permissions
    .query({ name: 'geolocation' as PermissionName })
    .then((permission) => permission.state)
    .catch(() => 'unknown');
};

/**
 * Geocode coordinates to address (reverse geocoding)
 */
export const geocodeToAddress = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();
    return data.address?.road || data.address?.city || `${latitude}, ${longitude}`;
  } catch (error) {
    console.error('Geocoding error:', error);
    return `${latitude}, ${longitude}`;
  }
};

/**
 * Get address from coordinates using Google Maps Geocoding API
 * (Requires API key)
 */
export const geocodeWithGoogle = async (
  latitude: number,
  longitude: number,
  apiKey?: string
): Promise<string> => {
  if (!apiKey) {
    console.warn('Google Maps API key not provided, using OpenStreetMap');
    return geocodeToAddress(latitude, longitude);
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return `${latitude}, ${longitude}`;
  } catch (error) {
    console.error('Google geocoding error:', error);
    return geocodeToAddress(latitude, longitude);
  }
};

/**
 * Verify location accuracy
 */
export const isLocationAccurate = (
  location: WebLocation,
  requiredAccuracy: number = 100
): boolean => {
  return (location.accuracy || 5000) <= requiredAccuracy;
};

/**
 * Format location for display
 */
export const formatLocationForDisplay = (location: WebLocation): string => {
  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
};
