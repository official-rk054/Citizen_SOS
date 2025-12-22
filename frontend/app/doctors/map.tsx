import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { usersAPI } from '../../utils/api';

interface Professional {
  _id: string;
  name: string;
  specialization: string;
  yearsOfExperience?: number;
}

export default function DoctorsMapScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<any>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState<'doctor' | 'nurse'>('doctor');

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
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
      fetchNearbyProfessionals(loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      console.error('Error initializing map:', error);
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const fetchNearbyProfessionals = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      const response = await usersAPI.getNearbyProfessionals(mapType, { latitude: lat, longitude: lon, radius: 10 });
      setProfessionals(response.data);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalSelect = (professional: any) => {
    Alert.alert(
      professional.name,
      `${professional.specialization}\n\nBook appointment with ${professional.name}?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Book Now',
          onPress: () =>
            router.push({
              pathname: '/appointments/book',
              params: { professionalId: professional._id },
            }),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nearby {mapType === 'doctor' ? 'Doctors' : 'Nurses'}</Text>
      </View>

      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, mapType === 'doctor' && styles.toggleButtonActive]}
          onPress={() => {
            setMapType('doctor');
            if (location) {
              fetchNearbyProfessionals(location.latitude, location.longitude);
            }
          }}
        >
          <Text
            style={[
              styles.toggleButtonText,
              mapType === 'doctor' && styles.toggleButtonTextActive,
            ]}
          >
            👨‍⚕️ Doctors
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, mapType === 'nurse' && styles.toggleButtonActive]}
          onPress={() => {
            setMapType('nurse');
            if (location) {
              fetchNearbyProfessionals(location.latitude, location.longitude);
            }
          }}
        >
          <Text
            style={[
              styles.toggleButtonText,
              mapType === 'nurse' && styles.toggleButtonTextActive,
            ]}
          >
            👩‍⚕️ Nurses
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map Placeholder - In production, use react-native-maps */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderText}>
          🗺️ Map View\n\n(Integrate react-native-maps for full functionality)
        </Text>
      </View>

      {/* Professional List */}
      <ScrollView style={styles.listContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF0000" />
          </View>
        ) : professionals.length > 0 ? (
          professionals.map((professional) => (
            <TouchableOpacity
              key={professional._id}
              style={styles.professionalCard}
              onPress={() => handleProfessionalSelect(professional)}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.name}>{professional.name}</Text>
                  <Text style={styles.specialization}>
                    {professional.specialization}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Available</Text>
                </View>
              </View>

              <View style={styles.cardDetails}>
                <Text style={styles.detailText}>
                  📍 {(Math.random() * 10).toFixed(1)} km away
                </Text>
                <Text style={styles.detailText}>
                  ⭐ {(Math.random() * 5).toFixed(1)}/5 ({Math.floor(Math.random() * 50) + 10} reviews)
                </Text>
                <Text style={styles.detailText}>
                  💼 {professional.yearsOfExperience || 5} years experience
                </Text>
              </View>

              <TouchableOpacity style={styles.bookButton}>
                <Text style={styles.bookButtonText}>Book Now</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No {mapType}s available nearby
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    fontSize: 16,
    color: '#FF0000',
    fontWeight: '600',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  toggleButtonActive: {
    backgroundColor: '#FF0000',
    borderColor: '#FF0000',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ddd',
  },
  mapPlaceholderText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 12,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  professionalCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0000',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  specialization: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cardDetails: {
    marginBottom: 12,
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  bookButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
