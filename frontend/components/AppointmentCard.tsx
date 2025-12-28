import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface AppointmentCardProps {
  id: string;
  doctorName: string;
  specialty: string;
  time: string;
  date: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  colors: any;
  index: number;
  onPress?: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  id,
  doctorName,
  specialty,
  time,
  date,
  status,
  colors,
  index,
  onPress,
}) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const statusColors = {
    upcoming: {
      bg: ['#00A86B', '#006F47'],
      icon: 'clock-outline',
      label: 'Upcoming',
    },
    completed: {
      bg: ['#4CAF50', '#2E7D32'],
      icon: 'check-circle',
      label: 'Completed',
    },
    cancelled: {
      bg: ['#FF6B6B', '#CC5555'],
      icon: 'close-circle',
      label: 'Cancelled',
    },
  };

  const currentStatus = statusColors[status];

  return (
    <AnimatedTouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        transform: [
          { translateX: slideAnim },
          { scale: scaleAnim },
        ],
        opacity: fadeAnim,
      }}>
      <LinearGradient
        colors={['#FFFFFF', '#F9FAFB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor: colors.light.cardBorder }]}>
        {/* Status Badge */}
        <LinearGradient
          colors={currentStatus.bg as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statusBadge}>
          <MaterialCommunityIcons
            name={currentStatus.icon as any}
            size={16}
            color="#FFFFFF"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.statusText}>{currentStatus.label}</Text>
        </LinearGradient>

        {/* Doctor Info */}
        <View style={styles.doctorSection}>
          <View style={[styles.doctorAvatar, { backgroundColor: colors.light.primary }]}>
            <MaterialCommunityIcons name="doctor" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.doctorInfo}>
            <Text style={[styles.doctorName, { color: colors.light.text }]}>
              {doctorName}
            </Text>
            <Text style={[styles.specialty, { color: colors.light.icon }]}>
              {specialty}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View
          style={[
            styles.divider,
            { backgroundColor: colors.light.cardBorder },
          ]}
        />

        {/* Time Info */}
        <View style={styles.timeSection}>
          <View style={styles.timeItem}>
            <MaterialCommunityIcons
              name="calendar"
              size={16}
              color={colors.light.primary}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.timeText, { color: colors.light.text }]}>
              {date}
            </Text>
          </View>
          <View style={styles.timeItem}>
            <MaterialCommunityIcons
              name="clock"
              size={16}
              color={colors.light.primary}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.timeText, { color: colors.light.text }]}>
              {time}
            </Text>
          </View>
        </View>

        {/* Arrow Indicator */}
        <View style={styles.arrowContainer}>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={colors.light.primary}
          />
        </View>
      </LinearGradient>
    </AnimatedTouchableOpacity>
  );
};

export const AppointmentsList: React.FC<{
  appointments: AppointmentCardProps[];
  colors: any;
  onAppointmentPress?: (id: string) => void;
}> = ({ appointments, colors, onAppointmentPress }) => {
  const headerFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={{ paddingHorizontal: 16, marginVertical: 20 }}>
      <Animated.View style={{ opacity: headerFadeAnim }}>
        <Text style={[styles.listTitle, { color: colors.light.text }]}>
          Appointments
        </Text>
        <Text style={[styles.listSubtitle, { color: colors.light.icon }]}>
          {appointments.length} total
        </Text>
      </Animated.View>

      <View style={styles.appointmentsList}>
        {appointments.length > 0 ? (
          appointments.map((apt, index) => (
            <AppointmentCard
              key={apt.id}
              {...apt}
              colors={colors}
              index={index}
              onPress={() => onAppointmentPress?.(apt.id)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="calendar-blank"
              size={48}
              color={colors.light.icon}
            />
            <Text style={[styles.emptyText, { color: colors.light.text }]}>
              No appointments scheduled
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.light.icon }]}>
              Book an appointment with a doctor
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  doctorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  timeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  arrowContainer: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  listTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  appointmentsList: {
    marginTop: 16,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 4,
  },
});
