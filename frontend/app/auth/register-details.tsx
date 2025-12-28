import React, { useState, useEffect } from 'react';
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
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function RegisterDetailsScreen() {
  const { userType } = useLocalSearchParams();
  const router = useRouter();
  const { register, loading } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <TouchableOpacity 
              onPress={() => router.push('/auth/register-type')}
              style={styles.backButtonContainer}
            >
              <Text style={styles.backButton}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <View style={styles.logoBadge}>
                <Text style={styles.logo}>🏥</Text>
              </View>
            </View>

            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Register as {typeof userType === 'string' ? userType.charAt(0).toUpperCase() + userType.slice(1) : 'User'}</Text>
          </Animated.View>

          <Animated.View style={[styles.form, { opacity: fadeAnim }]}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  value={formData.name}
                  onChangeText={(value) => handleChange('name', value)}
                />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  keyboardType="email-address"
                  placeholderTextColor="#999"
                  value={formData.email}
                  onChangeText={(value) => handleChange('email', value)}
                />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                  value={formData.phone}
                  onChangeText={(value) => handleChange('phone', value)}
                />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry
                  placeholderTextColor="#999"
                  value={formData.password}
                  onChangeText={(value) => handleChange('password', value)}
                />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  secureTextEntry
                  placeholderTextColor="#999"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleChange('confirmPassword', value)}
                />
              </View>
            </View>

            {/* Professional Details for Doctor/Nurse */}
            {(userType === 'doctor' || userType === 'nurse') && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Professional Details</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="License Number"
                    placeholderTextColor="#999"
                    value={formData.licenseNumber}
                    onChangeText={(value) => handleChange('licenseNumber', value)}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Specialization"
                    placeholderTextColor="#999"
                    value={formData.specialization}
                    onChangeText={(value) => handleChange('specialization', value)}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Years of Experience"
                    keyboardType="number-pad"
                    placeholderTextColor="#999"
                    value={formData.yearsOfExperience}
                    onChangeText={(value) => handleChange('yearsOfExperience', value)}
                  />
                </View>
              </View>
            )}

            {/* Ambulance Service Details */}
            {userType === 'ambulance' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ambulance Details</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ambulance Type (Basic/Advanced)"
                    placeholderTextColor="#999"
                    value={formData.ambulanceType}
                    onChangeText={(value) => handleChange('ambulanceType', value)}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Vehicle Number"
                    placeholderTextColor="#999"
                    value={formData.vehicleNumber}
                    onChangeText={(value) => handleChange('vehicleNumber', value)}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Operator Name"
                    placeholderTextColor="#999"
                    value={formData.operatorName}
                    onChangeText={(value) => handleChange('operatorName', value)}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Operator Phone"
                    keyboardType="phone-pad"
                    placeholderTextColor="#999"
                    value={formData.operatorPhone}
                    onChangeText={(value) => handleChange('operatorPhone', value)}
                  />
                </View>
              </View>
            )}

            {/* Emergency Contacts */}
            {userType === 'user' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emergency Contact</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Contact Name"
                    placeholderTextColor="#999"
                    value={formData.emergencyContact1Name}
                    onChangeText={(value) => handleChange('emergencyContact1Name', value)}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Contact Phone"
                    keyboardType="phone-pad"
                    placeholderTextColor="#999"
                    value={formData.emergencyContact1Phone}
                    onChangeText={(value) => handleChange('emergencyContact1Phone', value)}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Relationship"
                    placeholderTextColor="#999"
                    value={formData.emergencyContact1Relation}
                    onChangeText={(value) => handleChange('emergencyContact1Relation', value)}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButton: {
    color: '#5B5FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoContainer: {
    marginVertical: 12,
    alignItems: 'center',
  },
  logoBadge: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#5B5FFF',
    opacity: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 6,
  },
  form: {
    marginTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#333',
    marginBottom: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: '#E0E4FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFF',
    height: 46,
    marginBottom: 10,
    justifyContent: 'center',
    shadowColor: '#5B5FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  registerButton: {
    backgroundColor: '#5B5FFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
    shadowColor: '#5B5FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
