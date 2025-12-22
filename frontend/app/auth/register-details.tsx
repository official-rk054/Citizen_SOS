import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function RegisterDetailsScreen() {
  const { userType } = useLocalSearchParams();
  const router = useRouter();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    specialization: '',
    yearsOfExperience: '',
    ambulanceType: '',
    vehicleNumber: '',
    operatorName: '',
    operatorPhone: '',
    emergencyContact1Name: '',
    emergencyContact1Phone: '',
    emergencyContact1Relation: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const emergencyContacts = [];
      if (formData.emergencyContact1Name && formData.emergencyContact1Phone) {
        emergencyContacts.push({
          name: formData.emergencyContact1Name,
          phone: formData.emergencyContact1Phone,
          relationship: formData.emergencyContact1Relation,
        });
      }

      const userData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType,
        emergencyContacts,
      };

      if (userType === 'doctor' || userType === 'nurse') {
        userData.licenseNumber = formData.licenseNumber;
        userData.specialization = formData.specialization;
        userData.yearsOfExperience = parseInt(formData.yearsOfExperience, 10);
      }

      if (userType === 'ambulance') {
        userData.ambulanceType = formData.ambulanceType;
        userData.vehicleNumber = formData.vehicleNumber;
        userData.operatorName = formData.operatorName;
        userData.operatorPhone = formData.operatorPhone;
      }

      await register(userData);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Error', error.response?.data?.error || 'Failed to register');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Register as {userType}</Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(value) => handleChange('phone', value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
          />
        </View>

        {/* Professional Details for Doctor/Nurse */}
        {(userType === 'doctor' || userType === 'nurse') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Details</Text>
            <TextInput
              style={styles.input}
              placeholder="License Number"
              value={formData.licenseNumber}
              onChangeText={(value) => handleChange('licenseNumber', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Specialization"
              value={formData.specialization}
              onChangeText={(value) => handleChange('specialization', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Years of Experience"
              keyboardType="number-pad"
              value={formData.yearsOfExperience}
              onChangeText={(value) => handleChange('yearsOfExperience', value)}
            />
          </View>
        )}

        {/* Ambulance Service Details */}
        {userType === 'ambulance' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ambulance Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Ambulance Type (Basic/Advanced)"
              value={formData.ambulanceType}
              onChangeText={(value) => handleChange('ambulanceType', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Vehicle Number"
              value={formData.vehicleNumber}
              onChangeText={(value) => handleChange('vehicleNumber', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Operator Name"
              value={formData.operatorName}
              onChangeText={(value) => handleChange('operatorName', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Operator Phone"
              keyboardType="phone-pad"
              value={formData.operatorPhone}
              onChangeText={(value) => handleChange('operatorPhone', value)}
            />
          </View>
        )}

        {/* Emergency Contacts */}
        {userType === 'user' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="Contact Name"
              value={formData.emergencyContact1Name}
              onChangeText={(value) => handleChange('emergencyContact1Name', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Phone"
              keyboardType="phone-pad"
              value={formData.emergencyContact1Phone}
              onChangeText={(value) => handleChange('emergencyContact1Phone', value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Relationship"
              value={formData.emergencyContact1Relation}
              onChangeText={(value) => handleChange('emergencyContact1Relation', value)}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Create Account</Text>
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
    padding: 20,
  },
  header: {
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
