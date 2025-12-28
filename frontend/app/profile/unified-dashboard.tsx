import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { appointmentsAPI, bookingAPI, locationAPI, usersAPI } from '../../utils/api';
import { Colors } from '../../constants/theme';

interface Appointment {
  _id: string;
  professionalId: { name: string };
  appointmentDate: string;
  timeSlot: string;
  reason?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
}

interface Booking {
  _id: string;
  serviceType: string;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  amount?: number;
}

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export default function UnifiedDashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<{ [key: string]: boolean }>({});
  const locationUpdateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchAllData();
      startLocationTracking();
    }
    return () => {
      if (locationUpdateIntervalRef.current) {
        clearInterval(locationUpdateIntervalRef.current);
      }
    };
  }, [user?.id]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      if (!user?.id) return;
      const [appointmentsRes, bookingsRes, locationRes] = await Promise.all([
        appointmentsAPI.getUserAppointments(user.id),
        bookingAPI.getUserBookings(user.id),
        locationAPI.getCurrentLocation(user.id),
      ]);
      setAppointments(appointmentsRes.data || []);
      setBookings(bookingsRes.data || []);
      setLocation(locationRes.data || null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      // Update location immediately
      await updateUserLocation();

      // Update location every 30 seconds
      locationUpdateIntervalRef.current = setInterval(() => {
        updateUserLocation();
      }, 30000);
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const updateUserLocation = async () => {
    try {
      setUpdatingLocation(true);
      if (!user?.id) return;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = loc.coords;

      // Update to backend
      await usersAPI.updateLocation(user.id, latitude, longitude);

      // Update location state
      setLocation({
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setUpdatingLocation(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      setUpdatingIds((prev) => ({ ...prev, [appointmentId]: true }));
      await appointmentsAPI.updateAppointmentStatus(appointmentId, newStatus);
      Alert.alert('Success', `Appointment ${newStatus}`);
      fetchAllData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      Alert.alert('Error', 'Failed to update appointment');
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [appointmentId]: false }));
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      setUpdatingIds((prev) => ({ ...prev, [bookingId]: true }));
      await bookingAPI.updateBookingStatus(bookingId, newStatus);
      Alert.alert('Success', `Booking ${newStatus}`);
      fetchAllData();
    } catch (error) {
      console.error('Error updating booking:', error);
      Alert.alert('Error', 'Failed to update booking');
    } finally {
      setUpdatingIds((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>My Dashboard</Text>
          <TouchableOpacity
            style={[styles.updateLocationBtn, { backgroundColor: colors.primary }, updatingLocation && { opacity: 0.6 }]}
            onPress={updateUserLocation}
            disabled={updatingLocation}
          >
            <Text style={styles.updateLocationText}>
              {updatingLocation ? 'Updating...' : '📍 Update Location'}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 32 }} />
        ) : (
          <>
            {/* Location Section */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>📍 Current Location</Text>
              {location ? (
                <View style={[styles.locationCard, { backgroundColor: colors.background, borderLeftColor: colors.primary }]}>
                  <Text style={[styles.locationText, { color: colors.text }]}>
                    Lat: {location.latitude?.toFixed(4)}
                  </Text>
                  <Text style={[styles.locationText, { color: colors.text }]}>
                    Lng: {location.longitude?.toFixed(4)}
                  </Text>
                  <Text style={[styles.locationTimestamp, { color: colors.icon }]}>
                    Updated: {new Date(location.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.emptyText, { color: colors.icon }]}>No location data available.</Text>
              )}
            </View>

            {/* Appointments Section */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>📅 Upcoming Appointments</Text>
                <TouchableOpacity onPress={() => router.push('/appointments/book')}>
                  <Text style={[styles.addButton, { color: colors.primary }]}>+ New</Text>
                </TouchableOpacity>
              </View>
              {appointments.length > 0 ? (
                appointments.map((apt) => (
                  <View key={apt._id} style={[styles.card, { backgroundColor: colors.background, borderLeftColor: colors.primary }]}>
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>
                          {apt.professionalId?.name || 'Professional'}
                        </Text>
                        <Text style={[styles.cardSubtitle, { color: colors.icon }]}>
                          {apt.appointmentDate?.slice(0, 10)} at {apt.timeSlot}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(apt.status) }]}>
                        <Text style={styles.statusText}>{apt.status}</Text>
                      </View>
                    </View>
                    {apt.status === 'scheduled' && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                          onPress={() => updateAppointmentStatus(apt._id, 'confirmed')}
                          disabled={updatingIds[apt._id]}
                        >
                          <Text style={styles.actionBtnText}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.cancelBtn]}
                          onPress={() => updateAppointmentStatus(apt._id, 'cancelled')}
                          disabled={updatingIds[apt._id]}
                        >
                          <Text style={styles.actionBtnText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: colors.icon }]}>No appointments found.</Text>
              )}
            </View>

            {/* Bookings Section */}
            <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>🚑 My Bookings</Text>
                <TouchableOpacity onPress={() => router.push('/ambulance/book')}>
                  <Text style={[styles.addButton, { color: colors.primary }]}>+ New</Text>
                </TouchableOpacity>
              </View>
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <View key={booking._id} style={[styles.card, { backgroundColor: colors.background, borderLeftColor: colors.primary }]}>
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>
                          {booking.serviceType?.replace('-', ' ') || 'Service'}
                        </Text>
                        <Text style={[styles.cardSubtitle, { color: colors.icon }]}>
                          {booking.scheduledTime
                            ? new Date(booking.scheduledTime).toLocaleString()
                            : 'N/A'}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                        <Text style={styles.statusText}>{booking.status}</Text>
                      </View>
                    </View>
                    {booking.status === 'pending' && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                          onPress={() => updateBookingStatus(booking._id, 'confirmed')}
                          disabled={updatingIds[booking._id]}
                        >
                          <Text style={styles.actionBtnText}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.cancelBtn]}
                          onPress={() => updateBookingStatus(booking._id, 'cancelled')}
                          disabled={updatingIds[booking._id]}
                        >
                          <Text style={styles.actionBtnText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: colors.icon }]}>No bookings found.</Text>
              )}
            </View>

            <TouchableOpacity style={[styles.refreshButton, { backgroundColor: colors.primary }]} onPress={fetchAllData}>
              <Text style={styles.refreshButtonText}>🔄 Refresh All</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'scheduled':
    case 'pending':
      return '#FFA500';
    case 'confirmed':
    case 'in-progress':
      return '#4CAF50';
    case 'completed':
      return '#2196F3';
    case 'cancelled':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  updateLocationBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  updateLocationText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  addButton: {
    fontWeight: '600',
    fontSize: 14,
  },
  locationCard: {
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
  },
  locationText: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  locationTimestamp: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  card: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    justifyContent: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F44336',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyText: {
    fontStyle: 'italic',
    fontSize: 14,
    marginTop: 8,
  },
  refreshButton: {
    marginVertical: 20,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
