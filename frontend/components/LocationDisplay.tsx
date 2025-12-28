import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  useColorScheme,
  Platform,
} from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/theme';
import useLocation from '../hooks/useLocation';
import { calculateDistance } from '../utils/locationUtils';

interface LocationDisplayProps {
  onLocationChange?: (location: any) => void;
  showMap?: boolean;
  showAccuracy?: boolean;
  enableWatch?: boolean;
  style?: any;
}

export const LocationDisplay: React.FC<LocationDisplayProps> = ({
  onLocationChange,
  showMap = true,
  showAccuracy = true,
  enableWatch = false,
  style,
}) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const isWeb = Platform.OS === 'web';

  const {
    location,
    loading,
    error,
    accuracy,
    getCurrentLocation,
    requestPermission,
    startWatching,
    retry,
    isLocationSupported,
  } = useLocation({
    enableWatch,
    highAccuracy: true,
  });

  const [address, setAddress] = useState<string>('');
  const [locationHistory, setLocationHistory] = useState<any[]>([]);

  // Update location history and call callback
  useEffect(() => {
    if (location) {
      onLocationChange?.(location);

      // Add to history
      setLocationHistory((prev) => [
        {
          ...location,
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 4), // Keep last 5
      ]);

      // Update address
      if (!address && location.latitude && location.longitude) {
        setAddress(
          `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
        );
      }
    }
  }, [location, onLocationChange]);

  const handleRequestPermission = async () => {
    await requestPermission();
    setTimeout(() => getCurrentLocation(), 500);
  };

  const handleStartWatching = () => {
    startWatching();
  };

  const getAccuracyColor = () => {
    if (!accuracy) return colors.icon;
    if (accuracy < 50) return '#10B981'; // Green
    if (accuracy < 100) return '#3B82F6'; // Blue
    if (accuracy < 500) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const getAccuracyLabel = () => {
    if (!accuracy) return 'Accuracy unknown';
    if (accuracy < 50) return 'High accuracy';
    if (accuracy < 100) return 'Good accuracy';
    if (accuracy < 500) return 'Fair accuracy';
    return 'Low accuracy';
  };

  if (!isLocationSupported()) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.danger }]}>
          Geolocation is not supported on this browser
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }, style]}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <MaterialIcons name="location-on" size={32} color="#FFF" />
        <Text style={styles.headerTitle}>Location Services</Text>
        <Text style={styles.headerSubtitle}>
          {isWeb ? 'Web-based' : 'Native'} Geolocation
        </Text>
      </LinearGradient>

      {/* Status Card */}
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.statusRow}>
          <Text style={[styles.label, { color: colors.text }]}>Status</Text>
          <View style={styles.statusBadge}>
            {loading ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#3B82F6"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.statusText}>Locating...</Text>
              </>
            ) : error ? (
              <>
                <MaterialIcons name="error" size={16} color="#EF4444" />
                <Text style={[styles.statusText, { color: '#EF4444' }]}>Error</Text>
              </>
            ) : (
              <>
                <MaterialIcons name="check-circle" size={16} color="#10B981" />
                <Text style={[styles.statusText, { color: '#10B981' }]}>
                  Active
                </Text>
              </>
            )}
          </View>
        </View>

        {error && (
          <View style={[styles.errorBox, { backgroundColor: '#FEE2E2' }]}>
            <MaterialIcons name="warning" size={16} color="#DC2626" />
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        )}
      </View>

      {/* Location Details */}
      {location && (
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Current Location
          </Text>

          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: colors.text }]}>Latitude</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {location.latitude.toFixed(8)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: colors.text }]}>Longitude</Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {location.longitude.toFixed(8)}
            </Text>
          </View>

          {address && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: colors.text }]}>Address</Text>
              <Text style={[styles.value, { color: colors.text }]}>{address}</Text>
            </View>
          )}

          {showAccuracy && accuracy !== null && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: colors.text }]}>Accuracy</Text>
              <View style={styles.accuracyContainer}>
                <View
                  style={[
                    styles.accuracyDot,
                    { backgroundColor: getAccuracyColor() },
                  ]}
                />
                <Text style={[styles.value, { color: getAccuracyColor() }]}>
                  {accuracy.toFixed(0)}m ({getAccuracyLabel()})
                </Text>
              </View>
            </View>
          )}

          {location.timestamp && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: colors.text }]}>Updated</Text>
              <Text style={[styles.value, { color: colors.icon }]}>
                {new Date(location.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {error && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={retry}>
            <MaterialIcons name="refresh" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        )}

        {!location && !loading && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.secondary }]}
            onPress={handleRequestPermission}>
            <MaterialIcons name="location-searching" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Get Location</Text>
          </TouchableOpacity>
        )}

        {location && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={getCurrentLocation}>
            <MaterialIcons name="my-location" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>
        )}

        {location && (
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: enableWatch ? '#10B981' : colors.danger,
              },
            ]}
            onPress={handleStartWatching}>
            <MaterialIcons
              name={enableWatch ? 'gps-fixed' : 'gps-not-fixed'}
              size={20}
              color="#FFF"
            />
            <Text style={styles.buttonText}>
              {enableWatch ? 'Tracking' : 'Start Tracking'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Google Maps Link */}
      {location && (
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            View on Map
          </Text>
          <TouchableOpacity
            style={[styles.mapLink, { backgroundColor: colors.primary }]}
            onPress={() => {
              const url = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
              window.open(url, '_blank');
            }}>
            <MaterialIcons name="map" size={20} color="#FFF" />
            <Text style={styles.mapLinkText}>
              Open in Google Maps
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Location History */}
      {locationHistory.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Location History
          </Text>
          {locationHistory.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.historyItem,
                index !== locationHistory.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.cardBorder,
                },
              ]}>
              <View style={styles.historyLeft}>
                <Text style={[styles.historyTime, { color: colors.icon }]}>
                  {item.time}
                </Text>
                <Text style={[styles.historyCoords, { color: colors.text }]}>
                  {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                </Text>
                {index > 0 && (
                  <Text style={[styles.distance, { color: colors.icon }]}>
                    ~
                    {calculateDistance(
                      item.latitude,
                      item.longitude,
                      locationHistory[index - 1].latitude,
                      locationHistory[index - 1].longitude
                    ).toFixed(3)}
                    km from previous
                  </Text>
                )}
              </View>
              <View style={styles.historyRight}>
                <AntDesign name="check" size={16} color="#10B981" />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Info */}
      <View
        style={[
          styles.infoBox,
          { backgroundColor: colors.primary + '15', borderColor: colors.primary },
        ]}>
        <MaterialIcons name="info" size={20} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.text }]}>
          {isWeb
            ? 'This app uses the Web Geolocation API to determine your location. Make sure location services are enabled in your browser.'
            : 'Using native geolocation services for accurate location tracking.'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#3B82F6',
  },
  errorBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorMessage: {
    fontSize: 12,
    color: '#DC2626',
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accuracyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  button: {
    flex: 1,
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  mapLinkText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  historyLeft: {
    flex: 1,
  },
  historyRight: {
    marginLeft: 8,
  },
  historyTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyCoords: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  distance: {
    fontSize: 11,
    marginTop: 2,
  },
  infoBox: {
    marginHorizontal: 16,
    marginVertical: 16,
    marginBottom: 24,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
});

export default LocationDisplay;
