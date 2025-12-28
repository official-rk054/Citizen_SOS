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
  Modal,
} from 'react-native';
import * as Location from 'expo-location';
import { usersAPI, locationAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import GoogleMap from '../../components/GoogleMap';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function NearbyFacilitiesScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'doctors' | 'nurses' | 'ambulances'>(
    'doctors'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [radius, setRadius] = useState(10);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);

  const tabs = ['doctors', 'nurses', 'ambulances'] as const;

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyFacilities();
    }
  }, [activeTab, radius, userLocation]);

  const generateMapMarkers = (lists: { doctors?: any[]; nurses?: any[]; ambulances?: any[] }) => {
    const markers: any[] = [];
    const addList = (items: any[], type: 'doctors' | 'nurses' | 'ambulances') => {
      items.forEach((facility: any, index: number) => {
        const lat = facility.latitude ?? userLocation?.latitude;
        const lon = facility.longitude ?? userLocation?.longitude;
        if (!lat || !lon) return;
        markers.push({
          id: facility.id || facility._id || `${type}-${index}`,
          latitude: lat,
          longitude: lon,
          title: facility.name || facility.operatorName || 'Unknown',
          description: facility.specialization || facility.vehicleNumber || '',
          type: type === 'ambulances' ? 'ambulance' : type.slice(0, -1),
          facility,
        });
      });
    };
    if (lists.doctors) addList(lists.doctors, 'doctors');
    if (lists.nurses) addList(lists.nurses, 'nurses');
    if (lists.ambulances) addList(lists.ambulances, 'ambulances');
    return markers;
  };

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

      // Persist to backend location history
      try {
        await locationAPI.updateLocation(
          loc.coords.latitude,
          loc.coords.longitude,
          '',
          loc.coords.accuracy || 0
        );
      } catch (e) {
        // Non-blocking: ignore persistence errors
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your location');
    }
  };

  const fetchNearbyFacilities = async () => {
    if (!userLocation) return;

    setLoading(true);
    try {
      const { latitude, longitude } = userLocation;
      const [docRes, nurseRes, ambRes] = await Promise.all([
        usersAPI.getNearbyProfessionals('doctor', latitude, longitude, radius),
        usersAPI.getNearbyProfessionals('nurse', latitude, longitude, radius),
        usersAPI.getNearbyAmbulances(latitude, longitude, radius),
      ]);

      const docs = docRes.data || [];
      const nurs = nurseRes.data || [];
      const ambs = ambRes.data || [];
      setDoctors(docs);
      setNurses(nurs);
      setAmbulances(ambs);

      // Set list for active tab
      const currentList = activeTab === 'doctors' ? docs : activeTab === 'nurses' ? nurs : ambs;
      setFacilities(currentList);

      // Build combined markers for map
      setMapMarkers(generateMapMarkers({ doctors: docs, nurses: nurs, ambulances: ambs }));
    } catch (error) {
      console.error('Error fetching facilities:', error);
      // Use mock data as fallback
      const mockData = getMockData();
      setFacilities(mockData);
      // Fallback markers only for active tab
      const combined =
        activeTab === 'doctors'
          ? { doctors: mockData }
          : activeTab === 'nurses'
          ? { nurses: mockData }
          : { ambulances: mockData };
      setMapMarkers(generateMapMarkers(combined));
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
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        setSelectedFacility(item);
        setShowMapModal(true);
      }}
    >
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
        <TouchableOpacity 
          style={[styles.button, styles.directionsButton]}
          onPress={() => {
            setSelectedFacility(item);
            setShowMapModal(true);
          }}
        >
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
        <View style={styles.countsRow}>
          <View style={styles.countChip}>
            <Text style={styles.countLabel}>Doctors</Text>
            <Text style={styles.countValue}>{doctors.length}</Text>
          </View>
          <View style={styles.countChip}>
            <Text style={styles.countLabel}>Nurses</Text>
            <Text style={styles.countValue}>{nurses.length}</Text>
          </View>
          <View style={styles.countChip}>
            <Text style={styles.countLabel}>Ambulances</Text>
            <Text style={styles.countValue}>{ambulances.length}</Text>
          </View>
        </View>
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

      {/* Map FAB */}
      <TouchableOpacity 
        style={styles.mapFab}
        onPress={() => setShowMapModal(true)}
      >
        <Text style={styles.mapIcon}>🗺️</Text>
      </TouchableOpacity>

      {/* Map Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowMapModal(false)}
      >
        <SafeAreaView style={styles.mapContainer}>
          {/* Close Button */}
          <View style={styles.mapHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowMapModal(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.mapTitle}>
              {selectedFacility ? selectedFacility.name : 'Nearby ' + activeTab}
            </Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Google Map */}
          {userLocation && (
            <GoogleMap
              initialRegion={{
                latitude: (selectedFacility?.latitude ?? userLocation.latitude),
                longitude: (selectedFacility?.longitude ?? userLocation.longitude),
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              markers={selectedFacility ? generateMapMarkers({
                [activeTab]: [selectedFacility]
              }) : mapMarkers}
              showRadius
              radiusKm={radius}
              showUserLocation
            />
          )}

          {/* Facility Details Bottom Sheet */}
          {selectedFacility && (
            <View style={styles.facilityDetailsSheet}>
              <View style={styles.detailsContent}>
                <View style={styles.detailsHeader}>
                  <Text style={styles.detailsIcon}>{selectedFacility.icon}</Text>
                  <View>
                    <Text style={styles.detailsName}>{selectedFacility.name}</Text>
                    <Text style={styles.detailsSpec}>{selectedFacility.specialization}</Text>
                  </View>
                </View>

                <View style={styles.detailsMeta}>
                  <View style={styles.detailsMetaItem}>
                    <Text>⭐</Text>
                    <Text style={styles.detailsMetaText}>{selectedFacility.rating}</Text>
                  </View>
                  <View style={styles.detailsMetaItem}>
                    <Text>📍</Text>
                    <Text style={styles.detailsMetaText}>{selectedFacility.distance.toFixed(1)} km</Text>
                  </View>
                  <View style={styles.detailsMetaItem}>
                    <Text>{selectedFacility.availability ? '🟢' : '🔴'}</Text>
                    <Text style={styles.detailsMetaText}>
                      {selectedFacility.availability ? 'Available' : 'Busy'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsActions}>
                  <TouchableOpacity style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>📞 Call Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>📅 Book Appointment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>
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
  countsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  countChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  countLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  countValue: {
    fontSize: 12,
    color: '#5B5FFF',
    fontWeight: '700',
  },
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
  // Map Modal Styles
  mapContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#5B5FFF',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  facilityDetailsSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  detailsContent: {
    gap: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailsIcon: {
    fontSize: 40,
  },
  detailsName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  detailsSpec: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  detailsMeta: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E8E8E8',
  },
  detailsMetaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailsMetaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  detailsActions: {
    gap: 10,
  },
  detailsButton: {
    backgroundColor: '#5B5FFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  }
});
