/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (latitude: number, longitude: number): string => {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

/**
 * Get Google Maps URL for coordinates
 */
export const getGoogleMapsURL = (latitude: number, longitude: number): string => {
  return `https://maps.google.com/?q=${latitude},${longitude}`;
};

/**
 * Get direction URL between two locations
 */
export const getDirectionsURL = (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): string => {
  return `https://maps.google.com/?saddr=${fromLat},${fromLon}&daddr=${toLat},${toLon}`;
};

/**
 * Estimate ETA in minutes based on distance (rough estimate)
 */
export const estimateETA = (distanceKm: number): number => {
  // Assuming average speed of 40 km/h in urban areas
  const avgSpeed = 40;
  return Math.ceil((distanceKm / avgSpeed) * 60);
};
