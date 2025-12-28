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
} from 'react-native';

export default function HelpScreen() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contactMethod, setContactMethod] = useState('email');

  const handleSubmit = () => {
    if (!subject || !message) {
      alert('Please fill in all fields');
      return;
    }

    if (contactMethod === 'email') {
      Linking.openURL(
        `mailto:support@smarthealth.com?subject=${encodeURIComponent(
          subject
        )}&body=${encodeURIComponent(message)}`
      );
    } else {
      Linking.openURL(`tel:+919876543210`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>💬 Help & Support</Text>
          <Text style={styles.subtitle}>We're here to help you</Text>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkIcon}>📚</Text>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>Documentation</Text>
              <Text style={styles.linkDesc}>Learn how to use features</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkIcon}>🎥</Text>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>Video Tutorials</Text>
              <Text style={styles.linkDesc}>Watch step-by-step guides</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkIcon}>⚙️</Text>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>Troubleshooting</Text>
              <Text style={styles.linkDesc}>Fix common issues</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactMethods}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                contactMethod === 'email' && styles.methodButtonActive,
              ]}
              onPress={() => setContactMethod('email')}
            >
              <Text style={styles.methodIcon}>📧</Text>
              <Text style={styles.methodText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.methodButton,
                contactMethod === 'phone' && styles.methodButtonActive,
              ]}
              onPress={() => setContactMethod('phone')}
            >
              <Text style={styles.methodIcon}>📞</Text>
              <Text style={styles.methodText}>Phone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.methodButton,
                contactMethod === 'chat' && styles.methodButtonActive,
              ]}
              onPress={() => setContactMethod('chat')}
            >
              <Text style={styles.methodIcon}>💬</Text>
              <Text style={styles.methodText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Form */}
        {contactMethod === 'email' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Send us a message</Text>
            <TextInput
              style={styles.input}
              placeholder="Subject"
              value={subject}
              onChangeText={setSubject}
            />
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Describe your issue..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Direct Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Direct Contact</Text>
          <TouchableOpacity
            style={styles.directButton}
            onPress={() => Linking.openURL('tel:+919876543210')}
          >
            <Text style={styles.directIcon}>☎️</Text>
            <View>
              <Text style={styles.directLabel}>Call Us</Text>
              <Text style={styles.directValue}>+91 98765 43210</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.directButton}
            onPress={() =>
              Linking.openURL('mailto:support@smarthealth.com')
            }
          >
            <Text style={styles.directIcon}>✉️</Text>
            <View>
              <Text style={styles.directLabel}>Email Us</Text>
              <Text style={styles.directValue}>support@smarthealth.com</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.directButton}>
            <Text style={styles.directIcon}>🕐</Text>
            <View>
              <Text style={styles.directLabel}>Response Time</Text>
              <Text style={styles.directValue}>Usually within 1 hour</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* FAQ Link */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.faqBanner}>
            <Text style={styles.faqBannerIcon}>❓</Text>
            <View style={styles.faqBannerContent}>
              <Text style={styles.faqBannerTitle}>Check Our FAQ</Text>
              <Text style={styles.faqBannerDesc}>
                Find answers to common questions
              </Text>
            </View>
            <Text style={styles.faqBannerArrow}>→</Text>
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
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  linkIcon: {
    fontSize: 24,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  linkDesc: {
    fontSize: 12,
    color: '#999',
  },
  arrow: {
    fontSize: 16,
    color: '#5B5FFF',
  },
  contactMethods: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  methodButtonActive: {
    backgroundColor: '#5B5FFF',
    borderColor: '#5B5FFF',
  },
  methodIcon: {
    fontSize: 24,
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
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
  directButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  directIcon: {
    fontSize: 24,
  },
  directLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  directValue: {
    fontSize: 12,
    color: '#5B5FFF',
  },
  faqBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5B5FFF20',
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: '#5B5FFF',
    gap: 12,
  },
  faqBannerIcon: {
    fontSize: 32,
  },
  faqBannerContent: {
    flex: 1,
  },
  faqBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  faqBannerDesc: {
    fontSize: 12,
    color: '#666',
  },
  faqBannerArrow: {
    fontSize: 20,
    color: '#5B5FFF',
  },
});
