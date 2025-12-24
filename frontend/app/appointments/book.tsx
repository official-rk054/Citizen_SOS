import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, appointmentsAPI } from '../../utils/api';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Professional {
  _id: string;
  name: string;
  userType: string;
  specialization?: string;
}

export default function BookAppointmentScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const [doctors, nurses] = await Promise.all([
        usersAPI.getNearbyProfessionals('doctor', loc.coords.latitude, loc.coords.longitude, 15),
        usersAPI.getNearbyProfessionals('nurse', loc.coords.latitude, loc.coords.longitude, 15),
      ]);
      setProfessionals([...(doctors.data || []), ...(nurses.data || [])]);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      Alert.alert('Error', 'Failed to load professionals');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, date: any) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowDatePicker(false);
  };

  const handleBookAppointment = async () => {
    if (!selectedProfessional || !reason) {
      Alert.alert('Error', 'Please select a professional and enter reason');
      return;
    }

    try {
      setLoading(true);
      const appointmentData = {
        professionalId: selectedProfessional._id,
        appointmentDate: selectedDate.toISOString(),
        timeSlot: selectedTime,
        reason: reason,
      };
      await appointmentsAPI.bookAppointment(appointmentData);
      Alert.alert('Success', 'Appointment booked successfully');
      router.back();
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Book Appointment</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Professional</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#FF0000" />
          ) : (
            <FlatList
              data={professionals}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.professionalItem,
                    selectedProfessional?._id === item._id && styles.professionalItemSelected,
                  ]}
                  onPress={() => setSelectedProfessional(item)}
                >
                  <View>
                    <Text style={styles.professionalName}>{item.name}</Text>
                    <Text style={styles.professionalSpec}>{item.specialization || item.userType}</Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      selectedProfessional?._id === item._id && styles.checkboxSelected,
                    ]}
                  />
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date & Time</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {selectedDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
          )}

          <View style={styles.timeSlots}>
            {['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'].map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.timeSlotSelected,
                ]}
                onPress={() => setSelectedTime(time)}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedTime === time && styles.timeSlotTextSelected,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason for Visit</Text>
          {/* TextInput for reason */}
          <Text style={styles.noteText}>Describe your symptoms or reason for visit</Text>
        </View>

        <TouchableOpacity
          style={[styles.bookButton, loading && { opacity: 0.6 }]}
          onPress={handleBookAppointment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    fontSize: 16,
    color: '#FF0000',
    fontWeight: '600',
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  professionalItem: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  professionalItemSelected: {
    borderColor: '#FF0000',
    backgroundColor: '#ffe6e6',
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
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  checkboxSelected: {
    borderColor: '#FF0000',
    backgroundColor: '#FF0000',
  },
  dateButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    width: '48%',
  },
  timeSlotSelected: {
    borderColor: '#FF0000',
    backgroundColor: '#FF0000',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  timeSlotTextSelected: {
    color: '#fff',
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  bookButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
