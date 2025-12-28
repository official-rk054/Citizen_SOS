import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { GoogleMap as WebGoogleMap, Marker, Circle, useJsApiLoader } from '@react-google-maps/api';

const { height } = Dimensions.get('window');

interface Coordinates {
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

interface Props {
  initialLocation?: Coordinates;
  markers: MapMarker[];
  showUserLocation?: boolean;
  onMarkerPress?: (marker: MapMarker) => void;
  mapHeight?: number;
  style?: object;
  showRadius?: boolean;
  radiusKm?: number;
}

const markerColor = (marker: MapMarker) => marker.color || '#5B5FFF';

const GoogleMapWeb: React.FC<Props> = ({
  initialLocation,
  markers,
  showUserLocation = true,
  onMarkerPress,
  mapHeight = height * 0.6,
  style,
  showRadius = false,
  radiusKm = 2,
}) => {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(initialLocation || null);
  const [loading, setLoading] = useState(!initialLocation);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyC8u6hmkl_JC4p4vV_WaDdpDjwag2gQSFM';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places'],
    id: 'google-maps-script',
  });

  const fallbackCenter: Coordinates = initialLocation || { latitude: 28.6139, longitude: 77.2090 };

  useEffect(() => {
    if (!initialLocation) {
      requestLocationPermission();
    }
  }, [initialLocation]);

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        Alert.alert('Permission Denied', 'Location permission is required to use maps');
        setUserLocation(fallbackCenter);
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      setPermissionDenied(false);
    } catch (error) {
      console.error('Location error:', error);
      setUserLocation(fallbackCenter);
    } finally {
      setLoading(false);
    }
  };

  const mapCenter = userLocation || fallbackCenter;
  const mapContainerStyle = useMemo(() => ({ width: '100%', height: mapHeight }), [mapHeight]);
  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    }),
    []
  );

  const handleMarkerPress = (marker: MapMarker) => {
    onMarkerPress?.(marker);
    marker.onPress?.(marker);
  };

  const getWebMarkerIcon = (type?: MapMarker['type']) => {
    if (!(window as any).google || !(window as any).google.maps) return undefined;
    const colors: Record<string, string> = {
      doctor: '#5B5FFF',
      nurse: '#FF6B6B',
      ambulance: '#2EC4B6',
      user: '#5B5FFF',
      emergency: '#FF3B30',
    };
    const fillColor = (type && colors[type]) || '#5B5FFF';
    return {
      path: (window as any).google.maps.SymbolPath.CIRCLE,
      scale: 7,
      fillColor,
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 2,
    } as any;
  };

  if (loading || !isLoaded) {
    return (
      <View style={[styles.container, { height: mapHeight }, style]}>
        <ActivityIndicator size="large" color="#5B5FFF" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[styles.container, { height: mapHeight }, style]}>
        <Text style={styles.errorText}>Failed to load Google Maps</Text>
        <TouchableOpacity style={styles.controlButton} onPress={requestLocationPermission}>
          <MaterialIcons name="refresh" size={20} color="#5B5FFF" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.mapContainer, { height: mapHeight }, style]}>
      <WebGoogleMap
        center={{ lat: mapCenter.latitude, lng: mapCenter.longitude }}
        zoom={14}
        options={mapOptions}
        mapContainerStyle={mapContainerStyle}
      >
        {showUserLocation && userLocation && (
          <Marker
            position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
            title={'Your Location'}
          />
        )}

        {showRadius && userLocation && (
          <Circle
            center={{ lat: userLocation.latitude, lng: userLocation.longitude }}
            radius={radiusKm * 1000}
            options={{
              fillColor: 'rgba(91, 95, 255, 0.1)',
              strokeColor: 'rgba(91, 95, 255, 0.3)',
              strokeWeight: 2,
            }}
          />
        )}

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={{ lat: marker.latitude, lng: marker.longitude }}
            title={marker.title}
            onClick={() => handleMarkerPress(marker)}
            icon={getWebMarkerIcon(marker.type)}
          />
        ))}
      </WebGoogleMap>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={requestLocationPermission}>
          <MaterialIcons name="my-location" size={24} color="#5B5FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GoogleMapWeb;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    gap: 12,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
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
