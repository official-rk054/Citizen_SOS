import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { usersAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function NearbyFacilitiesScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'doctors' | 'nurses' | 'ambulances'>(
    'doctors'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [radius, setRadius] = useState(10);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);

  const tabs = ['doctors', 'nurses', 'ambulances'] as const;

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyFacilities();
    }
  }, [activeTab, radius, userLocation]);

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

      setUserLocation(loc.coords);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your location');
    }
  };

  const fetchNearbyFacilities = async () => {
    if (!userLocation) return;

    setLoading(true);
    try {
      let response;
      const { latitude, longitude } = userLocation;

      if (activeTab === 'doctors' || activeTab === 'nurses') {
        response = await usersAPI.getNearbyProfessionals(activeTab, latitude, longitude, radius);
      } else {
        response = await usersAPI.getNearbyAmbulances(latitude, longitude, radius);
      }

      setFacilities(response.data || []);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      // Use mock data as fallback
      setFacilities(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => {
    if (activeTab === 'doctors') {
      return [
        {
          id: '1',
          name: 'Dr. Smith',
          specialization: 'General Physician',
          rating: 4.8,
          distance: 0.5,
          availability: true,
          icon: '👨‍⚕️',
        },
        {
          id: '2',
          name: 'Dr. Sarah Jones',
          specialization: 'Cardiologist',
          rating: 4.6,
          distance: 1.2,
          availability: true,
          icon: '👩‍⚕️',
        },
        {
          id: '3',
          name: 'Dr. Mike Johnson',
          specialization: 'Dermatologist',
          rating: 4.5,
          distance: 2.3,
          availability: false,
          icon: '👨‍⚕️',
        },
      ];
    } else if (activeTab === 'nurses') {
      return [
        {
          id: '1',
          name: 'Nurse Mary',
          specialization: 'Home Care',
          rating: 4.9,
          distance: 0.3,
          availability: true,
          icon: '👩‍⚕️',
        },
        {
          id: '2',
          name: 'Nurse John',
          specialization: 'ICU Care',
          rating: 4.7,
          distance: 1.5,
          availability: true,
          icon: '👨‍⚕️',
        },
      ];
    } else {
      return [
        {
          id: '1',
          name: 'Ambulance #101',
          specialization: 'Emergency',
          rating: 4.8,
          distance: 0.8,
          availability: true,
          icon: '🚑',
          driver: 'Driver Bob',
        },
        {
          id: '2',
          name: 'Ambulance #102',
          specialization: 'ICU',
          rating: 4.5,
          distance: 2.1,
          availability: true,
          icon: '🚑',
          driver: 'Driver Alice',
        },
      ];
    }
  };

  const renderFacilityCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.icon}>{item.icon}</Text>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.specialization}>{item.specialization}</Text>
        </View>
        <View style={styles.rating}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
        </View>
      </View>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>📍</Text>
          <Text style={styles.metaText}>{item.distance.toFixed(1)} km</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>
            {item.availability ? '🟢' : '🔴'}
          </Text>
          <Text style={styles.metaText}>
            {item.availability ? 'Available' : 'Busy'}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.button, styles.callButton]}>
          <Text style={styles.buttonIcon}>📞</Text>
          <Text style={styles.buttonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.bookButton]}>
          <Text style={styles.buttonIcon}>📅</Text>
          <Text style={styles.buttonText}>Book</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.directionsButton]}>
          <Text style={styles.buttonIcon}>🗺️</Text>
          <Text style={styles.buttonText}>Map</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Facilities</Text>
        <Text style={styles.subtitle}>Find doctors, nurses & ambulances</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterOpen(!filterOpen)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Radius Filter */}
      {filterOpen && (
        <View style={styles.filterPanel}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Search Radius</Text>
            <View style={styles.radiusButtons}>
              {[5, 10, 25, 50, 100].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.radiusButton,
                    radius === r && styles.radiusButtonActive,
                  ]}
                  onPress={() => setRadius(r)}
                >
                  <Text
                    style={[
                      styles.radiusText,
                      radius === r && styles.radiusTextActive,
                    ]}
                  >
                    {r}km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.tabTextActive,
            ]}>
              {tab === 'doctors'
                ? '👨‍⚕️ Doctors'
                : tab === 'nurses'
                ? '👩‍⚕️ Nurses'
                : '🚑 Ambulances'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Facilities List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B5FFF" />
          <Text style={styles.loadingText}>Finding nearby {activeTab}...</Text>
        </View>
      ) : facilities.length > 0 ? (
        <FlatList
          data={facilities}
          renderItem={renderFacilityCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No {activeTab} found nearby</Text>
          <Text style={styles.emptySubtext}>Try increasing the search radius</Text>
        </View>
      )}

      {/* Map Button (Floating) */}
      <TouchableOpacity style={styles.mapFab}>
        <Text style={styles.mapIcon}>🗺️</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#F9F9F9',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#5B5FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 20,
  },
  filterPanel: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 12,
  },
  filterItem: {
    gap: 10,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  radiusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  radiusButtonActive: {
    backgroundColor: '#5B5FFF',
    borderColor: '#5B5FFF',
  },
  radiusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  radiusTextActive: {
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E8E8E8',
    alignItems: 'center',
  },
  tabActive: {
    borderBottomColor: '#5B5FFF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
  },
  tabTextActive: {
    color: '#5B5FFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  icon: {
    fontSize: 40,
  },
  cardInfo: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  specialization: {
    fontSize: 13,
    color: '#999',
  },
  rating: {
    backgroundColor: '#FFE4B5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF9800',
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E8E8E8',
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  callButton: {
    backgroundColor: '#E4F5FF',
  },
  bookButton: {
    backgroundColor: '#5B5FFF',
  },
  directionsButton: {
    backgroundColor: '#F0E4FF',
  },
  buttonIcon: {
    fontSize: 16,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    fontSize: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
  },
  mapFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5B5FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5B5FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mapIcon: {
    fontSize: 28,
  },
});
