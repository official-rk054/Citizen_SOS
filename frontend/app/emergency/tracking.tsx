import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Animated,
  Vibration,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { emergencyAPI, usersAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import * as Location from 'expo-location';
import GoogleMap from '../../components/GoogleMap';

const SOCKET_URL = 'http://localhost:5000';
const { height, width } = Dimensions.get('window');

export default function EmergencyTrackingScreen() {
  const { emergencyId, showNearby, isSOS } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [emergency, setEmergency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<any>(null);
  const [nearbyResponders, setNearbyResponders] = useState({
    doctors: [],
    nurses: [],
    ambulances: [],
  });
  const [selectedResponder, setSelectedResponder] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'responders' | 'contacts' | 'map'>('status');
  const [ambulanceLocation, setAmbulanceLocation] = useState<any>(null);
  const [notifiedNurses, setNotifiedNurses] = useState<string[]>([]);
  const [sosTimestamp, setSosTimestamp] = useState<Date | null>(null);
  const socketRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const heartbeatAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchEmergencyDetails();
    setupSocket();
    getLocation();
    
    if (isSOS === 'true') {
      setSosTimestamp(new Date());
      startSOSAnimations();
      notifyNearbyNurses();
      simulateAmbulanceTracking();
      Vibration.vibrate([0, 100, 50, 100]);
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [emergencyId]);

  const startSOSAnimations = () => {
    // Pulse animation for status badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Expand animation for alert circle
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation for loading indicator
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Heartbeat effect for nearby responders
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartbeatAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnim, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeatAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.delay(500),
      ])
    ).start();
  };

  const notifyNearbyNurses = async () => {
    try {
      if (location) {
        // Get nearby nurses
        const nursesResponse = await usersAPI.getNearbyProfessionals(
          'nurse',
          location.latitude,
          location.longitude,
          2
        );
        
        if (nursesResponse.data && nursesResponse.data.length > 0) {
          const nurseIds = nursesResponse.data.map((nurse: any) => nurse._id);
          setNotifiedNurses(nurseIds);

          // Emit notification through socket
          socketRef.current?.emit('nurse-notification', {
            emergencyId,
            victimId: user?.id,
            victimName: user?.name,
            latitude: location.latitude,
            longitude: location.longitude,
            severity: emergency?.severity || 'critical',
            nurseIds,
            timestamp: new Date(),
            message: 'URGENT: SOS Emergency Alert - Immediate assistance needed',
          });

          // Show notification
          Alert.alert(
            'Nurses Notified',
            `${nursesResponse.data.length} nearby nurse(s) have been notified of the emergency`
          );
        }
      }
    } catch (error) {
      console.error('Error notifying nurses:', error);
    }
  };

  const simulateAmbulanceTracking = () => {
    // Simulate ambulance location updates
    let ambulanceIndex = 0;
    const ambulancePositions = [
      { latitude: emergency?.latitude + 0.01, longitude: emergency?.longitude + 0.01, distance: 2.5 },
      { latitude: emergency?.latitude + 0.008, longitude: emergency?.longitude + 0.008, distance: 1.8 },
      { latitude: emergency?.latitude + 0.005, longitude: emergency?.longitude + 0.005, distance: 1.2 },
      { latitude: emergency?.latitude + 0.002, longitude: emergency?.longitude + 0.002, distance: 0.5 },
    ];

    const interval = setInterval(() => {
      if (ambulanceIndex < ambulancePositions.length) {
        setAmbulanceLocation({
          ...ambulancePositions[ambulanceIndex],
          eta: Math.max(5 - ambulanceIndex * 1.5, 1),
          speed: 40 + Math.random() * 20,
        });
        ambulanceIndex++;
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  };

  const getLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc.coords);
      if (showNearby === 'true') {
        fetchNearbyResponders(loc.coords.latitude, loc.coords.longitude);
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const fetchEmergencyDetails = async () => {
    try {
      const response = await emergencyAPI.getEmergencyDetails(emergencyId as string);
      setEmergency(response.data);
    } catch (error) {
      console.error('Error fetching emergency details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyResponders = async (latitude: number, longitude: number) => {
    try {
      const [doctors, nurses, ambulances] = await Promise.all([
        usersAPI.getNearbyProfessionals('doctor', latitude, longitude, 10),
        usersAPI.getNearbyProfessionals('nurse', latitude, longitude, 10),
        usersAPI.getNearbyAmbulances(latitude, longitude, 10),
      ]);

      setNearbyResponders({
        doctors: doctors.data?.slice(0, 3) || [],
        nurses: nurses.data?.slice(0, 3) || [],
        ambulances: ambulances.data?.slice(0, 2) || [],
      });
    } catch (error) {
      console.error('Error fetching responders:', error);
    }
  };

  const setupSocket = () => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('ambulance-update', (data: any) => {
      if (data.emergencyId === emergencyId) {
        setEmergency((prev: any) => ({ ...prev, ...data }));
      }
    });

    socketRef.current.on('emergency-update', (data: any) => {
      if (data.emergencyId === emergencyId) {
        setEmergency((prev: any) => ({ ...prev, ...data }));
      }
    });

    // Nurse notification listener
    socketRef.current.on('nurse-alert', (data: any) => {
      if (data.emergencyId === emergencyId) {
        console.log('Nurse alert received:', data);
        setNotifiedNurses(data.nurseIds || []);
        Alert.alert('Nurses Notified', `${data.nurseIds?.length || 0} nurse(s) have been alerted for assistance`);
      }
    });

    // Direct nurse alert listener
    socketRef.current.on('direct-nurse-alert', (data: any) => {
      if (data.emergencyId === emergencyId) {
        console.log('Direct nurse alert received:', data);
        Alert.alert('Emergency Response', 'Nearby nurses are responding to your location');
      }
    });

    // Responder calling listener
    socketRef.current.on('responder-calling', (data: any) => {
      if (data.emergencyId === emergencyId) {
        console.log('Responder calling:', data);
        Alert.alert('Incoming Call', `${data.responderName} is calling you...`);
      }
    });
  };

  const handleEmergencyResolved = async () => {
    Alert.alert(
      'Resolve Emergency',
      'Mark this emergency as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: async () => {
            try {
              await emergencyAPI.updateEmergencyStatus(emergencyId as string, 'completed');
              Alert.alert('Success', 'Emergency resolved', [
                { text: 'OK', onPress: () => router.replace('/(tabs)') },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to resolve emergency');
            }
          },
        },
      ]
    );
  };

  const handleCallResponder = (responder: any) => {
    Alert.alert(
      'Call Responder',
      `Call ${responder.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            socketRef.current?.emit('responder-call', {
              emergencyId,
              responderId: responder._id,
              responderName: responder.name,
              responderPhone: responder.phone,
            });
            Alert.alert(
              'Call Initiated',
              `Calling ${responder.name}...`
            );
          },
        },
      ]
    );
  };

  const ResponderCard = ({ responder, type }: { responder: any; type: string }) => {
    const distance = (Math.random() * 5).toFixed(1);
    const eta = Math.floor(Math.random() * 8) + 2;

    const getResponderIcon = () => {
      if (type === 'ambulance') return '🚑';
      if (type === 'nurse') return '👩‍⚕️';
      return '👨‍⚕️';
    };

    const getResponderColor = () => {
      if (type === 'ambulance') return '#F44336';
      if (type === 'nurse') return '#E91E63';
      return '#1976D2';
    };

    return (
      <TouchableOpacity
        style={styles.responderCard}
        onPress={() => handleCallResponder(responder)}
        activeOpacity={0.7}
      >
        <View style={[styles.responderIcon, { backgroundColor: getResponderColor() }]}>
          <Text style={styles.responderIconText}>{getResponderIcon()}</Text>
        </View>
        <View style={styles.responderInfo}>
          <Text style={styles.responderName}>{responder.name}</Text>
          <Text style={styles.responderType}>
            {type === 'ambulance' ? 'Ambulance Service' : 'Specialization: ' + (responder.specialization || 'General')}
          </Text>
          <View style={styles.responderMeta}>
            <AntDesign name="star" size={12} color="#FFC107" />
            <Text style={styles.responderRating}>4.{Math.floor(Math.random() * 9) + 1}</Text>
            <Text style={styles.responderDistance}>• {distance} km</Text>
            <Text style={styles.responderETA}>• ETA {eta}m</Text>
          </View>
        </View>
        <View style={styles.callButton}>
          <MaterialIcons name="call" size={20} color="#fff" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53935" />
          <Text style={styles.loadingText}>Loading emergency details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Emergency Status */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonSmall}
          onPress={() => router.back()}
        >
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Animated.View
            style={[
              styles.statusBadge,
              isSOS === 'true' && {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Text style={styles.statusText}>
              {emergency?.status?.toUpperCase() || 'ACTIVE'}
            </Text>
          </Animated.View>
          <Text style={styles.headerTitle}>Emergency Response</Text>
        </View>
      </View>

      {/* Live Location & Timer */}
      <View style={styles.liveBar}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.timerText}>
          {location ? `Lat: ${location.latitude.toFixed(4)}, Lon: ${location.longitude.toFixed(4)}` : 'Getting location...'}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'status' && styles.tabActive]}
          onPress={() => setActiveTab('status')}
        >
          <MaterialIcons
            name="info"
            size={20}
            color={activeTab === 'status' ? '#E53935' : '#999'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'status' && styles.tabLabelActive,
            ]}
          >
            Status
          </Text>
        </TouchableOpacity>

        {isSOS === 'true' && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'map' && styles.tabActive]}
            onPress={() => setActiveTab('map')}
          >
            <MaterialIcons
              name="map"
              size={20}
              color={activeTab === 'map' ? '#E53935' : '#999'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'map' && styles.tabLabelActive,
              ]}
            >
              Live Map
            </Text>
          </TouchableOpacity>
        )}

        {showNearby === 'true' && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'responders' && styles.tabActive]}
            onPress={() => setActiveTab('responders')}
          >
            <MaterialIcons
              name="people"
              size={20}
              color={activeTab === 'responders' ? '#E53935' : '#999'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'responders' && styles.tabLabelActive,
              ]}
            >
              Responders
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.tab, activeTab === 'contacts' && styles.tabActive]}
          onPress={() => setActiveTab('contacts')}
        >
          <MaterialIcons
            name="phone"
            size={20}
            color={activeTab === 'contacts' ? '#E53935' : '#999'}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'contacts' && styles.tabLabelActive,
            ]}
          >
            Contacts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.contentArea}
        contentContainerStyle={styles.contentPadding}
        showsVerticalScrollIndicator={false}
        scrollEnabled={activeTab !== 'map'}
      >
        {activeTab === 'status' && (
          <View>
            {/* SOS Status Indicator */}
            {isSOS === 'true' && (
              <View style={styles.sosAlertCard}>
                <Animated.View
                  style={[
                    styles.sosAlertCircle,
                    { transform: [{ scale: scaleAnim }] },
                  ]}
                />
                <View style={styles.sosAlertContent}>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Text style={styles.sosAlertIcon}>🆘</Text>
                  </Animated.View>
                  <View style={styles.sosAlertText}>
                    <Text style={styles.sosAlertTitle}>SOS ACTIVE</Text>
                    <Text style={styles.sosAlertTime}>
                      {sosTimestamp ? new Date(sosTimestamp).toLocaleTimeString() : 'Just now'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Ambulance Tracking */}
            {ambulanceLocation && (
              <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>🚑</Text>
                  <Text style={styles.cardTitle}>Ambulance En Route</Text>
                  <Animated.View
                    style={[
                      styles.trackingIndicator,
                      { transform: [{ rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }) }] },
                    ]}
                  >
                    <MaterialIcons name="my-location" size={16} color="#E53935" />
                  </Animated.View>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.ambulanceStatus}>
                    <View style={styles.statusRow}>
                      <Text style={styles.statusLabel}>Distance:</Text>
                      <Text style={styles.statusValue}>{ambulanceLocation.distance?.toFixed(1)} km</Text>
                    </View>
                    <View style={styles.statusRow}>
                      <Text style={styles.statusLabel}>ETA:</Text>
                      <Text style={styles.statusValue}>{ambulanceLocation.eta?.toFixed(0)} min</Text>
                    </View>
                    <View style={styles.statusRow}>
                      <Text style={styles.statusLabel}>Speed:</Text>
                      <Text style={styles.statusValue}>{ambulanceLocation.speed?.toFixed(0)} km/h</Text>
                    </View>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min((ambulanceLocation.distance / 2.5) * 100, 100)}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Nurse Notification Status */}
            {notifiedNurses.length > 0 && (
              <Animated.View
                style={[
                  styles.infoCard,
                  { transform: [{ scale: heartbeatAnim }] },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>👩‍⚕️</Text>
                  <Text style={styles.cardTitle}>Nurses Notified</Text>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.notificationBadges}>
                    {notifiedNurses.map((nurseId, idx) => (
                      <View key={idx} style={styles.notificationBadge}>
                        <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                        <Text style={styles.badgeText}>Nurse {idx + 1} Alerted</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.notificationMessage}>
                    Nearby nurses have been notified and are responding to your location
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* Assigned Ambulance */}
            {emergency?.assignedAmbulanceId && (
              <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>🚑</Text>
                  <Text style={styles.cardTitle}>Assigned Ambulance</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardValue}>
                    {emergency.assignedAmbulanceId.name || 'Ambulance Service'}
                  </Text>
                  <Text style={styles.cardLabel}>
                    Driver: {emergency.assignedAmbulanceId.operatorName || 'Unknown'}
                  </Text>
                  <Text style={styles.cardLabel}>
                    Contact: {emergency.assignedAmbulanceId.phone}
                  </Text>
                  <View style={styles.etaBox}>
                    <MaterialIcons name="schedule" size={16} color="#E53935" />
                    <Text style={styles.etaText}>ETA: 4-6 minutes</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Assigned Nurse */}
            {emergency?.assignedNurseId && (
              <View style={styles.infoCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>👩‍⚕️</Text>
                  <Text style={styles.cardTitle}>Assigned Nurse</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardValue}>{emergency.assignedNurseId.name}</Text>
                  <Text style={styles.cardLabel}>
                    Contact: {emergency.assignedNurseId.phone}
                  </Text>
                </View>
              </View>
            )}

            {/* Emergency Location */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>📍</Text>
                <Text style={styles.cardTitle}>Emergency Location</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.coordBox}>
                  <Text style={styles.coordLabel}>Latitude</Text>
                  <Text style={styles.coordValue}>
                    {emergency?.latitude?.toFixed(6) || 'N/A'}
                  </Text>
                </View>
                <View style={styles.coordBox}>
                  <Text style={styles.coordLabel}>Longitude</Text>
                  <Text style={styles.coordValue}>
                    {emergency?.longitude?.toFixed(6) || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Emergency Info */}
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>⚠️</Text>
                <Text style={styles.cardTitle}>Emergency Details</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Severity: {emergency?.severity?.toUpperCase()}</Text>
                <Text style={styles.cardLabel}>Description: {emergency?.description}</Text>
                <Text style={styles.cardLabel}>
                  Time: {new Date(emergency?.createdAt).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'map' && (
          <View style={styles.mapContainer}>
            {location && (
              <GoogleMap
                initialLocation={location}
                markers={[
                  {
                    id: 'victim',
                    latitude: location.latitude,
                    longitude: location.longitude,
                    title: 'Your Location',
                    description: 'Emergency Location',
                    type: 'emergency',
                  },
                  ...(ambulanceLocation ? [{
                    id: 'ambulance',
                    latitude: ambulanceLocation.latitude,
                    longitude: ambulanceLocation.longitude,
                    title: 'Ambulance',
                    description: 'Responding to emergency',
                    type: 'ambulance',
                  }] : []),
                  ...nearbyResponders.ambulances.map((ambulance: any) => ({
                    id: ambulance._id,
                    latitude: ambulance.latitude || location.latitude,
                    longitude: ambulance.longitude || location.longitude,
                    title: ambulance.name || 'Ambulance',
                    description: ambulance.vehicleNumber || 'Available',
                    type: 'ambulance',
                  })),
                  ...nearbyResponders.nurses.map((nurse: any) => ({
                    id: nurse._id,
                    latitude: nurse.latitude || location.latitude,
                    longitude: nurse.longitude || location.longitude,
                    title: nurse.name || 'Nurse',
                    description: 'Medical Professional',
                    type: 'nurse',
                  })),
                ]}
                showUserLocation={true}
                onMarkerPress={(marker) => {
                  if (marker.id !== 'victim') {
                    setSelectedResponder({
                      id: marker.id,
                      name: marker.title,
                      type: marker.type,
                    });
                  }
                }}
                showRadius={true}
                radiusKm={5}
                mapHeight={height * 0.5}
              />
            )}
            
            {!location && (
              <View style={styles.mapLoadingContainer}>
                <ActivityIndicator size="large" color="#E53935" />
                <Text style={styles.mapLoadingText}>Loading map...</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'map' && (
          <View style={styles.mapLegendContainer}>
            {/* Map Legend */}
            <View style={styles.mapLegend}>
              <View style={styles.legendItem}>
                <Text style={styles.legendIcon}>📍</Text>
                <Text style={styles.legendText}>Your Location</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={styles.legendIcon}>🚑</Text>
                <Text style={styles.legendText}>Ambulance</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={styles.legendIcon}>👩‍⚕️</Text>
                <Text style={styles.legendText}>Nearby Nurses</Text>
              </View>
            </View>

            {/* Real-time Info */}
            <View style={styles.realtimeInfo}>
              <View style={styles.realtimeRow}>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
                <Text style={styles.realtimeValue}>Tracking Active</Text>
              </View>
              <View style={styles.realtimeRow}>
                <MaterialIcons name="location-on" size={16} color="#E53935" />
                <Text style={styles.realtimeValue}>
                  {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Getting location...'}
                </Text>
              </View>
              {ambulanceLocation && (
                <View style={styles.realtimeRow}>
                  <MaterialIcons name="directions-car" size={16} color="#F44336" />
                  <Text style={styles.realtimeValue}>Distance: {ambulanceLocation.distance?.toFixed(1)} km</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {activeTab === 'responders' && showNearby === 'true' && (
          <View>
            <Text style={styles.sectionTitle}>Nearby Responders</Text>

            {/* Ambulances */}
            {nearbyResponders.ambulances.length > 0 && (
              <View style={styles.responderSection}>
                <Text style={styles.responderSectionTitle}>🚑 Ambulances</Text>
                {nearbyResponders.ambulances.map((ambulance, idx) => (
                  <ResponderCard
                    key={idx}
                    responder={ambulance}
                    type="ambulance"
                  />
                ))}
              </View>
            )}

            {/* Doctors */}
            {nearbyResponders.doctors.length > 0 && (
              <View style={styles.responderSection}>
                <Text style={styles.responderSectionTitle}>👨‍⚕️ Nearby Doctors</Text>
                {nearbyResponders.doctors.map((doctor, idx) => (
                  <ResponderCard
                    key={idx}
                    responder={doctor}
                    type="doctor"
                  />
                ))}
              </View>
            )}

            {/* Nurses */}
            {nearbyResponders.nurses.length > 0 && (
              <View style={styles.responderSection}>
                <Text style={styles.responderSectionTitle}>👩‍⚕️ Nearby Nurses</Text>
                {nearbyResponders.nurses.map((nurse, idx) => (
                  <ResponderCard
                    key={idx}
                    responder={nurse}
                    type="nurse"
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'contacts' && (
          <View>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            {user?.emergencyContacts && user.emergencyContacts.length > 0 ? (
              user.emergencyContacts.map((contact: any, idx: number) => (
                <View key={idx} style={styles.contactCard}>
                  <View style={styles.contactIcon}>
                    <MaterialIcons name="person" size={24} color="#fff" />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactRelation}>{contact.relation}</Text>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                  </View>
                  <TouchableOpacity style={styles.contactCallBtn}>
                    <MaterialIcons name="call" size={18} color="#E53935" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noContactsText}>No emergency contacts added</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        {emergency?.status !== 'completed' && (
          <TouchableOpacity
            style={styles.resolveButton}
            onPress={handleEmergencyResolved}
          >
            <MaterialIcons name="check-circle" size={20} color="#fff" />
            <Text style={styles.resolveButtonText}>Resolved</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <MaterialIcons name="home" size={20} color="#fff" />
          <Text style={styles.homeButtonText}>Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  sosAlertCard: {
    backgroundColor: '#FFEBEE',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E53935',
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  sosAlertCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#E53935',
    opacity: 0.3,
  },
  sosAlertContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sosAlertIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  sosAlertText: {
    flex: 1,
  },
  sosAlertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53935',
  },
  sosAlertTime: {
    fontSize: 12,
    color: '#D32F2F',
    marginTop: 4,
  },
  trackingIndicator: {
    marginLeft: 'auto',
  },
  ambulanceStatus: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E53935',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#EBEBEB',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  notificationBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  notificationBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 6,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
  },
  mapContainer: {
    flex: 1,
    padding: 0,
    paddingBottom: 80,
  },
  mockMapViewer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 12,
    elevation: 3,
    minHeight: 400,
  },
  mapHeader: {
    backgroundColor: '#E53935',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  mapContent: {
    position: 'relative',
    width: '100%',
    height: 280,
    backgroundColor: '#E8F5E9',
    overflow: 'hidden',
  },
  mapGrid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  mapGridRow: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  mapGridCell: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#C8E6C9',
  },
  victimMarker: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    left: '50%',
    top: '50%',
    marginLeft: -25,
    marginTop: -25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 57, 53, 0.2)',
    borderWidth: 2,
    borderColor: '#E53935',
  },
  victimInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  victimIcon: {
    fontSize: 16,
  },
  ambulanceMarker: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderWidth: 2,
    borderColor: '#F44336',
  },
  ambulanceInner: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ambulanceIcon: {
    fontSize: 18,
  },
  nurseMarker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    borderWidth: 2,
    borderColor: '#E91E63',
  },
  nurseInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nurseIcon: {
    fontSize: 16,
  },
  mapLegend: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    alignItems: 'center',
  },
  legendIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  realtimeInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
  },
  realtimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  realtimeValue: {
    marginLeft: 8,
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#E53935',
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  backButtonSmall: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  liveBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E53935',
    marginRight: 6,
  },
  liveText: {
    color: '#E53935',
    fontSize: 11,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabActive: {
    borderBottomColor: '#E53935',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginLeft: 6,
  },
  tabLabelActive: {
    color: '#E53935',
  },
  contentArea: {
    flex: 1,
  },
  contentPadding: {
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E53935',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    marginVertical: 4,
  },
  etaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  etaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E65100',
    marginLeft: 8,
  },
  coordBox: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  coordLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
    fontWeight: '500',
  },
  coordValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'monospace',
  },
  responderSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  responderSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  responderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  responderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  responderIconText: {
    fontSize: 24,
  },
  responderInfo: {
    flex: 1,
  },
  responderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  responderType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  responderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  responderRating: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  responderDistance: {
    fontSize: 11,
    color: '#999',
  },
  responderETA: {
    fontSize: 11,
    color: '#E53935',
    fontWeight: '600',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  contactRelation: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  contactPhone: {
    fontSize: 12,
    color: '#E53935',
    fontWeight: '600',
    marginTop: 2,
  },
  contactCallBtn: {
    padding: 8,
  },
  noContactsText: {
    textAlign: 'center',
    color: '#999',
    padding: 32,
    fontSize: 14,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  resolveButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resolveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  homeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#999',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
});
