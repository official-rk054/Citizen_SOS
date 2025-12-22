import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { emergencyAPI } from '../../utils/api';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export default function EmergencyTrackingScreen() {
  const { emergencyId } = useLocalSearchParams();
  const router = useRouter();
  const [emergency, setEmergency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    fetchEmergencyDetails();
    setupSocket();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [emergencyId]);

  const fetchEmergencyDetails = async () => {
    try {
      const response = await emergencyAPI.getEmergencyDetails(emergencyId as string);
      setEmergency(response.data);
    } catch (error) {
      console.error('Error fetching emergency details:', error);
      Alert.alert('Error', 'Failed to load emergency details');
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('ambulance-update', (data: any) => {
      if (data.emergencyId === emergencyId) {
        setEmergency((prev: any) => ({ ...prev, ...data }));
      }
    });
  };

  const handleEmergencyResolved = async () => {
    try {
      await emergencyAPI.updateEmergencyStatus(emergencyId as string, 'completed');
      Alert.alert('Success', 'Emergency marked as resolved', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (error) {
      console.error('Error updating emergency:', error);
      Alert.alert('Error', 'Failed to update emergency status');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Emergency Tracking</Text>
        </View>

        {/* Emergency Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Status</Text>
          <View
            style={[
              styles.statusBadge,
              emergency?.status === 'active' && { backgroundColor: '#FF0000' },
              emergency?.status === 'responding' && { backgroundColor: '#FF8800' },
              emergency?.status === 'completed' && { backgroundColor: '#4caf50' },
            ]}
          >
            <Text style={styles.statusText}>{emergency?.status?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Assigned Ambulance */}
        {emergency?.assignedAmbulanceId && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🚑 Assigned Ambulance</Text>
            <Text style={styles.infoText}>
              {emergency.assignedAmbulanceId.vehicleNumber}
            </Text>
            <Text style={styles.infoSubText}>
              Driver: {emergency.assignedAmbulanceId.operatorName}
            </Text>
            <Text style={styles.infoSubText}>
              Contact: {emergency.assignedAmbulanceId.operatorPhone}
            </Text>
            <Text style={styles.eta}>ETA: 5 minutes</Text>
          </View>
        )}

        {/* Assigned Nurse */}
        {emergency?.assignedNurseId && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>👩‍⚕️ Assigned Nurse</Text>
            <Text style={styles.infoText}>{emergency.assignedNurseId.name}</Text>
            <Text style={styles.infoSubText}>
              Contact: {emergency.assignedNurseId.phone}
            </Text>
          </View>
        )}

        {/* Alerted Volunteers Count */}
        {emergency?.alertedVolunteerIds?.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🤝 Nearby Volunteers</Text>
            <Text style={styles.infoText}>
              {emergency.alertedVolunteerIds.length} volunteers alerted
            </Text>
            <Text style={styles.infoSubText}>
              Nearby residents have been notified
            </Text>
          </View>
        )}

        {/* Emergency Location */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📍 Location</Text>
          <Text style={styles.infoSubText}>
            Lat: {emergency?.latitude?.toFixed(4)}
          </Text>
          <Text style={styles.infoSubText}>
            Long: {emergency?.longitude?.toFixed(4)}
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.callButton}>
          <Text style={styles.callButtonText}>📞 Call Ambulance</Text>
        </TouchableOpacity>

        {emergency?.status !== 'completed' && (
          <TouchableOpacity
            style={styles.resolveButton}
            onPress={handleEmergencyResolved}
          >
            <Text style={styles.resolveButtonText}>✓ Emergency Resolved</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
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
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
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
  statusCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0000',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoSubText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  eta: {
    fontSize: 12,
    color: '#FF0000',
    fontWeight: '600',
    marginTop: 8,
  },
  callButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resolveButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  resolveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#999',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
