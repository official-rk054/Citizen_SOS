import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type PaymentType = 'card' | 'upi' | 'wallet';

interface PaymentMethod {
  id: string;
  type: PaymentType;
  label: string;
  detail: string;
  isDefault: boolean;
}

const paymentIcons: Record<PaymentType, string> = {
  card: '💳',
  upi: '📱',
  wallet: '💰',
};

const formatDetail = (method: PaymentMethod) => {
  if (method.type === 'card') {
    return `•••• ${method.detail.slice(-4)}`;
  }
  return method.detail;
};

const PaymentScreen = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>('card');
  const [holderName, setHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [addingPayment, setAddingPayment] = useState(false);

  useEffect(() => {
    const seed: PaymentMethod[] = [
      {
        id: '1',
        type: 'card',
        label: 'Visa ending 4242',
        detail: '4242',
        isDefault: true,
      },
      {
        id: '2',
        type: 'upi',
        label: 'UPI',
        detail: 'john.doe@upi',
        isDefault: false,
      },
      {
        id: '3',
        type: 'wallet',
        label: 'Paytm Wallet',
        detail: 'Linked',
        isDefault: false,
      },
    ];

    setPaymentMethods(seed);
    setLoading(false);
  }, []);

  const resetForm = () => {
    setPaymentType('card');
    setHolderName('');
    setCardNumber('');
    setExpiryMonth('');
    setExpiryYear('');
  };

  const handleAddPayment = () => {
    if (!holderName.trim()) {
      Alert.alert('Missing name', 'Add a cardholder name to continue.');
      return;
    }

    if (paymentType === 'card' && cardNumber.trim().length < 4) {
      Alert.alert('Card number', 'Enter at least the last 4 digits.');
      return;
    }

    setAddingPayment(true);

    const last4 = cardNumber.trim().slice(-4) || '0000';
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type: paymentType,
      label:
        paymentType === 'card'
          ? `Card ending ${last4}`
          : paymentType === 'upi'
          ? 'UPI'
          : 'Wallet',
      detail: paymentType === 'card' ? last4 : cardNumber.trim() || holderName,
      isDefault: paymentMethods.length === 0,
    };

    setPaymentMethods((prev) => [newMethod, ...prev.map((m) => ({ ...m, isDefault: false }))]);
    setAddingPayment(false);
    setShowAddModal(false);
    resetForm();
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove payment method', 'Are you sure you want to remove this method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setPaymentMethods((prev) => {
            const filtered = prev.filter((m) => m.id !== id);
            if (filtered.length === 0) return [];

            const hasDefault = filtered.some((m) => m.isDefault);
            if (hasDefault) return filtered;

            const [first, ...rest] = filtered;
            return [{ ...first, isDefault: true }, ...rest];
          });
        },
      },
    ]);
  };

  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => (
    <View style={[styles.paymentCard, item.isDefault && styles.paymentCardSelected]}>
      <View style={styles.paymentLeft}>
        <Text style={styles.paymentIcon}>{paymentIcons[item.type]}</Text>
        <View>
          <Text style={styles.paymentLabel}>{item.label}</Text>
          <Text style={styles.paymentDetails}>{formatDetail(item)}</Text>
        </View>
      </View>

      <View style={styles.paymentRight}>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>DEFAULT</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Payment options', item.label, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Set as default', onPress: () => handleSetDefault(item.id) },
              { text: 'Delete', style: 'destructive', onPress: () => handleDelete(item.id) },
            ]);
          }}
        >
          <MaterialIcons name="more-vert" size={22} color="#5B5FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B5FFF" />
          <Text style={styles.loadingText}>Loading payment methods...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Payment Methods</Text>
          <Text style={styles.subtitle}>Manage how you pay for bookings</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved methods</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setShowAddModal(true)}>
              <Text style={styles.primaryButtonText}>+ Add new</Text>
            </TouchableOpacity>
          </View>

          {paymentMethods.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No payment methods yet</Text>
              <Text style={styles.emptySubtext}>Add a card, UPI, or wallet to continue.</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.primaryButtonText}>Add payment method</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={paymentMethods}
              renderItem={renderPaymentMethod}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.securityInfo}>
            <Text style={styles.securityIcon}>🔒</Text>
            <View>
              <Text style={styles.securityTitle}>Payments are encrypted</Text>
              <Text style={styles.securityDesc}>256-bit encryption protects your data.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add payment method</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.typeSelection}>
              {(['card', 'upi', 'wallet'] as PaymentType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeButton, paymentType === type && styles.typeButtonActive]}
                  onPress={() => setPaymentType(type)}
                >
                  <Text
                    style={[styles.typeButtonText, paymentType === type && styles.typeButtonTextActive]}
                  >
                    {paymentIcons[type]} {type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Cardholder name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={holderName}
                onChangeText={setHolderName}
                autoCapitalize="words"
              />

              <Text style={styles.label}>Identifier</Text>
              <TextInput
                style={styles.input}
                placeholder={paymentType === 'card' ? 'Last 4 digits' : 'UPI / wallet handle'}
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType={paymentType === 'card' ? 'numeric' : 'default'}
                maxLength={paymentType === 'card' ? 4 : 40}
              />

              {paymentType === 'card' && (
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Expiry month</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="MM"
                      value={expiryMonth}
                      onChangeText={setExpiryMonth}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.label}>Expiry year</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="YY"
                      value={expiryYear}
                      onChangeText={setExpiryYear}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.primaryButton, addingPayment && styles.primaryButtonDisabled]}
                onPress={handleAddPayment}
                disabled={addingPayment}
              >
                {addingPayment ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Save method</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    color: '#1A1A1A',
  },
  primaryButton: {
    backgroundColor: '#5B5FFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentCardSelected: {
    borderColor: '#5B5FFF',
    backgroundColor: '#EEF0FF',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentIcon: {
    fontSize: 26,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  paymentDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  paymentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  defaultBadge: {
    backgroundColor: '#5B5FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#666',
    marginVertical: 8,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  securityIcon: {
    fontSize: 26,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  securityDesc: {
    fontSize: 12,
    color: '#2E7D32',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  typeSelection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: '#F6F7FB',
  },
  typeButtonActive: {
    backgroundColor: '#5B5FFF',
    borderColor: '#5B5FFF',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A4A4A',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A4A4A',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8F9FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  halfInput: {
    flex: 1,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
});
