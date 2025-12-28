import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/theme';
import LocationDisplay from '../../components/LocationDisplay';
import useLocation from '../../hooks/useLocation';
import { emergencyAPI, usersAPI } from '../../utils/api';

export default function WebLocationScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [showDetails, setShowDetails] = useState(false);
  const [emergencyStatus, setEmergencyStatus] = useState<any>(null);
  const [nearby, setNearby] = useState<any>({
    ambulances: [],
    nurses: [],
    doctors: [],
  });
  const [loadingNearby, setLoadingNearby] = useState(false);

  const { location, loading, error } = useLocation({
    enableWatch: true,
    highAccuracy: true,
  });

  // Fetch nearby services when location changes
  useEffect(() => {
    if (location && !emergencyStatus) {
      fetchNearbyServices();
    }
  }, [location]);

  const fetchNearbyServices = async () => {
    if (!location) return;

    try {
      setLoadingNearby(true);
      const [ambulances, nurses, doctors] = await Promise.all([
        usersAPI.getNearbyAmbulances(location.latitude, location.longitude, 10),
        usersAPI.getNearbyProfessionals('nurse', location.latitude, location.longitude, 10),
        usersAPI.getNearbyProfessionals('doctor', location.latitude, location.longitude, 10),
      ]);

      setNearby({
        ambulances: ambulances.data?.slice(0, 3) || [],
        nurses: nurses.data?.slice(0, 3) || [],
        doctors: doctors.data?.slice(0, 3) || [],
      });
    } catch (err) {
      console.error('Error fetching nearby services:', err);
    } finally {
      setLoadingNearby(false);
    }
  };

  const handleTriggerEmergency = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    try {
      const result = await emergencyAPI.triggerEmergency({
        latitude: location.latitude,
        longitude: location.longitude,
        description: 'Web-based SOS Emergency',
        severity: 'critical',
      });

      setEmergencyStatus(result.data.emergency);

      // Navigate to tracking
      setTimeout(() => {
        router.push({
          pathname: '/emergency/tracking',
          params: {
            emergencyId: result.data.emergency._id,
            isSOS: 'true',
            fromWeb: 'true',
          },
        });
      }, 1000);
    } catch (err) {
      Alert.alert('Error', 'Failed to trigger emergency');
      console.error('Emergency trigger error:', err);
    }
  };

  const handleCancelEmergency = async () => {
    if (!emergencyStatus) return;

    try {
      await emergencyAPI.updateEmergencyStatus(emergencyStatus._id, 'cancelled');
      setEmergencyStatus(null);
      Alert.alert('Success', 'Emergency cancelled');
    } catch (err) {
      Alert.alert('Error', 'Failed to cancel emergency');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <AntDesign name="arrowleft" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Web Location Service</Text>
            <Text style={styles.headerSubtitle}>Real-time location tracking</Text>
          </View>
        </LinearGradient>

        {/* Quick Status Card */}
        <View style={[styles.quickStatusCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.statusIndicator}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : error ? (
              <MaterialIcons name="error" size={24} color="#EF4444" />
            ) : (
              <MaterialIcons name="check-circle" size={24} color="#10B981" />
            )}
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusLabel, { color: colors.text }]}>
              {loading ? 'Locating...' : error ? 'Error' : 'Location Active'}
            </Text>
            {location && (
              <Text style={[styles.statusCoords, { color: colors.icon }]}>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            )}
          </View>
        </View>

        {/* Location Display Component */}
        <View style={{ marginVertical: 12 }}>
          <LocationDisplay
            onLocationChange={(loc) => {
              // Location updated
            }}
            enableWatch={true}
            showAccuracy={true}
          />
        </View>

        {/* Emergency Actions */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Emergency Actions
          </Text>

          {!emergencyStatus ? (
            <TouchableOpacity
              onPress={handleTriggerEmergency}
              disabled={loading || !location}
              style={[
                styles.emergencyButton,
                (loading || !location) && { opacity: 0.5 },
              ]}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emergencyGradient}>
                <MaterialIcons name="emergency" size={24} color="#FFF" />
                <Text style={styles.emergencyButtonText}>Trigger SOS Emergency</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <>
              <View
                style={[
                  styles.emergencyActiveCard,
                  { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
                ]}>
                <MaterialIcons name="info" size={20} color="#DC2626" />
                <Text style={styles.emergencyActiveText}>
                  Emergency is active. Help is on the way.
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCancelEmergency}
                style={[styles.cancelButton, { backgroundColor: colors.secondary }]}>
                <Text style={styles.cancelButtonText}>Cancel Emergency</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Nearby Services */}
        <View style={[styles.section, { marginBottom: 24 }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Nearby Services
            </Text>
            {loadingNearby && <ActivityIndicator size="small" color={colors.primary} />}
          </View>

          {/* Ambulances */}
          {nearby.ambulances.length > 0 && (
            <View style={styles.serviceCategory}>
              <Text style={[styles.categoryTitle, { color: colors.text }]}>
                🚑 Ambulances
              </Text>
              {nearby.ambulances.map((ambulance: any) => (
                <View
                  key={ambulance._id}
                  style={[
                    styles.serviceCard,
                    { backgroundColor: colors.cardBackground, borderLeftColor: '#F97316' },
                  ]}>
                  <View>
                    <Text style={[styles.serviceName, { color: colors.text }]}>
                      {ambulance.name}
                    </Text>
                    <Text style={[styles.serviceInfo, { color: colors.icon }]}>
                      {ambulance.phone}
                    </Text>
                    {ambulance.vehicleNumber && (
                      <Text style={[styles.serviceInfo, { color: colors.icon }]}>
                        {ambulance.vehicleNumber}
                      </Text>
                    )}
                  </View>
                  {ambulance.distance && (
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceText}>
                        {ambulance.distance.toFixed(1)}km
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Nurses */}
          {nearby.nurses.length > 0 && (
            <View style={styles.serviceCategory}>
              <Text style={[styles.categoryTitle, { color: colors.text }]}>
                👩‍⚕️ Nurses
              </Text>
              {nearby.nurses.map((nurse: any) => (
                <View
                  key={nurse._id}
                  style={[
                    styles.serviceCard,
                    { backgroundColor: colors.cardBackground, borderLeftColor: '#8B5CF6' },
                  ]}>
                  <View>
                    <Text style={[styles.serviceName, { color: colors.text }]}>
                      {nurse.name}
                    </Text>
                    <Text style={[styles.serviceInfo, { color: colors.icon }]}>
                      {nurse.phone}
                    </Text>
                    {nurse.specialization && (
                      <Text style={[styles.serviceInfo, { color: colors.icon }]}>
                        {nurse.specialization}
                      </Text>
                    )}
                  </View>
                  {nurse.distance && (
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceText}>
                        {nurse.distance.toFixed(1)}km
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Doctors */}
          {nearby.doctors.length > 0 && (
            <View style={styles.serviceCategory}>
              <Text style={[styles.categoryTitle, { color: colors.text }]}>
                👨‍⚕️ Doctors
              </Text>
              {nearby.doctors.map((doctor: any) => (
                <View
                  key={doctor._id}
                  style={[
                    styles.serviceCard,
                    { backgroundColor: colors.cardBackground, borderLeftColor: '#3B82F6' },
                  ]}>
                  <View>
                    <Text style={[styles.serviceName, { color: colors.text }]}>
                      {doctor.name}
                    </Text>
                    <Text style={[styles.serviceInfo, { color: colors.icon }]}>
                      {doctor.phone}
                    </Text>
                    {doctor.specialization && (
                      <Text style={[styles.serviceInfo, { color: colors.icon }]}>
                        {doctor.specialization}
                      </Text>
                    )}
                  </View>
                  {doctor.distance && (
                    <View style={styles.distanceBadge}>
                      <Text style={styles.distanceText}>
                        {doctor.distance.toFixed(1)}km
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {!loadingNearby && Object.values(nearby).every((arr: any) => arr.length === 0) && (
            <View
              style={[
                styles.emptyState,
                { backgroundColor: colors.primary + '15' },
              ]}>
              <MaterialIcons
                name="location-on"
                size={32}
                color={colors.primary}
              />
              <Text style={[styles.emptyStateText, { color: colors.text }]}>
                No nearby services found
              </Text>
              <TouchableOpacity onPress={fetchNearbyServices}>
                <Text style={[styles.retryText, { color: colors.primary }]}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Info Box */}
        <View
          style={[
            styles.infoBox,
            { backgroundColor: colors.primary + '15', borderColor: colors.primary },
          ]}>
          <MaterialIcons name="info" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            This web interface uses the Geolocation API to track your location in real-time
            and connect you with nearby emergency services. Your location is secure and only
            shared when you explicitly trigger an emergency.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  quickStatusCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusCoords: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emergencyButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  emergencyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emergencyActiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  emergencyActiveText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 13,
    flex: 1,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  serviceCategory: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  serviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceInfo: {
    fontSize: 12,
    marginBottom: 2,
  },
  distanceBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  distanceText: {
    color: '#1D4ED8',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 8,
  },
  retryText: {
    marginTop: 8,
    fontWeight: '600',
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
