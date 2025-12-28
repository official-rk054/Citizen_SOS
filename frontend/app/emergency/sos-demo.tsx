import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Vibration,
  useColorScheme,
  Share,
  Linking,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, AntDesign, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import GoogleMap from '../../components/GoogleMap';
import { Colors } from '../../constants/theme';
import {
  triggerSOS,
  getNearbyResponders,
  simulateLiveTracking,
  formatDistance,
  EmergencyResponder,
} from '../../utils/emergencyService';
import { getGoogleMapsURL, estimateETA } from '../../utils/locationUtils';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

interface SOSState {
  triggered: boolean;
  timestamp?: Date;
  emergency?: any;
  nearestAmbulance?: EmergencyResponder;
  nearestNurse?: EmergencyResponder;
  volunteers?: EmergencyResponder[];
}

interface AmbulanceTracking {
  current: { latitude: number; longitude: number };
  eta: number;
  timestamp?: Date;
}

export default function EmergencyPresentationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { fromHome } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // States
  const [userLocation, setUserLocation] = useState<any>(null);
  const [sosState, setSosState] = useState<SOSState>({
    triggered: false,
  });
  const [ambulanceTracking, setAmbulanceTracking] = useState<AmbulanceTracking | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'ambulance' | 'notifications' | 'actions'>('status');
  const [loading, setLoading] = useState(false);
  const [notificationList, setNotificationList] = useState<any[]>([]);
  const [mapRegion, setMapRegion] = useState<any>(null);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const trackingAnim = useRef(new Animated.Value(0)).current;

  // Effects
  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    if (sosState.triggered) {
      startSOSAnimations();
    }
  }, [sosState.triggered]);

  const initializeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for SOS');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setUserLocation(loc.coords);
      setMapRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const startSOSAnimations = () => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scale animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Tracking animation
    Animated.timing(trackingAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const handleEmergencyTrigger = async () => {
    if (!userLocation) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    setLoading(true);
    try {
      // Show demo notification toast
      addNotification({
        type: 'alert',
        title: '🚨 SOS ACTIVATED 🚨',
        message: 'Emergency signal sent to nearby responders',
        timestamp: new Date(),
      });

      Vibration.vibrate([0, 100, 50, 100, 50, 200]);

      // Trigger SOS
      const result = await triggerSOS(userLocation, user);

      if (result.success) {
        setSosState({
          triggered: true,
          timestamp: new Date(),
          emergency: result.emergency,
          nearestAmbulance: result.nearestAmbulance,
          nearestNurse: result.nearestNurse,
          volunteers: result.volunteers,
        });

        // Add notifications for responders
        if (result.nearestAmbulance) {
          setTimeout(() => {
            addNotification({
              type: 'ambulance',
              title: '🚑 Ambulance Alerted',
              message: `${result.nearestAmbulance?.name} is ${formatDistance(result.nearestAmbulance?.distance || 0)} away`,
              timestamp: new Date(),
              responder: result.nearestAmbulance,
            });
          }, 500);
        }

        if (result.nearestNurse) {
          setTimeout(() => {
            addNotification({
              type: 'nurse',
              title: '👩‍⚕️ Nurse Notified',
              message: `${result.nearestNurse?.name} is responding`,
              timestamp: new Date(),
              responder: result.nearestNurse,
            });
          }, 1000);
        }

        // Simulate location sharing
        setTimeout(() => {
          addNotification({
            type: 'location',
            title: '📍 Location Shared',
            message: 'Live location sent to emergency contacts via SMS',
            timestamp: new Date(),
          });
        }, 1500);

        // Start ambulance tracking simulation
        if (result.nearestAmbulance) {
          simulateAmbulanceTracking(result.nearestAmbulance);
        }
      }
    } catch (error) {
      console.error('Error triggering SOS:', error);
      Alert.alert('Error', 'Failed to trigger emergency. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const simulateAmbulanceTracking = (ambulance: EmergencyResponder) => {
    if (!userLocation) return;

    const tracking = simulateLiveTracking(
      { latitude: ambulance.latitude, longitude: ambulance.longitude },
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      30000 // 30 seconds
    );

    tracking.updateLocation((newLocation) => {
      setAmbulanceTracking({
        current: {
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
        },
        eta: newLocation.eta,
        timestamp: newLocation.timestamp,
      });
    });
  };

  const addNotification = (notification: any) => {
    const id = Date.now();
    const notif = { ...notification, id };
    setNotificationList((prev) => [notif, ...prev]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotificationList((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const handleCancelEmergency = () => {
    Alert.alert('Cancel Emergency', 'Are you sure you want to cancel the emergency alert?', [
      { text: 'No', onPress: () => {} },
      {
        text: 'Yes, Cancel',
        onPress: () => {
          setSosState({ triggered: false });
          setAmbulanceTracking(null);
          setNotificationList([]);
          addNotification({
            type: 'info',
            title: 'Emergency Cancelled',
            message: 'Alert has been cancelled. Responders have been notified.',
            timestamp: new Date(),
          });
        },
      },
    ]);
  };

  const handleShareLocation = async () => {
    if (!userLocation) return;
    const url = getGoogleMapsURL(userLocation.latitude, userLocation.longitude);
    try {
      await Share.share({
        message: `My emergency location: ${url}`,
        url,
        title: 'Emergency Location',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const renderNotification = (notification: any) => {
    const notificationType = notification.type as 'alert' | 'ambulance' | 'nurse' | 'location' | 'info' | string;
    const bgColor = {
      alert: '#EF4444',
      ambulance: '#F97316',
      nurse: '#8B5CF6',
      location: '#3B82F6',
      info: '#10B981',
    }[notificationType] || '#6B7280';

    return (
      <Animated.View
        key={notification.id}
        style={[
          styles.notification,
          {
            backgroundColor: bgColor,
            opacity: fadeAnim,
          },
        ]}>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
        </View>
        <Text style={styles.notificationTime}>
          {notification.timestamp.toLocaleTimeString()}
        </Text>
      </Animated.View>
    );
  };

  const renderResponderCard = (responder: EmergencyResponder, type: string) => {
    const icons: any = {
      ambulance: '🚑',
      nurse: '👩‍⚕️',
      doctor: '👨‍⚕️',
      volunteer: '🤝',
    };

    return (
      <View style={[styles.responderCard, { borderLeftColor: type === 'ambulance' ? '#F97316' : '#8B5CF6' }]}>
        <View style={styles.responderHeader}>
          <View>
            <Text style={styles.responderIcon}>{icons[type] || '👤'}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.responderName}>{responder.name}</Text>
            <Text style={styles.responderType}>{responder.userType}</Text>
          </View>
          {responder.distance !== undefined && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>{formatDistance(responder.distance)}</Text>
            </View>
          )}
        </View>
        <View style={styles.responderDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="phone" size={16} color="#666" />
            <Text style={styles.detailText}>{responder.phone}</Text>
          </View>
          {responder.vehicleNumber && (
            <View style={styles.detailRow}>
              <MaterialIcons name="directions-car" size={16} color="#666" />
              <Text style={styles.detailText}>{responder.vehicleNumber}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!userLocation) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Initializing location...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.gradientStart }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <AntDesign name="arrowleft" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency SOS</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Status Section */}
        <View style={styles.statusSection}>
          <LinearGradient
            colors={[colors.primary, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusCard}>
            <View style={styles.statusContent}>
              <Animated.View
                style={[
                  styles.statusPulse,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}>
                <View style={styles.pulseInner} />
              </Animated.View>

              <Text style={styles.statusText}>
                {sosState.triggered ? '🚨 EMERGENCY ACTIVE 🚨' : '⚠️ Emergency SOS'}
              </Text>

              {sosState.triggered && sosState.timestamp && (
                <Text style={styles.statusTime}>
                  Triggered at {sosState.timestamp.toLocaleTimeString()}
                </Text>
              )}
            </View>

            {!sosState.triggered && (
              <TouchableOpacity
                onPress={handleEmergencyTrigger}
                disabled={loading}
                style={[
                  styles.triggerButton,
                  loading && styles.triggerButtonDisabled,
                ]}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="phone-emergency" size={32} color="#FFF" />
                    <Text style={styles.triggerButtonText}>TRIGGER SOS</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {sosState.triggered && (
              <TouchableOpacity
                onPress={handleCancelEmergency}
                style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel Emergency</Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>

        {/* Tabs */}
        {sosState.triggered && (
          <View style={styles.tabsContainer}>
            {(['status', 'ambulance', 'notifications', 'actions'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.tab,
                  activeTab === tab && {
                    borderBottomColor: colors.primary,
                    borderBottomWidth: 3,
                  },
                ]}>
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === tab ? colors.primary : colors.icon },
                  ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tab Content */}
        {sosState.triggered && (
          <View style={styles.tabContent}>
            {/* Status Tab */}
            {activeTab === 'status' && (
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Status</Text>

                {sosState.nearestAmbulance && (
                  <View>
                    <Text style={[styles.subsectionTitle, { color: colors.text }]}>
                      Primary Responder
                    </Text>
                    {renderResponderCard(sosState.nearestAmbulance, 'ambulance')}
                  </View>
                )}

                {sosState.nearestNurse && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.subsectionTitle, { color: colors.text }]}>
                      Medical Support
                    </Text>
                    {renderResponderCard(sosState.nearestNurse, 'nurse')}
                  </View>
                )}

                {sosState.volunteers && sosState.volunteers.length > 0 && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.subsectionTitle, { color: colors.text }]}>
                      Nearby Volunteers
                    </Text>
                    {sosState.volunteers.slice(0, 3).map((v, idx) => (
                      <View key={idx} style={{ marginBottom: 8 }}>
                        {renderResponderCard(v, 'volunteer')}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Ambulance Tab */}
            {activeTab === 'ambulance' && (
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Live Tracking</Text>

                {ambulanceTracking && (
                  <View style={styles.trackingCard}>
                    <View style={styles.trackingInfo}>
                      <Text style={styles.trackingLabel}>ETA</Text>
                      <Text style={styles.trackingValue}>{ambulanceTracking.eta} min</Text>
                    </View>
                    <View style={styles.trackingDivider} />
                    <View style={styles.trackingInfo}>
                      <Text style={styles.trackingLabel}>Distance</Text>
                      <Text style={styles.trackingValue}>
                        {formatDistance(
                          Math.sqrt(
                            Math.pow(
                              ambulanceTracking.current.latitude - userLocation.latitude,
                              2
                            ) +
                              Math.pow(
                                ambulanceTracking.current.longitude - userLocation.longitude,
                                2
                              )
                          ) * 111 // Approximate km conversion
                        )}
                      </Text>
                    </View>
                  </View>
                )}

                {mapRegion && (
                  <View style={styles.mapContainer}>
                    <GoogleMap
                      initialRegion={mapRegion}
                      markers={[
                        {
                          id: 'user-location',
                          latitude: userLocation.latitude,
                          longitude: userLocation.longitude,
                          title: 'Your Location',
                          description: 'Emergency location',
                        },
                        ...(ambulanceTracking
                          ? [
                            {
                              id: 'ambulance-location',
                              latitude: ambulanceTracking.current.latitude,
                              longitude: ambulanceTracking.current.longitude,
                              title: 'Ambulance',
                              description: 'Responding ambulance',
                            },
                          ]
                          : []),
                      ]}
                    />
                  </View>
                )}
              </View>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Activity Feed</Text>
                {notificationList.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.icon }]}>
                    No notifications yet
                  </Text>
                ) : (
                  notificationList.map((notif) => renderNotification(notif))
                )}
              </View>
            )}

            {/* Actions Tab */}
            {activeTab === 'actions' && (
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>

                <TouchableOpacity
                  onPress={handleShareLocation}
                  style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                  <MaterialIcons name="share-location" size={24} color="#FFF" />
                  <Text style={styles.actionButtonText}>Share Location</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    userLocation &&
                    Linking.openURL(getGoogleMapsURL(userLocation.latitude, userLocation.longitude))
                  }
                  style={[styles.actionButton, { backgroundColor: colors.secondary }]}>
                  <MaterialIcons name="map" size={24} color="#FFF" />
                  <Text style={styles.actionButtonText}>Open Maps</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCancelEmergency}
                  style={[styles.actionButton, { backgroundColor: colors.danger }]}>
                  <MaterialIcons name="close" size={24} color="#FFF" />
                  <Text style={styles.actionButtonText}>Cancel Emergency</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Info Section */}
        {!sosState.triggered && (
          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>How SOS Works</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoStep}>
                <Text style={styles.stepNumber}>1</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>Trigger Alert</Text>
                  <Text style={[styles.stepDescription, { color: colors.icon }]}>
                    Press the SOS button to send emergency signal
                  </Text>
                </View>
              </View>

              <View style={styles.infoStep}>
                <Text style={styles.stepNumber}>2</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>Share Location</Text>
                  <Text style={[styles.stepDescription, { color: colors.icon }]}>
                    Live location sent via SMS to emergency contacts
                  </Text>
                </View>
              </View>

              <View style={styles.infoStep}>
                <Text style={styles.stepNumber}>3</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>Notify Responders</Text>
                  <Text style={[styles.stepDescription, { color: colors.icon }]}>
                    Nearest ambulance, nurse & volunteers are alerted
                  </Text>
                </View>
              </View>

              <View style={styles.infoStep}>
                <Text style={styles.stepNumber}>4</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>Live Tracking</Text>
                  <Text style={[styles.stepDescription, { color: colors.icon }]}>
                    Track ambulance location in real-time
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Notifications */}
      <View style={styles.notificationsContainer}>
        {notificationList.map((notif) => renderNotification(notif))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  statusSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  statusCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minHeight: 280,
    justifyContent: 'center',
  },
  statusContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusPulse: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pulseInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  statusTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  triggerButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  triggerButtonDisabled: {
    opacity: 0.6,
  },
  triggerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  responderCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    borderLeftWidth: 4,
  },
  responderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  responderIcon: {
    fontSize: 32,
  },
  responderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  responderType: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  distanceBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  distanceText: {
    color: '#1D4ED8',
    fontWeight: '600',
    fontSize: 12,
  },
  responderDetails: {
    marginLeft: 40,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#4B5563',
  },
  trackingCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  trackingInfo: {
    flex: 1,
    alignItems: 'center',
  },
  trackingLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  trackingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  trackingDivider: {
    width: 1,
    backgroundColor: '#D1D5DB',
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  notification: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  notificationMessage: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
  },
  notificationTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
  },
  notificationsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    color: '#FFF',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 12,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
