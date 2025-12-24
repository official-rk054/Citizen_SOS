import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  Image,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { emergencyAPI, usersAPI, appointmentsAPI } from '../../utils/api';
import io from 'socket.io-client';
import { MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import GoogleMap from '../../components/GoogleMap';
import ModernButton from '../../components/ModernButton';
import ResponsiveCard from '../../components/ResponsiveCard';

const SOCKET_URL = 'http://localhost:5000';
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, updateLocation } = useAuth();
  const [location, setLocation] = useState<any>(null);
  const [loadingEmergency, setLoadingEmergency] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [nearbyData, setNearbyData] = useState<{
    doctors: Array<{ id: string; name: string; distance?: number; [key: string]: any }> ;
    nurses: Array<{ id: string; name: string; distance?: number; [key: string]: any }>;
    ambulances: Array<{ id: string; name: string; distance?: number; [key: string]: any }>;
    volunteers: Array<{ id: string; name: string; distance?: number; [key: string]: any }>;
  }>({
    doctors: [],
    nurses: [],
    ambulances: [],
    volunteers: [],
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Array<any>>([]);
  const socketRef = useRef<any>(null);

  // SOS Animation Refs
  const sosScaleAnim = useRef(new Animated.Value(1)).current;
  const sosPulseAnim = useRef(new Animated.Value(1)).current;
  const sosRipple1Anim = useRef(new Animated.Value(0)).current;
  const sosRipple2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeLocation();
    if (user?.id) {
      fetchNearbyServices();
      fetchUpcomingAppointments();
    }

    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user?.id]);

  // SOS Pulse animation
  useEffect(() => {
    if (sosActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(sosPulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(sosPulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [sosActive]);

  const initializeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(loc.coords);
      if (user?.id) {
        await updateLocation(loc.coords.latitude, loc.coords.longitude);
      }

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 50,
        },
        (newLocation) => {
          setLocation(newLocation.coords);
          if (user?.id) {
            updateLocation(newLocation.coords.latitude, newLocation.coords.longitude);
          }
        }
      );
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const fetchNearbyServices = async () => {
    if (!location) return;

    try {
      const [doctors, nurses, ambulances, volunteers] = await Promise.all([
        usersAPI.getNearbyProfessionals('doctor', location.latitude, location.longitude, 10),
        usersAPI.getNearbyProfessionals('nurse', location.latitude, location.longitude, 10),
        usersAPI.getNearbyAmbulances(location.latitude, location.longitude, 10),
        usersAPI.getNearbyVolunteers?.(location.latitude, location.longitude, 10)
          .catch(() => ({ data: [] })),
      ]);

      setNearbyData({
        doctors: doctors.data?.slice(0, 3) || [],
        nurses: nurses.data?.slice(0, 3) || [],
        ambulances: ambulances.data?.slice(0, 3) || [],
        volunteers: volunteers.data?.slice(0, 2) || [],
      });
    } catch (error) {
      console.error('Error fetching nearby services:', error);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      if (user?.id) {
        const response = await appointmentsAPI.getUpcomingAppointments(user.id);
        setUpcomingAppointments(response.data?.slice(0, 2) || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const triggerSOSAnimation = () => {
    // Scale animation
    Animated.sequence([
      Animated.timing(sosScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sosScaleAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sosScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Ripple animations
    Animated.parallel([
      Animated.sequence([
        Animated.timing(sosRipple1Anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(sosRipple2Anim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      sosRipple1Anim.setValue(0);
      sosRipple2Anim.setValue(0);
    });
  };

  const handleSOS = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available. Please enable location services.');
      return;
    }

    setLoadingEmergency(true);
    setSosActive(true);
    triggerSOSAnimation();

    try {
      const emergencyContacts = user?.emergencyContacts || [];
      const response = await emergencyAPI.triggerEmergency({
        latitude: location.latitude,
        longitude: location.longitude,
        description: 'SOS Emergency - Immediate assistance needed',
        emergencyContactId: emergencyContacts?.[0]?.id,
        severity: 'critical',
      });

      // Notify emergency contacts
      socketRef.current?.emit('emergency-alert', {
        victimId: user?.id,
        victimName: user?.name,
        latitude: location.latitude,
        longitude: location.longitude,
        emergencyContactPhone: emergencyContacts?.[0]?.phone,
        timestamp: new Date(),
        liveTracking: true,
      });

      // Notify volunteers and nearby professionals
      socketRef.current?.emit('volunteer-alert', {
        victimId: user?.id,
        victimName: user?.name,
        latitude: location.latitude,
        longitude: location.longitude,
        severity: 'critical',
      });

      // Fetch nearby responders
      await fetchNearbyServices();

      // Navigate to emergency tracking with nearby options
      router.push({
        pathname: '/emergency/tracking',
        params: {
          emergencyId: response.data.emergency._id,
          showNearby: 'true',
          isSOS: 'true',
        },
      });
    } catch (error) {
      console.error('SOS Error:', error);
      Alert.alert('Error', 'Failed to trigger SOS. Please try again.');
      setSosActive(false);
    } finally {
      setLoadingEmergency(false);
    }
  };

  const RippleComponent = ({ animatedValue }: any) => {
    const rippleOpacity = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 0],
    });

    const rippleScale = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 3],
    });

    return (
      <Animated.View
        style={[
          styles.ripple,
          {
            opacity: rippleOpacity,
            transform: [{ scale: rippleScale }],
          },
        ]}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <MaterialIcons name="person" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* SOS Button Section */}
        <View style={styles.sosContainer}>
          <View style={styles.sosBackground}>
            <RippleComponent animatedValue={sosRipple1Anim} />
            <RippleComponent animatedValue={sosRipple2Anim} />

            <Animated.View
              style={[
                styles.sosButton,
                {
                  transform: [{ scale: sosScaleAnim }, { scale: sosPulseAnim }],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSOS}
                disabled={loadingEmergency}
              >
                {loadingEmergency ? (
                  <ActivityIndicator
                    color="#fff"
                    size="large"
                    style={styles.sosLoading}
                  />
                ) : (
                  <>
                    <Text style={styles.sosIcon}>🆘</Text>
                    <Text style={styles.sosText}>SOS</Text>
                    {sosActive && (
                      <Text style={styles.sosStatus}>Emergency Active</Text>
                    )}
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={styles.sosInfo}>
            <Text style={styles.sosInfoText}>
              Press and hold SOS button for immediate emergency response
            </Text>
            <Text style={styles.sosInfoSubText}>
              Ambulance, doctors, and emergency contacts will be notified with your live location
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#EEF2FF' }]}
              onPress={() => router.push('/appointments/book')}
            >
              <MaterialIcons name="calendar-today" size={32} color="#5B5FFF" />
              <Text style={styles.actionButtonLabel}>Book</Text>
              <Text style={styles.actionButtonSub}>Appointment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#FFE5E5' }]}
              onPress={() => router.push('/ambulance/book')}
            >
              <MaterialIcons name="local-hospital" size={32} color="#FF6B6B" />
              <Text style={styles.actionButtonLabel}>Book</Text>
              <Text style={styles.actionButtonSub}>Ambulance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#E5F5E5' }]}
              onPress={() => router.push('/nearby')}
            >
              <MaterialIcons name="location-on" size={32} color="#4CAF50" />
              <Text style={styles.actionButtonLabel}>Find</Text>
              <Text style={styles.actionButtonSub}>Nearby</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Next Appointments</Text>
              <TouchableOpacity onPress={() => router.push('/appointments')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {upcomingAppointments.map((appointment: any, index: number) => (
              <View key={appointment._id || index} style={styles.appointmentCard}>
                <View style={styles.appointmentLeft}>
                  <View style={styles.dateCircle}>
                    <Text style={styles.dateDay}>
                      {new Date(appointment.appointmentDate).getDate()}
                    </Text>
                    <Text style={styles.dateMonth}>
                      {new Date(appointment.appointmentDate).toLocaleString(
                        'default',
                        { month: 'short' }
                      )}
                    </Text>
                  </View>
                  <View style={styles.appointmentInfo}>
                    <Text style={styles.appointmentName}>
                      {appointment.professionalId?.name || 'Professional'}
                    </Text>
                    <Text style={styles.appointmentTime}>{appointment.timeSlot}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.appointmentAction}>
                  <MaterialIcons name="navigate-next" size={24} color="#1976D2" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Nearby Doctors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Doctors</Text>
            <TouchableOpacity onPress={() => router.push('/doctors/map')}>
              <Text style={styles.seeAll}>Map View</Text>
            </TouchableOpacity>
          </View>
          {nearbyData.doctors.length > 0 ? (
            nearbyData.doctors.map((doctor: any, index: number) => (
              <View key={doctor._id || index} style={styles.professionalCard}>
                <View style={styles.professionalAvatar}>
                  <MaterialIcons name="person" size={32} color="#fff" />
                </View>
                <View style={styles.professionalInfo}>
                  <Text style={styles.professionalName}>{doctor.name}</Text>
                  <Text style={styles.professionalSpec}>
                    {doctor.specialization || 'General Practitioner'}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <AntDesign name="star" size={12} color="#FFC107" />
                    <Text style={styles.rating}>4.5</Text>
                    <Text style={styles.distance}>
                      • {(Math.random() * 5).toFixed(1)} km away
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/appointments/book',
                      params: { professionalId: doctor._id },
                    })
                  }
                >
                  <Text style={styles.bookBtnText}>Book</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="location-off" size={48} color="#999" />
              <Text style={styles.emptyStateText}>No doctors nearby</Text>
            </View>
          )}
        </View>

        {/* Nearby Nurses */}
        {nearbyData.nurses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearby Nurses</Text>
            </View>
            {nearbyData.nurses.map((nurse: any, index: number) => (
              <View key={nurse._id || index} style={styles.professionalCard}>
                <View style={[styles.professionalAvatar, { backgroundColor: '#E91E63' }]}>
                  <MaterialIcons name="person" size={32} color="#fff" />
                </View>
                <View style={styles.professionalInfo}>
                  <Text style={styles.professionalName}>{nurse.name}</Text>
                  <Text style={styles.professionalSpec}>Registered Nurse</Text>
                  <View style={styles.ratingContainer}>
                    <AntDesign name="star" size={12} color="#FFC107" />
                    <Text style={styles.rating}>4.7</Text>
                    <Text style={styles.distance}>
                      • {(Math.random() * 5).toFixed(1)} km away
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/appointments/book',
                      params: { professionalId: nurse._id },
                    })
                  }
                >
                  <Text style={styles.bookBtnText}>Book</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Available Ambulances */}
        {nearbyData.ambulances.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Ambulances</Text>
            </View>
            {nearbyData.ambulances.map((ambulance: any, index: number) => (
              <View key={ambulance._id || index} style={styles.professionalCard}>
                <View style={[styles.professionalAvatar, { backgroundColor: '#F44336' }]}>
                  <MaterialIcons name="local-hospital" size={32} color="#fff" />
                </View>
                <View style={styles.professionalInfo}>
                  <Text style={styles.professionalName}>{ambulance.name}</Text>
                  <Text style={styles.professionalSpec}>
                    Emergency Ambulance Service
                  </Text>
                  <View style={styles.ratingContainer}>
                    <AntDesign name="star" size={12} color="#FFC107" />
                    <Text style={styles.rating}>4.8</Text>
                    <Text style={styles.distance}>
                      • {(Math.random() * 5).toFixed(1)} km away
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.bookBtn, { backgroundColor: '#F44336' }]}
                  onPress={() => router.push('/ambulance/book')}
                >
                  <Text style={styles.bookBtnText}>Book</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Health Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Health Tip</Text>
          <View style={styles.healthTipCard}>
            <View style={styles.healthTipIcon}>
              <Text style={styles.healthTipIconText}>💧</Text>
            </View>
            <View style={styles.healthTipContent}>
              <Text style={styles.healthTipTitle}>Stay Hydrated</Text>
              <Text style={styles.healthTipDesc}>
                Drink at least 8 glasses of water daily to maintain good health
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5B5FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#5B5FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  // SOS Styles
  sosContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 24,
  },
  sosBackground: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#E53935',
  },
  sosButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    zIndex: 10,
  },
  sosIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  sosText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sosStatus: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  sosLoading: {
    marginBottom: 4,
  },
  sosInfo: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E53935',
  },
  sosInfoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#C62828',
    marginBottom: 4,
  },
  sosInfoSubText: {
    fontSize: 12,
    color: '#E53935',
    lineHeight: 18,
  },

  // Quick Actions
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionButtonLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
    color: '#1A1A1A',
  },
  actionButtonSub: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },

  // Section Styles
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  seeAll: {
    fontSize: 13,
    color: '#5B5FFF',
    fontWeight: '600',
  },

  // Appointment Card
  appointmentCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appointmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5B5FFF',
  },
  dateMonth: {
    fontSize: 11,
    color: '#5B5FFF',
    fontWeight: '600',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  appointmentTime: {
    fontSize: 12,
    color: '#5B5FFF',
    marginTop: 4,
    fontWeight: '500',
  },
  appointmentAction: {
    padding: 8,
  },

  // Professional Card
  professionalCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  professionalAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#5B5FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  professionalInfo: {
    flex: 1,
  },
  professionalName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  professionalSpec: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  distance: {
    fontSize: 12,
    color: '#999',
    marginLeft: 2,
  },
  bookBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#5B5FFF',
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },

  // Empty State
  emptyState: {
    paddingVertical: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },

  // Health Tip Card
  healthTipCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  healthTipIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  healthTipIconText: {
    fontSize: 32,
  },
  healthTipContent: {
    flex: 1,
  },
  healthTipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  healthTipDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
});
