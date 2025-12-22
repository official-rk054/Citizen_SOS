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
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { emergencyAPI, usersAPI, appointmentsAPI } from '../../utils/api';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export default function HomeScreen() {
  const router = useRouter();
  const { user, updateLocation } = useAuth();
  const [location, setLocation] = useState<any>(null);
  const [loadingEmergency, setLoadingEmergency] = useState(false);
  const [nearbyData, setNearbyData] = useState({ doctors: [], nurses: [], ambulances: [] });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const socketRef = useRef<any>(null);

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
      const [doctors, nurses, ambulances] = await Promise.all([
        usersAPI.getNearbyProfessionals('doctor', location.latitude, location.longitude, 10),
        usersAPI.getNearbyProfessionals('nurse', location.latitude, location.longitude, 10),
        usersAPI.getNearbyAmbulances(location.latitude, location.longitude, 10),
      ]);

      setNearbyData({
        doctors: doctors.data.slice(0, 3),
        nurses: nurses.data.slice(0, 3),
        ambulances: ambulances.data.slice(0, 3),
      });
    } catch (error) {
      console.error('Error fetching nearby services:', error);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      if (user?.id) {
        const response = await appointmentsAPI.getUpcomingAppointments(user.id);
        setUpcomingAppointments(response.data.slice(0, 2));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleEmergency = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available. Please enable location services.');
      return;
    }

    setLoadingEmergency(true);
    try {
      const emergencyContact = user?.emergencyContacts?.[0];
      const response = await emergencyAPI.triggerEmergency({
        latitude: location.latitude,
        longitude: location.longitude,
        description: 'Emergency assistance needed',
        emergencyContactId: emergencyContact?.id,
        severity: 'critical',
      });

      socketRef.current?.emit('emergency-alert', {
        victimId: user?.id,
        victimName: user?.name,
        latitude: location.latitude,
        longitude: location.longitude,
        emergencyContactPhone: emergencyContact?.phone,
      });

      Alert.alert(
        'Emergency Triggered',
        'Nearest ambulance and medical professionals have been alerted to your location.',
        [
          {
            text: 'Track Response',
            onPress: () => router.push({
              pathname: '/emergency/tracking',
              params: { emergencyId: response.data.emergency._id },
            }),
          },
        ]
      );
    } catch (error) {
      console.error('Error triggering emergency:', error);
      Alert.alert('Error', 'Failed to trigger emergency. Please try again.');
    } finally {
      setLoadingEmergency(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name}</Text>
            <Text style={styles.subGreeting}>{user?.userType}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.emergencyButton, loadingEmergency && styles.emergencyButtonDisabled]}
          onPress={handleEmergency}
          disabled={loadingEmergency}
        >
          {loadingEmergency ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <>
              <Text style={styles.emergencyButtonIcon}>🚨</Text>
              <Text style={styles.emergencyButtonText}>EMERGENCY</Text>
              <Text style={styles.emergencyButtonSubText}>Tap for immediate help</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/appointments/book')}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionLabel}>Book Doctor/Nurse</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/ambulance/book')}
          >
            <Text style={styles.actionIcon}>🚑</Text>
            <Text style={styles.actionLabel}>Book Ambulance</Text>
          </TouchableOpacity>
        </View>

        {upcomingAppointments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
              <TouchableOpacity onPress={() => router.push('/appointments')}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            {upcomingAppointments.map((appointment) => (
              <View key={appointment._id} style={styles.appointmentCard}>
                <View>
                  <Text style={styles.appointmentName}>{appointment.professionalId.name}</Text>
                  <Text style={styles.appointmentDate}>
                    {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.appointmentTime}>{appointment.timeSlot}</Text>
                </View>
                <View style={styles.appointmentBadge}>
                  <Text style={styles.appointmentBadgeText}>Scheduled</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Doctors</Text>
            <TouchableOpacity onPress={() => router.push('/doctors/map')}>
              <Text style={styles.viewAll}>Map View</Text>
            </TouchableOpacity>
          </View>
          {nearbyData.doctors.length > 0 ? (
            nearbyData.doctors.map((doctor) => (
              <View key={doctor._id} style={styles.professionalCard}>
                <View>
                  <Text style={styles.professionalName}>{doctor.name}</Text>
                  <Text style={styles.professionalSpec}>{doctor.specialization}</Text>
                  <Text style={styles.professionalDistance}>
                    {Math.random() * 5} km away
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() =>
                    router.push({
                      pathname: '/appointments/book',
                      params: { professionalId: doctor._id },
                    })
                  }
                >
                  <Text style={styles.bookButtonText}>Book</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No doctors nearby</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  profileIcon: {
    fontSize: 32,
  },
  emergencyButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 40,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 5,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  emergencyButtonDisabled: {
    opacity: 0.6,
  },
  emergencyButtonIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emergencyButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  emergencyButtonSubText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewAll: {
    fontSize: 14,
    color: '#FF0000',
    fontWeight: '600',
  },
  appointmentCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0000',
  },
  appointmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  appointmentDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  appointmentTime: {
    fontSize: 12,
    color: '#FF0000',
    fontWeight: '600',
  },
  appointmentBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  appointmentBadgeText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600',
  },
  professionalCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  professionalSpec: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  professionalDistance: {
    fontSize: 12,
    color: '#FF0000',
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
});
