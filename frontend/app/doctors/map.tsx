import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../utils/api';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import GoogleMap from '../../components/GoogleMap';

const { height, width } = Dimensions.get('window');

export default function DoctorsMapScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [location, setLocation] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'doctors' | 'nurses' | 'ambulances'>('all');
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [showMapOnly, setShowMapOnly] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

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
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your location');
    }
  };

  const fetchNearbyProfessionals = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      const [doctorRes, nurseRes, ambulanceRes] = await Promise.all([
        usersAPI.getNearbyProfessionals('doctor', latitude, longitude, 15),
        usersAPI.getNearbyProfessionals('nurse', latitude, longitude, 15),
        usersAPI.getNearbyAmbulances(latitude, longitude, 15),
      ]);

      setDoctors(doctorRes.data || []);
      setNurses(nurseRes.data || []);
      setAmbulances(ambulanceRes.data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      Alert.alert('Error', 'Failed to load nearby professionals');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (professional: any) => {
    router.push({
      pathname: '/appointments/book',
      params: { professionalId: professional._id },
    });
  };

  const getProfessionalIcon = (type: 'doctor' | 'nurse' | 'ambulance') => {
    switch (type) {
      case 'doctor':
        return <MaterialIcons name="person" size={24} color="#fff" />;
      case 'nurse':
        return <MaterialIcons name="person" size={24} color="#fff" />;
      case 'ambulance':
        return <MaterialIcons name="local-hospital" size={24} color="#fff" />;
    }
  };

  const getProfessionalColor = (type: 'doctor' | 'nurse' | 'ambulance') => {
    switch (type) {
      case 'doctor':
        return '#5B5FFF';
      case 'nurse':
        return '#FF6B6B';
      case 'ambulance':
        return '#FF9800';
    }
  };

  const ProfessionalCard = ({ 
    professional, 
    type, 
    isSelected,
    onPress 
  }: { 
    professional: any; 
    type: 'doctor' | 'nurse' | 'ambulance';
    isSelected?: boolean;
    onPress?: () => void;
  }) => {
    // Use distance from API response (backend calculates it)
    const distance = professional.distance ? professional.distance.toFixed(1) : '0';
    
    // For rating, use actual data or fallback
    const rating = professional.rating ? professional.rating.toFixed(1) : '4.5';
    
    return (
      <TouchableOpacity
        style={[
          styles.professionalCard,
          isSelected && styles.professionalCardSelected
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.professionalIcon, { backgroundColor: getProfessionalColor(type) }]}>
          {getProfessionalIcon(type)}
        </View>
        <View style={styles.professionalDetails}>
          <Text style={styles.professionalName}>{professional.name}</Text>
          <Text style={styles.professionalSpec}>
            {type === 'doctor' ? professional.specialization : type === 'nurse' ? 'Registered Nurse' : professional.ambulanceType || 'Ambulance Service'}
          </Text>
          <View style={styles.ratingRow}>
            <AntDesign name="star" size={12} color="#FFC107" />
            <Text style={styles.rating}>{rating}</Text>
            <Text style={styles.distance}>• {distance} km away</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: getProfessionalColor(type) }]}
          onPress={() => handleBookAppointment(professional)}
        >
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
</TouchableOpacity>
    );
  };

  const displayProfessionals = () => {
    let combined: any[] = [];

    if (selectedFilter === 'all' || selectedFilter === 'doctors') {
      combined = [
        ...combined,
        ...doctors.map((d: any) => ({ ...d, type: 'doctor' })),
      ];
    }
    if (selectedFilter === 'all' || selectedFilter === 'nurses') {
      combined = [
        ...combined,
        ...nurses.map((n: any) => ({ ...n, type: 'nurse' })),
      ];
    }
    if (selectedFilter === 'all' || selectedFilter === 'ambulances') {
      combined = [
        ...combined,
        ...ambulances.map((a: any) => ({ ...a, type: 'ambulance' })),
      ];
    }

    return combined;
  };

  // Convert professionals to map markers
  const getMapMarkers = () => {
    const markers: any[] = [];

    displayProfessionals().forEach((prof) => {
      if (prof.latitude && prof.longitude) {
        markers.push({
          id: prof._id || prof.id,
          latitude: prof.latitude,
          longitude: prof.longitude,
          title: prof.name || prof.title,
          description: prof.specialization || prof.type,
          type: prof.type,
          color: getProfessionalColor(prof.type),
          onPress: () => handleMarkerPress(prof),
        });
      }
    });

    return markers;
  };

  const handleMarkerPress = (professional: any) => {
    setSelectedMarker(professional);
    // Auto-scroll to show the card
    setTimeout(() => {
      scrollRef.current?.scrollToEnd();
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#5B5FFF" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Nearby Services</Text>
          <Text style={styles.headerSubtitle}>Find doctors, nurses & ambulances</Text>
        </View>
        <TouchableOpacity
          style={styles.mapToggleButton}
          onPress={() => setShowMapOnly(!showMapOnly)}
        >
          <MaterialIcons 
            name={showMapOnly ? "list" : "map"} 
            size={22} 
            color="#5B5FFF" 
          />
        </TouchableOpacity>
      </View>

      {/* Location Info */}
      {location && (
        <View style={styles.locationInfo}>
          <MaterialIcons name="location-on" size={16} color="#5B5FFF" />
          <Text style={styles.locationText}>
            Showing services within 15 km radius
          </Text>
        </View>
      )}

      {showMapOnly ? (
        // Map Only View
        <View style={styles.mapOnlyContainer}>
          <GoogleMap
            initialLocation={location}
            markers={getMapMarkers()}
            showUserLocation={true}
            onMarkerPress={handleMarkerPress}
            showRadius={true}
            radiusKm={15}
            mapHeight={height - 150}
          />
        </View>
      ) : (
        // Map + List View
        <>
          {/* Google Map */}
          {location && (
            <GoogleMap
              initialLocation={location}
              markers={getMapMarkers()}
              showUserLocation={true}
              onMarkerPress={handleMarkerPress}
              showRadius={true}
              radiusKm={15}
              mapHeight={height * 0.35}
              style={styles.mapView}
            />
          )}

          {/* Filter Buttons */}
          <View style={styles.filterSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterContent}
            >
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === 'all' && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter('all')}
              >
                <MaterialIcons
                  name="apps"
                  size={18}
                  color={selectedFilter === 'all' ? '#fff' : '#5B5FFF'}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === 'all' && styles.filterButtonTextActive,
                  ]}
                >
                  All ({doctors.length + nurses.length + ambulances.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === 'doctors' && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter('doctors')}
              >
                <MaterialIcons
                  name="person"
                  size={18}
                  color={selectedFilter === 'doctors' ? '#fff' : '#5B5FFF'}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === 'doctors' && styles.filterButtonTextActive,
                  ]}
                >
                  Doctors ({doctors.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === 'nurses' && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter('nurses')}
              >
                <MaterialIcons
                  name="favorite"
                  size={18}
                  color={selectedFilter === 'nurses' ? '#fff' : '#FF6B6B'}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === 'nurses' && styles.filterButtonTextActive,
                  ]}
                >
                  Nurses ({nurses.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === 'ambulances' && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter('ambulances')}
              >
                <MaterialIcons
                  name="local-hospital"
                  size={18}
                  color={selectedFilter === 'ambulances' ? '#fff' : '#FF9800'}
                />
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === 'ambulances' && styles.filterButtonTextActive,
                  ]}
                >
                  Ambulances ({ambulances.length})
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Professionals List */}
          <ScrollView
            ref={scrollRef}
            style={styles.listContainer}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5B5FFF" />
                <Text style={styles.loadingText}>Loading nearby services...</Text>
              </View>
            ) : displayProfessionals().length > 0 ? (
              displayProfessionals().map((professional: any, index: number) => (
                <ProfessionalCard
                  professional={professional}
                  type={professional.type}
                  isSelected={selectedMarker?.id === professional.id || selectedMarker?._id === professional._id}
                  onPress={() => setSelectedMarker(professional)}
                  key={`${professional.type}-${professional.id || professional._id}-${index}`}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="location-off" size={64} color="#DDD" />
                <Text style={styles.emptyText}>No services found in your area</Text>
                <Text style={styles.emptySubtext}>Try expanding your search radius</Text>
              </View>
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  mapOnlyContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  mapToggleButton: {
    padding: 8,
    marginRight: -8,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#EEF2FF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#5B5FFF',
  },
  locationText: {
    fontSize: 12,
    color: '#5B5FFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  mapView: {
    marginTop: 8,
  },
  filterSection: {
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterContent: {
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#5B5FFF',
    borderColor: '#5B5FFF',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B5FFF',
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  professionalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  professionalCardSelected: {
    borderColor: '#5B5FFF',
    elevation: 5,
    shadowOpacity: 0.2,
  },
  professionalIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  professionalDetails: {
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
  ratingRow: {
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
  },
  bookButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height * 0.4,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height * 0.4,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#CCC',
    marginTop: 6,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
});
