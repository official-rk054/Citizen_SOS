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
import { usersAPI } from '../../utils/api';

interface Ambulance {
  _id: string;
  ambulanceType: string;
  vehicleNumber: string;
  operatorName: string;
}

export default function BookAmbulanceScreen() {
  const router = useRouter();
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      const response = await usersAPI.getNearbyAmbulances({ latitude: 0, longitude: 0, radius: 100 });
      setAmbulances(response.data);
    } catch (error) {
      console.error('Error fetching ambulances:', error);
      Alert.alert('Error', 'Failed to load ambulances');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAmbulance = async () => {
    if (!selectedAmbulance) {
      Alert.alert('Error', 'Please select an ambulance');
      return;
    }

    try {
      setBookingLoading(true);
      Alert.alert('Success', 'Ambulance booked successfully');
      router.back();
    } catch (error) {
      console.error('Error booking ambulance:', error);
      Alert.alert('Error', 'Failed to book ambulance');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Book Ambulance</Text>
        </View>

        <Text style={styles.description}>
          Select an available ambulance for non-emergency transportation
        </Text>

        <View style={styles.section}>
          {loading ? (
            <ActivityIndicator size="large" color="#FF0000" />
          ) : ambulances.length > 0 ? (
            <FlatList
              data={ambulances}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.ambulanceCard,
                    selectedAmbulance?._id === item._id && styles.ambulanceCardSelected,
                  ]}
                  onPress={() => setSelectedAmbulance(item)}
                >
                  <View style={styles.ambulanceInfo}>
                    <Text style={styles.ambulanceType}>{item.ambulanceType} Ambulance</Text>
                    <Text style={styles.vehicleNumber}>Vehicle: {item.vehicleNumber}</Text>
                    <Text style={styles.operator}>{item.operatorName}</Text>
                    <Text style={styles.distance}>2.5 km away</Text>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      selectedAmbulance?._id === item._id && styles.checkboxSelected,
                    ]}
                  />
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={styles.noDataText}>No ambulances available</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.bookButton, bookingLoading && { opacity: 0.6 }]}
          onPress={handleBookAmbulance}
          disabled={bookingLoading}
        >
          {bookingLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>Book Ambulance</Text>
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
    marginBottom: 16,
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
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  ambulanceCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ambulanceCardSelected: {
    borderColor: '#FF0000',
    backgroundColor: '#ffe6e6',
  },
  ambulanceInfo: {
    flex: 1,
  },
  ambulanceType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  vehicleNumber: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  operator: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  distance: {
    fontSize: 12,
    color: '#FF0000',
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    marginLeft: 12,
  },
  checkboxSelected: {
    borderColor: '#FF0000',
    backgroundColor: '#FF0000',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
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
