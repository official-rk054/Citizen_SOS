import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  Linking,
} from 'react-native';

const faqData = [
  {
    id: '1',
    question: 'How do I book an appointment?',
    answer:
      'Go to the Appointments tab, select a doctor or nurse, choose a date and time, and confirm your booking. You will receive a confirmation SMS.',
  },
  {
    id: '2',
    question: 'What is the cancellation policy?',
    answer:
      'You can cancel appointments up to 2 hours before the scheduled time for a full refund. Cancellations within 2 hours will be charged 50%.',
  },
  {
    id: '3',
    question: 'How do I access my medical documents?',
    answer:
      'Visit your Profile section to view all uploaded documents. You can upload new documents using the + button.',
  },
  {
    id: '4',
    question: 'Is my data secure?',
    answer:
      'Yes, all your medical data is encrypted and stored securely. We comply with all healthcare data protection regulations.',
  },
  {
    id: '5',
    question: 'How do emergency services work?',
    answer:
      'Press the emergency button in the Home tab. The nearest ambulance will be automatically dispatched to your location.',
  },
  {
    id: '6',
    question: 'What payment methods are accepted?',
    answer:
      'We accept Credit/Debit cards, UPI, Google Pay, Apple Pay, and Wallets like Paytm.',
  },
];

export default function FAQScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaq = faqData.filter((item) =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFaqItem = ({ item }: { item: (typeof faqData)[0] }) => (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() =>
        setExpandedId(expandedId === item.id ? null : item.id)
      }
    >
      <View style={styles.questionContainer}>
        <Text style={styles.questionIcon}>
          {expandedId === item.id ? '▼' : '▶'}
        </Text>
        <Text style={styles.question}>{item.question}</Text>
      </View>
      {expandedId === item.id && (
        <Text style={styles.answer}>{item.answer}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>❓ FAQ</Text>
        <Text style={styles.subtitle}>Frequently Asked Questions</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search FAQs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredFaq}
        renderItem={renderFaqItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />

      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Still need help?</Text>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() =>
            Linking.openURL('tel:+919876543210')
          }
        >
          <Text style={styles.contactIcon}>📞</Text>
          <View>
            <Text style={styles.buttonLabel}>Call Support</Text>
            <Text style={styles.buttonValue}>+91 98765 43210</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() =>
            Linking.openURL(
              'mailto:support@smarthealth.com?subject=Support%20Request'
            )
          }
        >
          <Text style={styles.contactIcon}>📧</Text>
          <View>
            <Text style={styles.buttonLabel}>Email Support</Text>
            <Text style={styles.buttonValue}>support@smarthealth.com</Text>
          </View>
        </TouchableOpacity>
      </View>
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#F9F9F9',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  faqItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#5B5FFF',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  questionIcon: {
    fontSize: 12,
    color: '#5B5FFF',
    marginTop: 2,
  },
  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  answer: {
    marginTop: 12,
    marginLeft: 22,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  contactSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F5F5F5',
    gap: 10,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  contactIcon: {
    fontSize: 24,
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  buttonValue: {
    fontSize: 12,
    color: '#5B5FFF',
  },
});
