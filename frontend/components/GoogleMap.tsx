import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import MapView, { Marker, Callout, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
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

const GOOGLE_MAPS_API_KEY = 'AIzaSyC8u6hmkl_JC4p4vV_WaDdpDjwag2gQSFM';

const markerColors = {
  doctor: '#5B5FFF',
  nurse: '#FF6B6B',
  ambulance: '#FF9800',
  user: '#4CAF50',
  emergency: '#F44336',
};

const getMarkerIcon = (type?: string) => {
  switch (type) {
    case 'doctor':
      return '👨‍⚕️';
    case 'nurse':
      return '👩‍⚕️';
    case 'ambulance':
      return '🚑';
    case 'emergency':
      return '🚨';
    default:
      return '📍';
  }
};

export default function GoogleMap({
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
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(initialLocation || null);
  const [loading, setLoading] = useState(!initialLocation);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!initialLocation) {
      requestLocationPermission();
    }
  }, [initialLocation]);

  useEffect(() => {
    if (userLocation && markers.length > 0 && mapReady) {
      fitToMarkers();
    }
  }, [markers, mapReady]);

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

  const fitToMarkers = () => {
    if (!mapRef.current || !userLocation || markers.length === 0) return;

    const allLocations = [userLocation, ...markers.map(m => ({ latitude: m.latitude, longitude: m.longitude }))];
    
    const minLat = Math.min(...allLocations.map(l => l.latitude));
    const maxLat = Math.max(...allLocations.map(l => l.latitude));
    const minLng = Math.min(...allLocations.map(l => l.longitude));
    const maxLng = Math.max(...allLocations.map(l => l.longitude));

    mapRef.current.fitToCoordinates(allLocations, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true,
    });
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
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={(e) => onMapPress?.(e.nativeEvent.coordinate)}
        onMapReady={() => setMapReady(true)}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={false}
      >
        {/* User Location Marker */}
        {showUserLocation && userLocation && (
          <>
            <Marker
              coordinate={userLocation}
              title="Your Location"
              pinColor="#4CAF50"
            >
              <View style={styles.userMarker}>
                <View style={styles.userMarkerInner} />
              </View>
            </Marker>

            {/* Radius Circle */}
            {showRadius && (
              <Circle
                center={userLocation}
                radius={radiusKm * 1000}
                fillColor="rgba(91, 95, 255, 0.1)"
                strokeColor="rgba(91, 95, 255, 0.5)"
                strokeWidth={2}
              />
            )}
          </>
        )}

        {/* Other Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            onPress={() => handleMarkerPress(marker)}
          >
            <View
              style={[
                styles.markerContainer,
                { backgroundColor: marker.color || markerColors[marker.type || 'user'] },
              ]}
            >
              <Text style={styles.markerEmoji}>{getMarkerIcon(marker.type)}</Text>
            </View>

            {/* Callout with info */}
            <Callout tooltip={true}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{marker.title}</Text>
                {marker.description && (
                  <Text style={styles.calloutDescription}>{marker.description}</Text>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => mapRef.current?.animateToRegion({
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          })}
        >
          <MaterialIcons name="my-location" size={24} color="#5B5FFF" />
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: markerColors.doctor }]} />
          <Text style={styles.legendText}>Doctor</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: markerColors.nurse }]} />
          <Text style={styles.legendText}>Nurse</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: markerColors.ambulance }]} />
          <Text style={styles.legendText}>Ambulance</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  map: {
    flex: 1,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
  },
  errorText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  userMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerEmoji: {
    fontSize: 24,
  },
  calloutContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    minWidth: 150,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  calloutDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  controls: {
    position: 'absolute',
    bottom: 100,
    right: 12,
    gap: 8,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  legend: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
