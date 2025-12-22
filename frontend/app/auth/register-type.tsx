import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterTypeScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const types = [
    { id: 'user', label: 'User/Patient', icon: '👤', description: 'I need medical help' },
    { id: 'doctor', label: 'Doctor', icon: '👨‍⚕️', description: 'I am a doctor' },
    { id: 'nurse', label: 'Nurse', icon: '👩‍⚕️', description: 'I am a nurse' },
    { id: 'ambulance', label: 'Ambulance Service', icon: '🚑', description: 'Ambulance provider' },
    { id: 'volunteer', label: 'Volunteer', icon: '🤝', description: 'I want to help others' },
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Join Smart Healthcare</Text>
          <Text style={styles.subtitle}>Select your role to get started</Text>
        </View>

        <View style={styles.optionsContainer}>
          {types.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionCard,
                selectedType === type.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Text style={styles.optionIcon}>{type.icon}</Text>
              <Text style={styles.optionLabel}>{type.label}</Text>
              <Text style={styles.optionDescription}>{type.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextButton, !selectedType && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selectedType}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={styles.loginLink}>Already have an account? Login</Text>
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
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  optionsContainer: {
    marginBottom: 40,
  },
  optionCard: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#FF0000',
    backgroundColor: '#ffe6e6',
  },
  optionIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginLink: {
    textAlign: 'center',
    color: '#FF0000',
    fontSize: 16,
    marginTop: 20,
  },
});
