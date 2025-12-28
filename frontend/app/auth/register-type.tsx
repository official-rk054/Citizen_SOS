import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterTypeScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(20));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const types = [
    { id: 'user', label: 'Patient', icon: '👤', description: 'Book appointments and get medical assistance', color: '#5B5FFF' },
    { id: 'doctor', label: 'Doctor', icon: '👨‍⚕️', description: 'Manage appointments and patient consultations', color: '#4CAF50' },
    { id: 'nurse', label: 'Nurse', icon: '👩‍⚕️', description: 'Provide home care and support services', color: '#FF6B6B' },
    { id: 'ambulance', label: 'Ambulance Service', icon: '🚑', description: 'Respond to emergency calls', color: '#FF9800' },
    { id: 'volunteer', label: 'Volunteer', icon: '🙋‍♂️', description: 'Help in emergency situations', color: '#2196F3' },
  ];

  const handleNext = () => {
    if (selectedType) {
      router.push({
        pathname: '/auth/register-details',
        params: { userType: selectedType },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoBadge}>
            <Text style={styles.logo}>🏥</Text>
          </View>
          <Text style={styles.title}>Join SmartHealth</Text>
          <Text style={styles.subtitle}>Select your role to get started</Text>
        </Animated.View>

        <Animated.View style={[styles.optionsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {types.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionCard,
                {
                  borderColor: selectedType === type.id ? type.color : '#E0E4FF',
                  backgroundColor: selectedType === type.id 
                    ? `${type.color}12` 
                    : '#F8F9FF',
                  borderWidth: selectedType === type.id ? 2 : 1.5,
                  shadowColor: selectedType === type.id ? type.color : '#000',
                  shadowOpacity: selectedType === type.id ? 0.15 : 0.08,
                },
              ]}
              onPress={() => setSelectedType(type.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${type.color}15` }]}>
                <Text style={styles.optionIcon}>{type.icon}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.optionLabel, { color: type.color }]}>{type.label}</Text>
                <Text style={styles.optionDescription}>{type.description}</Text>
              </View>
              {selectedType === type.id && (
                <View style={[styles.checkmarkContainer, { backgroundColor: type.color }]}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>

        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={[styles.nextButton, !selectedType && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!selectedType}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.loginLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#5B5FFF',
    opacity: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  optionCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIcon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  optionDescription: {
    fontSize: 12,
    color: '#888',
    lineHeight: 16,
  },
  checkmarkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
  footer: {
    marginTop: 16,
  },
  nextButton: {
    backgroundColor: '#5B5FFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#5B5FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#DDD',
    shadowOpacity: 0,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#888',
    fontSize: 14,
  },
  loginLink: {
    color: '#5B5FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
