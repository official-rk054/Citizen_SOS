import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

interface Location {
  latitude: number;
  longitude: number;
}

interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  type?: 'doctor' | 'nurse' | 'ambulance' | 'user' | 'emergency';
  color?: string;
  onPress?: (marker: MapMarker) => void;
}

interface GoogleMapProps {
  initialLocation?: Location;
  markers: MapMarker[];
  showUserLocation?: boolean;
  onMarkerPress?: (marker: MapMarker) => void;
  onMapPress?: (location: Location) => void;
  showRadius?: boolean;
  radiusKm?: number;
  mapHeight?: number;
  style?: any;
}

export default function GoogleMapWeb({
  initialLocation,
  markers,
  showUserLocation = true,
  onMarkerPress,
  onMapPress,
  showRadius = false,
  radiusKm = 5,
  mapHeight = height * 0.6,
  style,
}: GoogleMapProps) {
  const [userLocation, setUserLocation] = useState<Location | null>(initialLocation || null);
  const [loading, setLoading] = useState(!initialLocation);

  useEffect(() => {
    if (!initialLocation) {
      requestLocationPermission();
    }
  }, [initialLocation]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } else {
        Alert.alert('Permission Denied', 'Location permission is required to use maps');
      }
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (marker: MapMarker) => {
    if (onMarkerPress) {
      onMarkerPress(marker);
    }
    marker.onPress?.(marker);
  };

  if (loading) {
    return (
      <View style={[styles.container, { height: mapHeight }, style]}>
        <ActivityIndicator size="large" color="#5B5FFF" />
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View style={[styles.container, { height: mapHeight }, style]}>
        <Text style={styles.errorText}>Location not available</Text>
      </View>
    );
  }

  return (
    <View style={[styles.mapContainer, { height: mapHeight }, style]}>
      {/* Web Map Fallback - Display as List/Grid */}
      <View style={styles.webMapContainer}>
        <View style={styles.mapHeader}>
          <Text style={styles.headerTitle}>Map View</Text>
          <Text style={styles.headerSubtitle}>
            Your Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        </View>

        <View style={styles.markersContainer}>
          {markers.map((marker) => (
            <TouchableOpacity
              key={marker.id}
              style={[
                styles.markerCard,
                { borderLeftColor: marker.color || '#5B5FFF' },
              ]}
              onPress={() => handleMarkerPress(marker)}
            >
              <View style={styles.markerContent}>
                <Text style={styles.markerTitle}>{marker.title}</Text>
                {marker.description && (
                  <Text style={styles.markerDescription}>{marker.description}</Text>
                )}
                <Text style={styles.markerCoords}>
                  {marker.latitude.toFixed(4)}, {marker.longitude.toFixed(4)}
                </Text>
                {marker.type && (
                  <View style={styles.markerType}>
                    <Text style={styles.markerTypeText}>{marker.type}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Map Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton}>
          <MaterialIcons name="my-location" size={24} color="#5B5FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  webMapContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    overflow: 'hidden',
  },
  mapHeader: {
    backgroundColor: '#5B5FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  markersContainer: {
    flex: 1,
    padding: 12,
  },
  markerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  markerContent: {
    flex: 1,
  },
  markerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  markerDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  markerCoords: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  markerType: {
    alignSelf: 'flex-start',
    backgroundColor: '#5B5FFF',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  markerTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  errorText: {
    fontSize: 14,
    color: '#999',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
  },
  controlButton: {
    backgroundColor: '#fff',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
    marginLeft: 10,
  },
});
