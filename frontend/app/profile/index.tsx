import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: '👤', action: () => {} },
    { id: 'documents', label: 'My Documents', icon: '📄' },
    { id: 'payment', label: 'Payment Methods', icon: '💳' },
    { id: 'orders', label: 'Order History', icon: '📦' },
    { id: 'contact', label: 'Contact Us', icon: '📞' },
    { id: 'help', label: 'Help & Support', icon: '❓' },
    { id: 'faq', label: 'FAQ', icon: '💬' },
    { id: 'privacy', label: 'Privacy Policy', icon: '🔒' },
    { id: 'logout', label: 'Logout', icon: '🚪', action: logout },
  ];

  const documents = [
    { id: '1', name: 'Aadhar Card', type: 'ID', status: 'Verified' },
    { id: '2', name: 'Medical License', type: 'Professional', status: 'Pending' },
    { id: '3', name: 'Insurance Card', type: 'Insurance', status: 'Verified' },
  ];

  const handleMenuPress = (item: any) => {
    if (item.action) {
      item.action();
    } else {
      // Navigate based on menu item
      switch (item.id) {
        case 'profile':
          // Already on profile screen
          break;
        case 'payment':
          router.push('/settings/payment');
          break;
        case 'orders':
          router.push('/settings/orders');
          break;
        case 'contact':
          router.push('/settings/contact');
          break;
        case 'help':
          router.push('/settings/help');
          break;
        case 'faq':
          router.push('/settings/faq');
          break;
        case 'documents':
        case 'privacy':
          Alert.alert('Feature', `${item.label} feature coming soon`);
          break;
      }
    }
    setMenuVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSidebarVisible(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
          <Text style={styles.moreIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.profileImageContainer}>
            <Text style={styles.profileImage}>👤</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
            <Text style={styles.userType}>{user?.userType || 'user'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        {user?.userType === 'user' && (
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Appointments</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Ongoing</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>⭐ 4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        )}

        {/* Documents Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📄 Documents</Text>
            <TouchableOpacity>
              <Text style={styles.uploadLink}>+ Upload</Text>
            </TouchableOpacity>
          </View>
          {documents.map((doc) => (
            <View key={doc.id} style={styles.documentItem}>
              <View>
                <Text style={styles.documentName}>{doc.name}</Text>
                <Text style={styles.documentType}>{doc.type}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  doc.status === 'Verified' && styles.verifiedBadge,
                ]}
              >
                <Text style={styles.statusText}>{doc.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Contact</Text>
          <View style={styles.contactItem}>
            <Text style={styles.contactLabel}>Phone:</Text>
            <Text style={styles.contactValue}>{user?.phone || 'Not added'}</Text>
          </View>
          <View style={styles.contactItem}>
            <Text style={styles.contactLabel}>Email:</Text>
            <Text style={styles.contactValue}>{user?.email}</Text>
          </View>
          <View style={styles.contactItem}>
            <Text style={styles.contactLabel}>Emergency Contact:</Text>
            <Text style={styles.contactValue}>+91 98765 43210</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🏥</Text>
            <Text style={styles.actionLabel}>Book Appointment</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🚑</Text>
            <Text style={styles.actionLabel}>Emergency Services</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💳</Text>
            <Text style={styles.actionLabel}>Payment Methods</Text>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Settings</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text>🔔 Notifications</Text>
            <Text>Enabled</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text>🌙 Dark Mode</Text>
            <Text>Off</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text>🔒 Privacy</Text>
            <Text>Public</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sidebar Modal */}
      <Modal visible={sidebarVisible} transparent animationType="slide">
        <SafeAreaView style={styles.sidebarContainer}>
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={menuItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.sidebarItem}
                  onPress={() => handleMenuPress(item)}
                >
                  <Text style={styles.sidebarIcon}>{item.icon}</Text>
                  <Text style={styles.sidebarLabel}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
          <TouchableOpacity
            style={styles.sidebarOverlay}
            onPress={() => setSidebarVisible(false)}
          />
        </SafeAreaView>
      </Modal>

      {/* Menu Dropdown */}
      {menuVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity style={styles.dropdownItem}>
            <Text>✏️ Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem}>
            <Text>📸 Change Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem} onPress={logout}>
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  menuIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  moreIcon: {
    fontSize: 24,
  },
  userCard: {
    flexDirection: 'row',
    padding: 20,
    margin: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5B5FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    fontSize: 32,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  userType: {
    fontSize: 12,
    color: '#999',
    marginVertical: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#5B5FFF',
    borderRadius: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5B5FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
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
    marginBottom: 12,
  },
  uploadLink: {
    color: '#5B5FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  documentType: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFE4E4',
    borderRadius: 6,
  },
  verifiedBadge: {
    backgroundColor: '#E4F5E4',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactLabel: {
    fontSize: 13,
    color: '#666',
  },
  contactValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 10,
    gap: 12,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  actionArrow: {
    color: '#5B5FFF',
    fontSize: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sidebarContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebar: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  sidebarIcon: {
    fontSize: 20,
  },
  sidebarLabel: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  sidebarOverlay: {
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logoutText: {
    color: '#FF6B6B',
  },
});
