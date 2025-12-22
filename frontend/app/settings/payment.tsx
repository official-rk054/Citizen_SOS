import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';

const paymentMethods = [
  {
    id: '1',
    type: 'card',
    label: 'Credit Card',
    icon: '💳',
    details: 'Visa **** 4242',
    isDefault: true,
  },
  {
    id: '2',
    type: 'upi',
    label: 'UPI',
    icon: '📱',
    details: 'user@upi',
    isDefault: false,
  },
  {
    id: '3',
    type: 'wallet',
    label: 'Google Pay',
    icon: '💰',
    details: '+91 98765 43210',
    isDefault: false,
  },
];

export default function PaymentMethodsScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');

  const handleAddPayment = () => {
    if (!cardNumber || !holderName) {
      alert('Please fill in all fields');
      return;
    }
    // Add payment logic
    setShowAddModal(false);
    setCardNumber('');
    setHolderName('');
  };

  const renderPaymentMethod = ({ item }: { item: (typeof paymentMethods)[0] }) => (
    <TouchableOpacity
      style={[
        styles.paymentCard,
        selectedPayment === item.id && styles.paymentCardSelected,
      ]}
      onPress={() => setSelectedPayment(item.id)}
    >
      <View style={styles.paymentLeft}>
        <Text style={styles.paymentIcon}>{item.icon}</Text>
        <View>
          <Text style={styles.paymentLabel}>{item.label}</Text>
          <Text style={styles.paymentDetails}>{item.details}</Text>
        </View>
      </View>
      <View style={styles.paymentRight}>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
        {selectedPayment === item.id && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>💳 Payment Methods</Text>
          <Text style={styles.subtitle}>Manage your payment options</Text>
        </View>

        {/* Saved Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Methods</Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Add New</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={paymentMethods}
            renderItem={renderPaymentMethod}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Billing Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Address</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressTitle}>Home</Text>
            <Text style={styles.addressText}>
              123 Main Street, Apt 4B{'\n'}
              New York, NY 10001{'\n'}
              United States
            </Text>
            <View style={styles.addressActions}>
              <TouchableOpacity>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.deleteLink}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.addAddressButton}>
            <Text style={styles.addAddressText}>+ Add Another Address</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <View style={styles.transaction}>
            <View>
              <Text style={styles.transactionTitle}>Appointment - Dr. Smith</Text>
              <Text style={styles.transactionDate}>Dec 20, 2025</Text>
            </View>
            <Text style={styles.transactionAmount}>₹500</Text>
          </View>
          <View style={styles.transaction}>
            <View>
              <Text style={styles.transactionTitle}>
                Emergency Services
              </Text>
              <Text style={styles.transactionDate}>Dec 18, 2025</Text>
            </View>
            <Text style={styles.transactionAmount}>₹2,000</Text>
          </View>
          <TouchableOpacity style={styles.viewAllLink}>
            <Text style={styles.viewAllText}>View All Transactions →</Text>
          </TouchableOpacity>
        </View>

        {/* Security Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.securityInfo}>
            <Text style={styles.securityIcon}>🔒</Text>
            <View>
              <Text style={styles.securityTitle}>Secure Payments</Text>
              <Text style={styles.securityDesc}>
                All transactions are secured with 256-bit encryption
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add Payment Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Payment Type Selection */}
            <View style={styles.typeSelection}>
              {['card', 'upi', 'wallet'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    paymentType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setPaymentType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      paymentType === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type === 'card'
                      ? '💳 Card'
                      : type === 'upi'
                      ? '📱 UPI'
                      : '💰 Wallet'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Form Fields */}
            <TextInput
              style={styles.input}
              placeholder="Cardholder Name"
              value={holderName}
              onChangeText={setHolderName}
            />
            <TextInput
              style={styles.input}
              placeholder="Card Number"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              maxLength={19}
            />
            <TextInput
              style={[styles.input, styles.rowInput]}
              placeholder="MM/YY"
              maxLength={5}
            />
            <TextInput
              style={[styles.input, styles.rowInput]}
              placeholder="CVV"
              maxLength={3}
              keyboardType="numeric"
            />

            {/* Set as Default */}
            <TouchableOpacity style={styles.checkboxContainer}>
              <Text style={styles.checkbox}>☐</Text>
              <Text style={styles.checkboxLabel}>
                Set as default payment method
              </Text>
            </TouchableOpacity>

            {/* Buttons */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPayment}
            >
              <Text style={styles.addButtonText}>Add Payment Method</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  addButton: {
    backgroundColor: '#5B5FFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  paymentCardSelected: {
    backgroundColor: '#5B5FFF20',
    borderColor: '#5B5FFF',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentIcon: {
    fontSize: 28,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  paymentDetails: {
    fontSize: 12,
    color: '#999',
  },
  paymentRight: {
    alignItems: 'center',
    gap: 8,
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  checkmark: {
    color: '#5B5FFF',
    fontSize: 20,
  },
  addressCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 10,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 16,
  },
  editLink: {
    color: '#5B5FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteLink: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },
  addAddressButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  addAddressText: {
    color: '#5B5FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 11,
    color: '#999',
  },
  transactionAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  viewAllLink: {
    marginTop: 12,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#5B5FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4F5E4',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  securityIcon: {
    fontSize: 28,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 2,
  },
  securityDesc: {
    fontSize: 12,
    color: '#2E7D32',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  typeSelection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  typeButtonActive: {
    backgroundColor: '#5B5FFF',
    borderColor: '#5B5FFF',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#F9F9F9',
  },
  rowInput: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  checkbox: {
    fontSize: 20,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666',
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
