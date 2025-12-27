import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import io from 'socket.io-client';
import { MaterialIcons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { emergencyAPI, usersAPI, appointmentsAPI } from '../../utils/api';
import { logSystemInfo } from '../../utils/systemInfo';
import ModernButton from '../../components/ModernButton';
import { AppointmentsList } from '../../components/AppointmentCard';
import { SOSButton } from '../../components/SOSButton';
import { Colors } from '../../constants/theme';

const SOCKET_URL = 'http://localhost:5000';

export default function HomeScreen() {
  const router = useRouter();
  const { user, updateLocation } = useAuth();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [location, setLocation] = useState<any>(null);
  const [, setLoadingEmergency] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nearbyData, setNearbyData] = useState<{
    doctors: Array<{ id: string; name: string; distance?: number; [key: string]: any }>;
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

  const services = [
    {
      id: 'doctor',
      title: 'Doctor',
      subtitle: 'Consult Specialist',
      icon: 'stethoscope',
      color: 'rgba(91,149,255,0.12)',
      accent: colors.primary,
      target: '/appointments/book',
    },
    {
      id: 'nurse',
      title: 'Nurse',
      subtitle: 'Home Care',
      icon: 'account-heart',
      color: 'rgba(16,185,129,0.12)',
      accent: colors.secondary,
      target: '/appointments/nurse/book',
    },
    {
      id: 'ambulance',
      title: 'Ambulance',
      subtitle: 'Emergency 24/7',
      icon: 'ambulance',
      color: 'rgba(244,67,54,0.12)',
      accent: '#F44336',
      target: '/ambulance/book',
    },
    {
      id: 'bookings',
      title: 'Bookings',
      subtitle: 'History & Status',
      icon: 'calendar-month',
      color: 'rgba(111,66,193,0.12)',
      accent: '#6F42C1',
      target: '/appointments',
    },
  ];

  useEffect(() => {
    logSystemInfo();
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
        (newLocation: any) => {
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
    if (!location) {
      const fallbackLocation = { latitude: 28.7041, longitude: 77.1025 };
      setLocation(fallbackLocation);
      return;
    }

    try {
      const [doctors, nurses, ambulances, volunteers] = await Promise.all([
        usersAPI.getNearbyProfessionals('doctor', location.latitude, location.longitude, 10),
        usersAPI.getNearbyProfessionals('nurse', location.latitude, location.longitude, 10),
        usersAPI.getNearbyAmbulances(location.latitude, location.longitude, 10),
        usersAPI.getNearbyVolunteers(location.latitude, location.longitude, 10).catch(() => ({ data: [] })),
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

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchNearbyServices(),
      fetchUpcomingAppointments(),
    ]);
    setRefreshing(false);
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

  const handleSOS = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available. Please enable location services.');
      return;
    }

    setLoadingEmergency(true);
    setSosActive(true);

    try {
      const emergencyContacts = user?.emergencyContacts || [];
      const response = await emergencyAPI.triggerEmergency({
        latitude: location.latitude,
        longitude: location.longitude,
        description: 'SOS Emergency - Immediate assistance needed',
        emergencyContactId: emergencyContacts?.[0]?.id,
        severity: 'critical',
      });

      socketRef.current?.emit('emergency-alert', {
        victimId: user?.id,
        victimName: user?.name,
        latitude: location.latitude,
        longitude: location.longitude,
        emergencyContactPhone: emergencyContacts?.[0]?.phone,
        timestamp: new Date(),
        liveTracking: true,
      });

      socketRef.current?.emit('volunteer-alert', {
        victimId: user?.id,
        victimName: user?.name,
        latitude: location.latitude,
        longitude: location.longitude,
        severity: 'critical',
      });

      await fetchNearbyServices();

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.icon }]}>Hello,</Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.name || 'New'}
            </Text>
            <Text style={[styles.subGreeting, { color: colors.icon }]}>How are you feeling today?</Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { borderColor: colors.cardBorder }]}
            onPress={() => router.push('/profile')}
            activeOpacity={0.85}
          >
            <Text style={[styles.profileInitial, { color: colors.text }]}>{(user?.name || 'N').charAt(0)}</Text>
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Early Protection</Text>
          </View>
          <Text style={styles.heroTitle}>Health Checkup</Text>
          <Text style={styles.heroSubtitle}>
            Regular checkups can help identify issues before they become serious.
          </Text>
          <ModernButton
            title="Book Now"
            onPress={() => router.push('/appointments/book')}
            variant="secondary"
            size="large"
            style={styles.heroButton}
            fullWidth
          />
        </LinearGradient>

        <View style={styles.servicesSection}>
          <Text style={[styles.servicesTitle, { color: colors.text }]}>Our Services</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceCard, { backgroundColor: colors.background, shadowColor: service.accent }]}
                activeOpacity={0.85}
                onPress={() => router.push(service.target)}
              >
                <View style={[styles.serviceIconWrap, { backgroundColor: service.color }]}>
                  <MaterialCommunityIcons name={service.icon as any} size={28} color={service.accent} />
                </View>
                <Text style={[styles.serviceTitle, { color: colors.text }]}>{service.title}</Text>
                <Text style={[styles.serviceSubtitle, { color: colors.icon }]}>{service.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.quickRow}>
          {[
            { id: 'appointments', label: 'Appointments', icon: 'calendar-check', target: '/appointments' },
            { id: 'emergency', label: 'Emergency', icon: 'shield-alert', target: '/emergency/tracking' },
            { id: 'map', label: 'Nearby', icon: 'map-search', target: '/doctors/map' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.quickPill, { borderColor: colors.cardBorder, backgroundColor: colors.cardBackground }]}
              onPress={() => router.push(item.target)}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons name={item.icon as any} size={18} color={colors.primary} />
              <Text style={[styles.quickPillText, { color: colors.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sosContainer}>
          <Text style={[styles.sosTitle, { color: colors.text }]}>Emergency SOS</Text>
          <Text style={[styles.sosSubtitle, { color: colors.icon }]}>Press and hold for immediate help</Text>
          <SOSButton
            isActive={sosActive}
            onPress={handleSOS}
            onCancel={() => {
              setSosActive(false);
              socketRef.current?.emit('emergency-cancel', { victimId: user?.id });
            }}
            colors={{ light: colors }}
          />
        </View>

        {upcomingAppointments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Appointments</Text>
              <TouchableOpacity onPress={() => router.push('/appointments')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {upcomingAppointments.length > 0 && (
          <AppointmentsList
            appointments={upcomingAppointments.map((apt: any, index: number) => ({
              id: apt._id,
              doctorName: apt.professionalId?.name || 'Professional',
              specialty: apt.professionalId?.specialization || 'General Practitioner',
              time: apt.timeSlot,
              date: new Date(apt.appointmentDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }),
              status: 'upcoming' as const,
              colors: { light: colors },
              index: index,
            }))}
            colors={{ light: colors }}
            onAppointmentPress={() => {
              router.push(`/appointments`);
            }}
          />
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>👨‍⚕️ Nearby Doctors</Text>
            <TouchableOpacity onPress={() => router.push('/doctors/map')}>
              <View style={styles.mapViewButton}>
                <MaterialIcons name="map" size={16} color={colors.primary} />
                <Text style={[styles.seeAll, { color: colors.primary }]}>Map View</Text>
              </View>
            </TouchableOpacity>
          </View>
          {nearbyData.doctors.length > 0 ? (
            nearbyData.doctors.map((doctor: any, index: number) => (
              <View
                key={doctor._id || index}
                style={[styles.professionalCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}
              >
                <View style={[styles.professionalAvatar, { backgroundColor: colors.primary }]}>
                  <MaterialIcons name="person" size={32} color="#fff" />
                </View>
                <View style={styles.professionalInfo}>
                  <Text style={[styles.professionalName, { color: colors.text }]}>{doctor.name}</Text>
                  <Text style={[styles.professionalSpec, { color: colors.icon }]}>
                    {doctor.specialization || 'General Practitioner'}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <AntDesign name="star" size={12} color="#FFC107" />
                    <Text style={[styles.rating, { color: colors.text }]}>4.5</Text>
                    <Text style={[styles.distance, { color: colors.icon }]}>
                      • {(Math.random() * 5).toFixed(1)} km away
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.bookBtn, { backgroundColor: colors.primary }]}
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
              <MaterialIcons name="location-off" size={48} color={colors.icon} />
              <Text style={[styles.emptyStateText, { color: colors.text }]}>No doctors found nearby</Text>
              <TouchableOpacity
                style={[styles.refreshButton, { backgroundColor: colors.primary }]}
                onPress={fetchNearbyServices}
              >
                <MaterialIcons name="refresh" size={16} color="#fff" />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {nearbyData.nurses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>👩‍⚕️ Nearby Nurses</Text>
            </View>
            {nearbyData.nurses.map((nurse: any, index: number) => (
              <View
                key={nurse._id || index}
                style={[styles.professionalCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}
              >
                <View style={[styles.professionalAvatar, { backgroundColor: colors.danger }]}>
                  <MaterialIcons name="person" size={32} color="#fff" />
                </View>
                <View style={styles.professionalInfo}>
                  <Text style={[styles.professionalName, { color: colors.text }]}>{nurse.name}</Text>
                  <Text style={[styles.professionalSpec, { color: colors.icon }]}>Registered Nurse</Text>
                  <View style={styles.ratingContainer}>
                    <AntDesign name="star" size={12} color="#FFC107" />
                    <Text style={[styles.rating, { color: colors.text }]}>4.7</Text>
                    <Text style={[styles.distance, { color: colors.icon }]}>
                      • {(Math.random() * 5).toFixed(1)} km away
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.bookBtn, { backgroundColor: colors.danger }]}
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

        {nearbyData.ambulances.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>🚑 Available Ambulances</Text>
            </View>
            {nearbyData.ambulances.map((ambulance: any, index: number) => (
              <View
                key={ambulance._id || index}
                style={[styles.professionalCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}
              >
                <View style={[styles.professionalAvatar, { backgroundColor: '#F44336' }]}>
                  <MaterialIcons name="local-hospital" size={32} color="#fff" />
                </View>
                <View style={styles.professionalInfo}>
                  <Text style={[styles.professionalName, { color: colors.text }]}>{ambulance.name}</Text>
                  <Text style={[styles.professionalSpec, { color: colors.icon }]}>Emergency Ambulance Service</Text>
                  <View style={styles.ratingContainer}>
                    <AntDesign name="star" size={12} color="#FFC107" />
                    <Text style={[styles.rating, { color: colors.text }]}>4.8</Text>
                    <Text style={[styles.distance, { color: colors.icon }]}>
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

        {nearbyData.volunteers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>🤝 Nearby Volunteers</Text>
            </View>
            {nearbyData.volunteers.map((volunteer: any, index: number) => (
              <View
                key={volunteer._id || index}
                style={[styles.professionalCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}
              >
                <View style={[styles.professionalAvatar, { backgroundColor: '#8B5CF6' }]}>
                  <MaterialIcons name="person-outline" size={32} color="#fff" />
                </View>
                <View style={styles.professionalInfo}>
                  <Text style={[styles.professionalName, { color: colors.text }]}>{volunteer.name}</Text>
                  <Text style={[styles.professionalSpec, { color: colors.icon }]}>Volunteer First Responder</Text>
                  <View style={styles.ratingContainer}>
                    <AntDesign name="star" size={12} color="#FFC107" />
                    <Text style={[styles.rating, { color: colors.text }]}>4.5</Text>
                    <Text style={[styles.distance, { color: colors.icon }]}>
                      • {(volunteer.distance || Math.random() * 8).toFixed(1)} km away
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.bookBtn, { backgroundColor: '#8B5CF6' }]}
                  onPress={() => Alert.alert('Volunteer', `Contacting ${volunteer.name}...`)}
                >
                  <Text style={styles.bookBtnText}>Contact</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Health Tip</Text>
          <View style={[styles.healthTipCard, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}>
            <View style={styles.healthTipIcon}>
              <Text style={styles.healthTipIconText}>💧</Text>
            </View>
            <View style={styles.healthTipContent}>
              <Text style={[styles.healthTipTitle, { color: colors.text }]}>Stay Hydrated</Text>
              <Text style={[styles.healthTipDesc, { color: colors.icon }]}>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 22,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '400',
  },
  userName: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 4,
  },
  subGreeting: {
    fontSize: 14,
    marginTop: 6,
  },
  profileButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '700',
  },
  heroCard: {
    marginHorizontal: 18,
    marginTop: 8,
    padding: 20,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  heroButton: {
    backgroundColor: '#fff',
    borderWidth: 0,
    paddingVertical: 14,
  },
  servicesSection: {
    paddingHorizontal: 18,
    paddingTop: 22,
  },
  servicesTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  serviceCard: {
    width: '48%',
    borderRadius: 18,
    padding: 16,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  serviceIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 18,
    marginBottom: 6,
    gap: 10,
  },
  quickPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    gap: 8,
  },
  quickPillText: {
    fontSize: 14,
    fontWeight: '700',
  },
  sosContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  sosTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sosSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
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
    fontSize: 19,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  mapViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  professionalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  professionalAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  professionalInfo: {
    flex: 1,
  },
  professionalName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  professionalSpec: {
    fontSize: 13,
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
    marginLeft: 4,
  },
  distance: {
    fontSize: 12,
    marginLeft: 2,
  },
  bookBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyState: {
    paddingVertical: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  healthTipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  healthTipIcon: {
    marginRight: 12,
  },
  healthTipIconText: {
    fontSize: 32,
  },
  healthTipContent: {
    flex: 1,
  },
  healthTipTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  healthTipDesc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
});
