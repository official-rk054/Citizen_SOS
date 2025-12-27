import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { appointmentsAPI } from '../../../utils/api';

export default function NurseConfirmation() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colors = Colors.light;
  // Animated success overlay state
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(20)).current;
  const [showOverlay, setShowOverlay] = useState(true);

  const appointmentId = (params.appointmentId as string) || '';
  const nurseName = (params.nurseName as string) || 'Nurse';
  const service = (params.service as string) || 'Service';
  const hours = (params.hours as string) || '1';
  const total = (params.total as string) || '0';

  useEffect(() => {
    Animated.sequence([
      Animated.spring(iconScale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 120 }),
      Animated.delay(300),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setShowOverlay(false));

    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(cardTranslate, { toValue: 0, useNativeDriver: true, friction: 7, tension: 100 }),
    ]).start();
  }, []);
    const [rescheduleOpen, setRescheduleOpen] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState(new Date());
    const [rescheduleTime, setRescheduleTime] = useState('10:00 AM');

    const cancelAppointment = async () => {
      if (!appointmentId) return;
      try {
        await appointmentsAPI.cancelAppointment(appointmentId);
        router.push('/appointments');
      } catch (e) {
        // Swallow errors to keep UX simple
      }
    };

    const submitReschedule = async () => {
      if (!appointmentId) return;
      try {
        await appointmentsAPI.rescheduleAppointment(appointmentId, rescheduleDate.toISOString(), rescheduleTime);
        router.push('/appointments');
      } catch (e) {
        // ignore
      }
    };
  // nurseName/service/hours/total moved above

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }] }>
      {showOverlay && (
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <View style={[styles.overlayBg, { backgroundColor: colors.gradientStart }]} />
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            <View style={[styles.overlayIconWrap, { backgroundColor: colors.secondary }]}>
              <MaterialCommunityIcons name="check-decagram" size={48} color="#fff" />
            </View>
          </Animated.View>
          <Text style={[styles.overlayText, { color: '#fff' }]}>Success</Text>
        </Animated.View>
      )}

      <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardTranslate }] }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.secondary }]}>
          <MaterialCommunityIcons name="check-decagram" size={36} color="#fff" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Booking Confirmed</Text>
        <Text style={[styles.subtitle, { color: colors.icon }]}>Your nurse service has been scheduled.</Text>

        <View style={styles.details}> 
          <View style={styles.row}><Text style={styles.label}>Nurse</Text><Text style={styles.value}>{nurseName}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Service</Text><Text style={styles.value}>{service}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Duration</Text><Text style={styles.value}>{hours} hours</Text></View>
          <View style={styles.divider} />
          <View style={styles.row}><Text style={styles.total}>Total</Text><Text style={[styles.value, { color: colors.primary, fontWeight: '800' }]}>${total}</Text></View>
          {appointmentId ? (
            <View style={[styles.badge, { borderColor: colors.cardBorder }]}> 
              <Text style={styles.badgeText}>ID: {appointmentId.substring(0, 8)}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity style={[styles.cta, { backgroundColor: colors.gradientStart }]} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.ctaText}>Go to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.secondaryCta, { borderColor: colors.cardBorder }]} onPress={() => router.push('/appointments')}>
          <Text style={[styles.secondaryCtaText, { color: colors.text }]}>View Appointments</Text>
        </TouchableOpacity>

        <View style={{ height: 8 }} />
        <TouchableOpacity style={[styles.secondaryCta, { borderColor: colors.cardBorder }]} onPress={cancelAppointment}>
          <Text style={[styles.secondaryCtaText, { color: colors.danger }]}>Cancel Appointment</Text>
        </TouchableOpacity>

        <View style={{ height: 8 }} />
        <TouchableOpacity style={[styles.secondaryCta, { borderColor: colors.cardBorder }]} onPress={() => setRescheduleOpen((s) => !s)}>
          <Text style={[styles.secondaryCtaText, { color: colors.text }]}>Reschedule</Text>
        </TouchableOpacity>

        {rescheduleOpen && (
          <View style={{ marginTop: 12 }}>
            <DateTimePicker value={rescheduleDate} mode="date" display="spinner" onChange={(e, date) => { if (date) setRescheduleDate(date); }} />
            <View style={styles.timeRow}>
              {['09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM','04:00 PM'].map((t) => (
                <TouchableOpacity key={t} style={[styles.timeChip, rescheduleTime===t && styles.timeChipActive]} onPress={() => setRescheduleTime(t)}>
                  <Text style={[styles.timeChipText, rescheduleTime===t && styles.timeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[styles.cta, { backgroundColor: colors.secondary }]} onPress={submitReschedule}>
              <Text style={styles.ctaText}>Confirm Reschedule</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', borderRadius: 20, padding: 24, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  overlayBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  overlayIconWrap: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  overlayText: { marginTop: 12, fontSize: 18, fontWeight: '800' },
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 6 },
  details: { marginTop: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  label: { fontSize: 16, fontWeight: '700' },
  value: { fontSize: 16, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },
  total: { fontSize: 18, fontWeight: '800' },
  badge: { borderWidth: 1, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10, alignSelf: 'flex-start', marginTop: 8 },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  cta: { marginTop: 16, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  secondaryCta: { marginTop: 10, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  secondaryCtaText: { fontSize: 16, fontWeight: '800' },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  timeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
  timeChipActive: { backgroundColor: '#0066CC', borderColor: '#0066CC' },
  timeChipText: { fontSize: 12, fontWeight: '700', color: '#333' },
  timeChipTextActive: { color: '#fff' },
});
