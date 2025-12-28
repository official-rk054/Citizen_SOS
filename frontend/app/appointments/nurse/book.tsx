import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Slider } from '@miblanchard/react-native-slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { usersAPI, appointmentsAPI } from '../../../utils/api';
import { Colors } from '../../../constants/theme';

interface NurseServiceOption {
  id: string;
  title: string;
  rate: number; // per hour
  icon: string;
}

interface NurseProfile { _id: string; name: string; userType: string; specialization?: string; }

export default function BookNurseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [colorMode] = useState<'light' | 'dark'>('light');
  const colors = Colors.light;

  const services: NurseServiceOption[] = [
    { id: 'patient-care', title: 'Patient Care', rate: 30, icon: 'heart-pulse' },
    { id: 'injection-iv', title: 'Injection / IV', rate: 20, icon: 'needle' },
    { id: 'wound-dressing', title: 'Wound Dressing', rate: 25, icon: 'bandage' },
  ];

  const [selectedService, setSelectedService] = useState<NurseServiceOption>(services[0]);
  const [duration, setDuration] = useState<number>(2); // hours
  const [nearestNurse, setNearestNurse] = useState<NurseProfile | null>(null);
  const [nurses, setNurses] = useState<NurseProfile[]>([]);
  const [selectedNurse, setSelectedNurse] = useState<NurseProfile | null>(null);
  const [fetching, setFetching] = useState<boolean>(false);
  const [booking, setBooking] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');

  const total = useMemo(() => selectedService.rate * duration, [selectedService.rate, duration]);

  useEffect(() => {
    (async () => {
      try {
        setFetching(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required');
          setFetching(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const nurseRes = await usersAPI.getNearbyProfessionals('nurse', loc.coords.latitude, loc.coords.longitude, 15);
        const nearest = (nurseRes.data || [])[0] || null;
        setNearestNurse(nearest);
        setNurses(nurseRes.data || []);
        setSelectedNurse(nearest);
      } catch (e) {
        console.error('Nearby nurses error:', e);
        Alert.alert('Error', 'Failed to load nearby nurses');
      } finally {
        setFetching(false);
      }
    })();
  }, []);

  const handleBook = async () => {
    if (!selectedNurse) {
      Alert.alert('No Nurse Found', 'Please try again or widen your search.');
      return;
    }
    try {
      setBooking(true);
      const payload = {
        professionalId: selectedNurse._id,
        appointmentDate: selectedDate.toISOString(),
        timeSlot: selectedTime,
        reason: selectedService.title,
        consultationFee: total,
      };
      const resp = await appointmentsAPI.bookAppointment(payload);
      const appointmentId = resp?.data?.appointment?._id || '';
      router.push({
        pathname: '/appointments/nurse/confirmation',
        params: {
          appointmentId,
          nurseName: selectedNurse.name,
          service: selectedService.title,
          hours: String(duration),
          total: String(total),
        },
      });
    } catch (e) {
      console.error('Book nurse error:', e);
      Alert.alert('Error', 'Failed to book nurse');
    } finally {
      setBooking(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }] }>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}> 
          <TouchableOpacity onPress={() => router.back()}><Text style={[styles.back, { color: colors.primary }]}>‹</Text></TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Book Nurse</Text>
        </View>

        <View style={styles.section}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Nurse</Text>
          {fetching ? (
            <ActivityIndicator color={colors.primary} />
          ) : nurses.length === 0 ? (
            <Text style={{ color: colors.icon, marginBottom: 8 }}>No nearby nurses found</Text>
          ) : (
            <FlatList
              data={nurses}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const selected = selectedNurse?._id === item._id;
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedNurse(item)}
                    activeOpacity={0.85}
                    style={[styles.nurseRow, { borderColor: selected ? colors.primary : 'transparent', backgroundColor: colors.cardBackground }]}
                  >
                    <View style={styles.nurseAvatar}><Text style={{ color: '#fff', fontWeight: '800' }}>{item.name?.charAt(0)}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.nurseName, { color: colors.text }]}>{item.name}</Text>
                      <Text style={{ color: colors.icon }}>{item.specialization || 'Registered Nurse'}</Text>
                    </View>
                    <View style={[styles.radio, { borderColor: selected ? colors.primary : colors.cardBorder, backgroundColor: selected ? colors.primary : 'transparent' }]} />
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>

        <View style={styles.section}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Date & Time</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={[styles.dateButtonText, { color: colors.text }]}>{selectedDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={(e, date) => { if (date) setSelectedDate(date); setShowDatePicker(false); }}
            />
          )}
          <View style={styles.timeSlots}>
            {['09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM','04:00 PM'].map((t) => (
              <TouchableOpacity key={t} style={[styles.timeSlot, selectedTime===t && styles.timeSlotSelected]} onPress={() => setSelectedTime(t)}>
                <Text style={[styles.timeSlotText, selectedTime===t && styles.timeSlotTextSelected]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Service</Text>
          {services.map((svc) => {
            const selected = selectedService.id === svc.id;
            return (
              <TouchableOpacity key={svc.id} onPress={() => setSelectedService(svc)} activeOpacity={0.85}
                style={[styles.serviceCard, { borderColor: selected ? colors.primary : 'transparent', backgroundColor: colors.cardBackground }]}> 
                <View style={[styles.serviceIconWrap, { backgroundColor: selected ? colors.primary : '#E9EEFF' }]}> 
                  <MaterialCommunityIcons name={svc.icon as any} size={26} color={selected ? '#fff' : colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.serviceTitle, { color: colors.text }]}>{svc.title}</Text>
                  <Text style={[styles.serviceSub, { color: colors.icon }]}>${svc.rate}/hour</Text>
                </View>
                <View style={[styles.radio, { borderColor: selected ? colors.primary : colors.cardBorder, backgroundColor: selected ? colors.primary : 'transparent' }]} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Duration (Hours)</Text>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>{duration} hr</Text>
          </View>
          <Slider
            minimumValue={1}
            maximumValue={12}
            step={1}
            value={duration}
            onValueChange={setDuration}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.cardBorder}
            thumbTintColor={colors.primary}
            style={{ marginTop: 12 }}
          />
          <View style={styles.rowBetween}>
            <Text style={{ color: colors.icon }}>1h</Text>
            <Text style={{ color: colors.icon }}>12h</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.text }]}>Service Rate</Text><Text style={{ color: colors.text }}>${selectedService.rate}/hr</Text></View>
          <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.text }]}>Duration</Text><Text style={{ color: colors.text }}>{duration} hours</Text></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text><Text style={{ color: colors.primary, fontWeight: '800' }}>${total}</Text></View>
        </View>

        <TouchableOpacity
          style={[styles.cta, { backgroundColor: colors.gradientStart }, booking && { opacity: 0.7 }]} 
          onPress={handleBook}
          disabled={booking || fetching}
        >
          <Text style={styles.ctaText}>Book Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  back: { fontSize: 24, fontWeight: '700', marginRight: 10 },
  title: { fontSize: 24, fontWeight: '800' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  nurseRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 2 },
  nurseAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6B8CFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  nurseName: { fontSize: 16, fontWeight: '800' },
  dateButton: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 10, marginBottom: 12 },
  dateButtonText: { fontSize: 16, fontWeight: '700' },
  timeSlots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeSlot: { backgroundColor: '#f5f5f5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 2, borderColor: '#ddd', width: '48%' },
  timeSlotSelected: { borderColor: '#0066CC', backgroundColor: '#0066CC' },
  timeSlotText: { fontSize: 14, fontWeight: '700', color: '#333', textAlign: 'center' },
  timeSlotTextSelected: { color: '#fff' },
  serviceCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 12, borderWidth: 2 },
  serviceIconWrap: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  serviceTitle: { fontSize: 18, fontWeight: '800' },
  serviceSub: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginTop: 8 },
  totalLabel: { fontSize: 18, fontWeight: '800' },
  summaryLabel: { fontSize: 16, fontWeight: '700' },
  cta: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
