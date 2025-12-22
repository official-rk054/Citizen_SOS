import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Linking,
  FlatList,
} from 'react-native';

const contactChannels = [
  {
    id: '1',
    name: 'Customer Support',
    phone: '+91 98765 43210',
    email: 'support@smarthealth.com',
    hours: '24/7',
    icon: '📞',
  },
  {
    id: '2',
    name: 'Emergency Hotline',
    phone: '+91 98765 43210',
    email: 'emergency@smarthealth.com',
    hours: '24/7',
    icon: '🚑',
  },
  {
    id: '3',
    name: 'Billing Support',
    phone: '+91 98765 43210',
    email: 'billing@smarthealth.com',
    hours: '9 AM - 6 PM',
    icon: '💳',
  },
  {
    id: '4',
    name: 'Technical Support',
    phone: '+91 98765 43210',
    email: 'tech@smarthealth.com',
    hours: '10 AM - 8 PM',
    icon: '🛠️',
  },
];

export default function ContactUsScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!name || !email || !message) {
      alert('Please fill in all fields');
      return;
    }
    Linking.openURL(
      `mailto:support@smarthealth.com?subject=Contact%20from%20${encodeURIComponent(
        name
      )}&body=${encodeURIComponent(message)}`
    );
  };

  const renderContactChannel = ({ item }: { item: (typeof contactChannels)[0] }) => (
    <View style={styles.channelCard}>
      <Text style={styles.channelIcon}>{item.icon}</Text>
      <View style={styles.channelInfo}>
        <Text style={styles.channelName}>{item.name}</Text>
        <View style={styles.channelDetails}>
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${item.phone}`)}
          >
            <Text style={styles.detailLink}>📞 {item.phone}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(`mailto:${item.email}`)
            }
          >
            <Text style={styles.detailLink}>✉️ {item.email}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hoursText}>⏰ {item.hours}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📞 Contact Us</Text>
          <Text style={styles.subtitle}>We're always here to help</Text>
        </View>

        {/* Quick Contact Buttons */}
        <View style={styles.quickButtons}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => Linking.openURL('tel:+919876543210')}
          >
            <Text style={styles.quickIcon}>📞</Text>
            <Text style={styles.quickLabel}>Call Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() =>
              Linking.openURL('mailto:support@smarthealth.com')
            }
          >
            <Text style={styles.quickIcon}>📧</Text>
            <Text style={styles.quickLabel}>Email Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickButton}>
            <Text style={styles.quickIcon}>💬</Text>
            <Text style={styles.quickLabel}>Chat Now</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Channels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Channels</Text>
          <FlatList
            data={contactChannels}
            renderItem={renderContactChannel}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send Us a Message</Text>
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Your Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Tell us how we can help..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View>

        {/* Location Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Offices</Text>
          <View style={styles.officeCard}>
            <Text style={styles.officeIcon}>🏢</Text>
            <View>
              <Text style={styles.officeName}>Headquarters</Text>
              <Text style={styles.officeAddress}>
                123 Medical Plaza, Healthcare City{'\n'}
                New York, NY 10001{'\n'}
                United States
              </Text>
            </View>
          </View>
          <View style={styles.officeCard}>
            <Text style={styles.officeIcon}>🏢</Text>
            <View>
              <Text style={styles.officeName}>India Office</Text>
              <Text style={styles.officeAddress}>
                456 Tech Park, Innovation Zone{'\n'}
                Bangalore, KA 560001{'\n'}
                India
              </Text>
            </View>
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>f</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>𝕏</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>💼</Text>
            </TouchableOpacity>
          </View>
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
  quickButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginVertical: 16,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  quickIcon: {
    fontSize: 28,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  section: {
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  channelCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  channelIcon: {
    fontSize: 24,
  },
  channelInfo: {
    flex: 1,
  },
  channelName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  channelDetails: {
    gap: 4,
    marginBottom: 6,
  },
  detailLink: {
    fontSize: 12,
    color: '#5B5FFF',
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#F9F9F9',
    marginBottom: 12,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#5B5FFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  officeCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  officeIcon: {
    fontSize: 28,
  },
  officeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  officeAddress: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#5B5FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
