import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Modal,
} from 'react-native';

const orders = [
  {
    id: '1',
    type: 'Appointment',
    provider: 'Dr. Smith',
    date: 'Dec 22, 2025',
    time: '4:14 PM',
    amount: '₹500',
    status: 'Confirmed',
    statusColor: '#4CAF50',
    icon: '📅',
    details: {
      service: 'General Checkup',
      location: '123 Main Street',
      notes: 'Please bring your insurance card',
    },
  },
  {
    id: '2',
    type: 'Ambulance',
    provider: 'Ambulance #101',
    date: 'Dec 20, 2025',
    time: '2:30 PM',
    amount: '₹2,000',
    status: 'Completed',
    statusColor: '#4CAF50',
    icon: '🚑',
    details: {
      service: 'Emergency Transport',
      location: 'Current Location to Hospital',
      notes: 'Emergency response',
    },
  },
  {
    id: '3',
    type: 'Appointment',
    provider: 'Nurse Mary',
    date: 'Dec 18, 2025',
    time: '10:00 AM',
    amount: '₹800',
    status: 'Completed',
    statusColor: '#4CAF50',
    icon: '👩‍⚕️',
    details: {
      service: 'Home Care',
      location: 'Your Home',
      notes: 'Wound dressing and vitals check',
    },
  },
  {
    id: '4',
    type: 'Appointment',
    provider: 'Dr. Sarah Jones',
    date: 'Dec 15, 2025',
    time: '3:45 PM',
    amount: '₹1,200',
    status: 'Cancelled',
    statusColor: '#FF6B6B',
    icon: '👩‍⚕️',
    details: {
      service: 'Cardiology Consultation',
      location: 'Clinic Address',
      notes: 'Cancelled by user',
    },
  },
];

export default function OrderHistoryScreen() {
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<(typeof orders)[0] | null>(null);
  const [detailsModal, setDetailsModal] = useState(false);

  const statuses = ['Confirmed', 'Completed', 'Cancelled', 'Pending'];

  const filteredOrders = filterStatus
    ? orders.filter((order) => order.status === filterStatus)
    : orders;

  const renderOrder = ({ item }: { item: (typeof orders)[0] }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => {
        setSelectedOrder(item);
        setDetailsModal(true);
      }}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderIcon}>{item.icon}</Text>
        <View style={styles.orderInfo}>
          <Text style={styles.orderType}>{item.type}</Text>
          <Text style={styles.orderProvider}>{item.provider}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: item.statusColor + '20' },
          ]}
        >
          <Text style={[styles.statusText, { color: item.statusColor }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.orderMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>📅</Text>
          <Text style={styles.metaText}>{item.date}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>🕐</Text>
          <Text style={styles.metaText}>{item.time}</Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.amount}>{item.amount}</Text>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📦 Order History</Text>
        <Text style={styles.subtitle}>Track all your services and appointments</Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
      >
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterStatus === null && styles.filterTabActive,
          ]}
          onPress={() => setFilterStatus(null)}
        >
          <Text
            style={[
              styles.filterTabText,
              filterStatus === null && styles.filterTabTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {statuses.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterTab,
              filterStatus === status && styles.filterTabActive,
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterStatus === status && styles.filterTabTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No orders found</Text>
          <Text style={styles.emptySubtext}>Try a different filter</Text>
        </View>
      )}

      {/* Order Details Modal */}
      <Modal visible={detailsModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setDetailsModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Order Summary */}
                <View style={styles.section}>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryIcon}>{selectedOrder.icon}</Text>
                    <View>
                      <Text style={styles.summaryType}>
                        {selectedOrder.type}
                      </Text>
                      <Text style={styles.summaryProvider}>
                        {selectedOrder.provider}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.section}>
                  <Text style={styles.detailsTitle}>Details</Text>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Service:</Text>
                    <Text style={styles.detailValue}>
                      {selectedOrder.details.service}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>
                      {selectedOrder.date}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Time:</Text>
                    <Text style={styles.detailValue}>
                      {selectedOrder.time}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Location:</Text>
                    <Text style={styles.detailValue}>
                      {selectedOrder.details.location}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Notes:</Text>
                    <Text style={styles.detailValue}>
                      {selectedOrder.details.notes}
                    </Text>
                  </View>
                </View>

                {/* Amount & Status */}
                <View style={styles.section}>
                  <View style={styles.amountCard}>
                    <Text style={styles.amountLabel}>Amount Paid</Text>
                    <Text style={styles.amountValue}>{selectedOrder.amount}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusCard,
                      {
                        backgroundColor: selectedOrder.statusColor + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusTitle,
                        { color: selectedOrder.statusColor },
                      ]}
                    >
                      {selectedOrder.status}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                {selectedOrder.status === 'Confirmed' && (
                  <View style={styles.section}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionIcon}>📞</Text>
                      <Text style={styles.actionText}>Contact Provider</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionIcon}>📍</Text>
                      <Text style={styles.actionText}>Get Directions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                    >
                      <Text style={styles.cancelActionText}>Cancel Booking</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {selectedOrder.status === 'Completed' && (
                  <View style={styles.section}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionIcon}>⭐</Text>
                      <Text style={styles.actionText}>Leave a Review</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionIcon}>🔄</Text>
                      <Text style={styles.actionText}>Rebook Service</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
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
  filterScroll: {
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#5B5FFF',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#5B5FFF',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  orderIcon: {
    fontSize: 32,
  },
  orderInfo: {
    flex: 1,
  },
  orderType: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  orderProvider: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderMeta: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  viewDetails: {
    color: '#5B5FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    fontSize: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
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
  section: {
    marginVertical: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  summaryIcon: {
    fontSize: 40,
  },
  summaryType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  summaryProvider: {
    fontSize: 13,
    color: '#999',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  amountCard: {
    backgroundColor: '#5B5FFF20',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#5B5FFF',
  },
  statusCard: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    gap: 10,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cancelButton: {
    backgroundColor: '#FF6B6B20',
  },
  cancelActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});
