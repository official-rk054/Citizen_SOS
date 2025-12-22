import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function AuthTypeScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const userTypes = [
    {
      id: 'user',
      label: 'Patient',
      icon: '👤',
      description: 'Book appointments and get medical assistance',
      color: '#5B5FFF',
    },
    {
      id: 'doctor',
      label: 'Doctor',
      icon: '👨‍⚕️',
      description: 'Manage appointments and patient consultations',
      color: '#4CAF50',
    },
    {
      id: 'nurse',
      label: 'Nurse',
      icon: '👩‍⚕️',
      description: 'Provide home care and support services',
      color: '#FF6B6B',
    },
    {
      id: 'ambulance',
      label: 'Ambulance Driver',
      icon: '🚑',
      description: 'Respond to emergency calls',
      color: '#FF9800',
    },
    {
      id: 'volunteer',
      label: 'Volunteer',
      icon: '🙋‍♂️',
      description: 'Help in emergency situations',
      color: '#2196F3',
    },
  ];

  const handleSelect = (typeId: string) => {
    setSelectedType(typeId);
    setTimeout(() => {
      router.push({
        pathname: '/auth/login',
        params: { userType: typeId },
      });
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏥</Text>
          <Text style={styles.title}>Welcome to SmartHealth</Text>
          <Text style={styles.subtitle}>Choose your role to continue</Text>
        </View>

        <View style={styles.content}>
          {userTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.card,
                {
                  borderColor: type.color,
                  backgroundColor:
                    selectedType === type.id
                      ? `${type.color}20`
                      : '#F8F9FF',
                },
              ]}
              onPress={() => handleSelect(type.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <Text style={styles.icon}>{type.icon}</Text>
                <View style={styles.textContainer}>
                  <Text style={styles.cardLabel}>{type.label}</Text>
                  <Text style={styles.cardDescription}>
                    {type.description}
                  </Text>
                </View>
                {selectedType === type.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Having trouble? Contact support
          </Text>
          <TouchableOpacity>
            <Text style={styles.supportLink}>Get Help</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  content: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    fontSize: 40,
  },
  textContainer: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#666',
  },
  checkmark: {
    fontSize: 24,
    color: '#4CAF50',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  footerText: {
    color: '#999',
    fontSize: 14,
  },
  supportLink: {
    color: '#5B5FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
