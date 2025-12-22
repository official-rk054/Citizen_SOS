/**
 * Geolocation Utilities
 * Handles distance calculations and location-based queries
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 * 
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
}

/**
 * Filter locations within a radius
 * 
 * @param {Array} locations - Array of location objects with latitude/longitude
 * @param {number} centerLat - Center latitude
 * @param {number} centerLon - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Array} Filtered locations within radius
 */
function filterByRadius(locations, centerLat, centerLon, radiusKm) {
  return locations.filter(location => {
    if (!location.latitude || !location.longitude) return false;
    
    const distance = calculateDistance(
      centerLat,
      centerLon,
      location.latitude,
      location.longitude
    );
    
    return distance <= radiusKm;
  });
}

/**
 * Find nearest location from a list
 * 
 * @param {Array} locations - Array of location objects
 * @param {number} centerLat - Center latitude
 * @param {number} centerLon - Center longitude
 * @returns {Object} Nearest location with distance
 */
function findNearest(locations, centerLat, centerLon) {
  if (!locations || locations.length === 0) return null;
  
  let nearest = null;
  let minDistance = Infinity;
  
  locations.forEach(location => {
    if (!location.latitude || !location.longitude) return;
    
    const distance = calculateDistance(
      centerLat,
      centerLon,
      location.latitude,
      location.longitude
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = {
        ...location,
        distance: Math.round(distance * 100) / 100 // Round to 2 decimals
      };
    }
  });
  
  return nearest;
}

/**
 * Sort locations by distance
 * 
 * @param {Array} locations - Array of location objects
 * @param {number} centerLat - Center latitude
 * @param {number} centerLon - Center longitude
 * @returns {Array} Sorted locations with distances
 */
function sortByDistance(locations, centerLat, centerLon) {
  return locations
    .map(location => ({
      ...location,
      distance: calculateDistance(
        centerLat,
        centerLon,
        location.latitude,
        location.longitude
      )
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Get location bounds (bounding box) for a radius
 * Useful for map views
 * 
 * @param {number} centerLat - Center latitude
 * @param {number} centerLon - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Object} Bounds with min/max lat/lon
 */
function getLocationBounds(centerLat, centerLon, radiusKm) {
  // Approximate degrees per kilometer (varies by latitude)
  const degreesPerKm = 1 / 111.2;
  const latOffset = radiusKm * degreesPerKm;
  const lonOffset = radiusKm * degreesPerKm / Math.cos(centerLat * (Math.PI / 180));
  
  return {
    minLat: centerLat - latOffset,
    maxLat: centerLat + latOffset,
    minLon: centerLon - lonOffset,
    maxLon: centerLon + lonOffset
  };
}

/**
 * Validate coordinates
 * 
 * @param {number} lat - Latitude (-90 to 90)
 * @param {number} lon - Longitude (-180 to 180)
 * @returns {boolean} True if valid
 */
function isValidCoordinates(lat, lon) {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * Convert degrees to radians
 * 
 * @param {number} degrees - Degrees value
 * @returns {number} Radians value
 */
function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * 
 * @param {number} radians - Radians value
 * @returns {number} Degrees value
 */
function radiansToDegrees(radians) {
  return radians * (180 / Math.PI);
}

module.exports = {
  calculateDistance,
  filterByRadius,
  findNearest,
  sortByDistance,
  getLocationBounds,
  isValidCoordinates,
  degreesToRadians,
  radiansToDegrees
};
