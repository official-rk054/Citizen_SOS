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
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { emergencyAPI, usersAPI, appointmentsAPI } from '../../utils/api';
import { logSystemInfo } from '../../utils/systemInfo';
import io from 'socket.io-client';
import { MaterialIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import GoogleMap from '../../components/GoogleMap';
import ModernButton from '../../components/ModernButton';
import ResponsiveCard from '../../components/ResponsiveCard';
import { Dashboard, StatCard } from '../../components/Dashboard';
import { QuickActions } from '../../components/QuickActions';
import { AppointmentsList } from '../../components/AppointmentCard';
import { SOSButton } from '../../components/SOSButton';
import { Colors } from '../../constants/theme';

const SOCKET_URL = 'http://localhost:5000';
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, updateLocation } = useAuth();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
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

  useEffect(() => {
    // Log system information on app startup
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

  // SOS Pulse animation
  useEffect(() => {
    if (sosActive) {
      // Animation is now handled by SOSButton component
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
    if (!location) return;

    try {
      const [doctors, nurses, ambulances, volunteers] = await Promise.all([
        usersAPI.getNearbyProfessionals('doctor', location.latitude, location.longitude, 10),
        usersAPI.getNearbyProfessionals('nurse', location.latitude, location.longitude, 10),
        usersAPI.getNearbyAmbulances(location.latitude, location.longitude, 10),
        usersAPI.getNearbyVolunteers(location.latitude, location.longitude, 10)
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
    // Animation is now handled by SOSButton component
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
    return null;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header Section */}
        <View style={[styles.header, { backgroundColor: colors.gradientStart }]}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={[styles.userName, { color: '#FFFFFF' }]}>{user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: colors.secondary }]}
            onPress={() => router.push('/profile')}
          >
            <MaterialIcons name="person" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Dashboard Stats Section */}
        <Dashboard
          stats={[
            {
              icon: 'heart-pulse',
              label: 'Health Score',
              value: '92',
              color: colors.primary,
              accentColor: colors.gradientEnd,
            },
            {
              icon: 'run',
              label: 'Activity',
              value: '7.2k',
              color: colors.secondary,
              accentColor: colors.secondaryGradientEnd,
            },
            {
              icon: 'water-percent',
              label: 'Hydration',
              value: '85%',
              color: colors.accent,
              accentColor: '#FF8555',
            },
            {
              icon: 'sleep',
              label: 'Sleep',
              value: '7.5h',
              color: colors.danger,
              accentColor: '#FF3366',
            },
          ]}
          colors={{ light: colors }}
          onStatPress={(index) => {
            const labels = ['Health', 'Activity', 'Hydration', 'Sleep'];
            Alert.alert(labels[index], `Your ${labels[index].toLowerCase()} metrics`);
          }}
        />

        {/* SOS Emergency Button */}
        <SOSButton
          isActive={sosActive}
          onPress={handleSOS}
          onCancel={() => {
            setSosActive(false);
            socketRef.current?.emit('emergency-cancel', {
              victimId: user?.id,
            });
          }}
          colors={{ light: colors }}
        />

        {/* SOS Demo Button */}
        <View style={styles.sosDemoContainer}>
          <TouchableOpacity
            style={[styles.sosDemoButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/emergency/sos-demo')}>
            <MaterialIcons name="emergency" size={20} color="#fff" />
            <Text style={styles.sosDemoButtonText}>View SOS Demo & Features</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <QuickActions
          actions={[
            {
              id: 'book-appointment',
              icon: 'calendar-plus',
              label: 'Book Appointment',
              color: colors.primary,
              accentColor: colors.gradientEnd,
            },
            {
              id: 'book-ambulance',
              icon: 'ambulance',
              label: 'Book Ambulance',
              color: '#FF5252',
              accentColor: '#FF1744',
            },
            {
              id: 'find-nearby',
              icon: 'map-marker-check',
              label: 'Find Nearby',
              color: colors.secondary,
              accentColor: colors.secondaryGradientEnd,
            },
            {
              id: 'web-location',
              icon: 'location-on',
              label: 'Web Location',
              color: '#06B6D4',
              accentColor: '#0891B2',
            },
            {
              id: 'health-records',
              icon: 'file-document-outline',
              label: 'Health Records',
              color: '#9C27B0',
              accentColor: '#7B1FA2',
            },
          ]}
          colors={{ light: colors }}
          onActionPress={(id) => {
            switch (id) {
              case 'book-appointment':
                router.push('/appointments/book');
                break;
              case 'book-ambulance':
                router.push('/ambulance/book');
                break;
              case 'find-nearby':
                router.push('/nearby');
                break;
              case 'web-location':
                router.push('/nearby/web-location');
                break;
              case 'health-records':
                router.push('/profile');
                break;
            }
          }}
        />

        {/* Appointments Section */}
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
            onAppointmentPress={(id) => {
              router.push(`/appointments`);
            }}
          />
        )}

        {/* Nearby Doctors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nearby Doctors</Text>
            <TouchableOpacity onPress={() => router.push('/doctors/map')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Map View</Text>
            </TouchableOpacity>
          </View>
          {nearbyData.doctors.length > 0 ? (
            nearbyData.doctors.map((doctor: any, index: number) => (
              <View key={doctor._id || index} style={[styles.professionalCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
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
              <Text style={[styles.emptyStateText, { color: colors.text }]}>No doctors nearby</Text>
            </View>
          )}
        </View>

        {/* Nearby Nurses */}
        {nearbyData.nurses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Nearby Nurses</Text>
            </View>
            {nearbyData.nurses.map((nurse: any, index: number) => (
              <View key={nurse._id || index} style={[styles.professionalCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Ambulances</Text>
            </View>
            {nearbyData.ambulances.map((ambulance: any, index: number) => (
              <View key={ambulance._id || index} style={[styles.professionalCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                <View style={[styles.professionalAvatar, { backgroundColor: '#F44336' }]}>
                  <MaterialIcons name="local-hospital" size={32} color="#fff" />
                </View>
                <View style={styles.professionalInfo}>
                  <Text style={[styles.professionalName, { color: colors.text }]}>{ambulance.name}</Text>
                  <Text style={[styles.professionalSpec, { color: colors.icon }]}>
                    Emergency Ambulance Service
                  </Text>
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

        {/* Nearby Volunteers */}
        {nearbyData.volunteers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Nearby Volunteers</Text>
            </View>
            {nearbyData.volunteers.map((volunteer: any, index: number) => (
              <View key={volunteer._id || index} style={[styles.professionalCard, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                <View style={[styles.professionalAvatar, { backgroundColor: '#8B5CF6' }]}>
                  <MaterialIcons name="person-outline" size={32} color="#fff" />
                </View>
                <View style={styles.professionalInfo}>
                  <Text style={[styles.professionalName, { color: colors.text }]}>{volunteer.name}</Text>
                  <Text style={[styles.professionalSpec, { color: colors.icon }]}>
                    Volunteer First Responder
                  </Text>
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

        {/* Health Tips */}
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
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Professional Card
  professionalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
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
    marginBottom: 4,
  },
  professionalSpec: {
    fontSize: 12,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  sosDemoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sosDemoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  sosDemoButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Empty State
  emptyState: {
    paddingVertical: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 8,
  },

  // Health Tip Card
  healthTipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  healthTipDesc: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
});
