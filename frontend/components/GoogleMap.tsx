import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Callout, Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

type LatLng = {
  latitude: number;
  longitude: number;
};

type RegionShape = LatLng & {
  latitudeDelta: number;
  longitudeDelta: number;
};

type MapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  type?: 'doctor' | 'nurse' | 'ambulance' | 'user' | string;
  color?: string;
  onPress?: (marker: MapMarker) => void;
};

type Props = {
  style?: object;
  initialRegion?: RegionShape;
  markers?: MapMarker[];
  onMarkerPress?: (marker: MapMarker) => void;
  onMapPress?: (coord: LatLng) => void;
  showRadius?: boolean;
  radiusKm?: number;
  showUserLocation?: boolean;
  mapHeight?: number;
};

const markerColors: Record<string, string> = {
  doctor: '#5B5FFF',
  nurse: '#FF6B6B',
  ambulance: '#2EC4B6',
  user: '#5B5FFF',
};

const getMarkerIcon = (type?: string) => {
  switch (type) {
    case 'doctor':
      return '🩺';
    case 'nurse':
      return '💉';
    case 'ambulance':
      return '🚑';
    default:
      return '📍';
  }
};

const GoogleMap: React.FC<Props> = ({
  style,
  initialRegion,
  markers = [],
  onMarkerPress,
  onMapPress,
  showRadius = false,
  radiusKm = 2,
  showUserLocation = true,
  mapHeight = Dimensions.get('window').height * 0.4,
}) => {
  const mapRef = useRef<React.ComponentRef<typeof MapView> | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
      setPermissionDenied(false);
    } catch (err) {
      // keep fallback UI on error
    } finally {
      setLoading(false);
    }
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateCamera({ center: userLocation, zoom: 15 }, { duration: 500 });
    }
  };

  const getMarkerColor = (type?: string) => markerColors[type as keyof typeof markerColors] || markerColors.user;

  const renderCustomMarker = (marker: MapMarker) => {
    const color = marker.color || getMarkerColor(marker.type);
    const icon = getMarkerIcon(marker.type);

    return (
      <View style={styles.markerContainer}>
        <View style={[styles.markerBubble, { backgroundColor: color }]}>
          <Text style={styles.markerIcon}>{icon}</Text>
        </View>
        <View style={[styles.markerArrow, { borderTopColor: color }]} />
      </View>
    );
  };

  const handleMapPress = (e: { nativeEvent: { coordinate: LatLng } }) => {
    onMapPress?.(e.nativeEvent.coordinate);
  };

  if (loading) {
    return (
      <View style={[styles.container, { height: mapHeight }, style]}>
        <ActivityIndicator size="large" color="#5B5FFF" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View style={[styles.container, { height: mapHeight }, style]}>
        <MaterialIcons name="location-off" size={48} color="#999" />
        <Text style={styles.errorText}>
          {permissionDenied ? 'Location permission denied' : 'Location not available'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={getUserLocation}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: mapHeight }, style]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={
          initialRegion || {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }
        }
        showsUserLocation={showUserLocation}
        showsMyLocationButton
        showsCompass
        onPress={handleMapPress}
      >
        {showUserLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
          >
            <View style={styles.userMarkerContainer}>
              <View style={styles.userMarkerOuter}>
                <View style={styles.userMarkerInner} />
              </View>
            </View>
          </Marker>
        )}

        {showRadius && (
          <Circle
            center={userLocation}
            radius={radiusKm * 1000}
            fillColor="rgba(91, 95, 255, 0.1)"
            strokeColor="rgba(91, 95, 255, 0.3)"
            strokeWidth={2}
          />
        )}

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.title}
            description={marker.description}
            onPress={() => {
              marker.onPress?.(marker);
              onMarkerPress?.(marker);
            }}
          >
            {renderCustomMarker(marker)}
            <Callout>
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

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fabButton} onPress={centerOnUser}>
          <MaterialIcons name="my-location" size={22} color="#5B5FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: markerColors.doctor }]} />
          <Text style={styles.legendText}>Doctors</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: markerColors.nurse }]} />
          <Text style={styles.legendText}>Nurses</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: markerColors.ambulance }]} />
          <Text style={styles.legendText}>Ambulances</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#5B5FFF',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#fff',
  },
  markerIcon: {
    fontSize: 20,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(91, 95, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5B5FFF',
    borderWidth: 2,
    borderColor: '#fff',
  },
  calloutContainer: {
    padding: 8,
    minWidth: 120,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#666',
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
});

export default GoogleMap;

