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
  const [activeTab, setActiveTab] = useState<'status' | 'responders' | 'contacts'>('status');
  const socketRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchEmergencyDetails();
    setupSocket();
    getLocation();

    // Pulse animation for active emergency
    if (isSOS === 'true') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [emergencyId]);

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
      >
        {activeTab === 'status' && (
          <View>
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
