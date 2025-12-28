import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface QuickActionProps {
  id: string;
  icon: string;
  label: string;
  color: string;
  accentColor: string;
  index: number;
  onPress: () => void;
}

interface QuickActionsProps {
  actions: Array<{
    id: string;
    icon: string;
    label: string;
    color: string;
    accentColor: string;
  }>;
  colors: any;
  onActionPress: (id: string) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const QuickActionButton: React.FC<QuickActionProps> = ({
  id,
  icon,
  label,
  color,
  accentColor,
  index,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(index * 80, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: fadeAnim,
      }}>
      <LinearGradient
        colors={[color, accentColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.actionButton}>
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons name={icon as any} size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
      </LinearGradient>
    </AnimatedTouchable>
  );
};

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  colors,
  onActionPress,
}) => {
  const containerFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(containerFadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: containerFadeAnim,
        paddingHorizontal: 16,
        marginVertical: 20,
      }}>
      <Text style={[styles.sectionTitle, { color: colors.light.text }]}>
        Quick Actions
      </Text>
      <Text style={[styles.sectionSubtitle, { color: colors.light.icon }]}>
        Fast access to services
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {actions.map((action, index) => (
          <QuickActionButton
            key={action.id}
            {...action}
            index={index}
            onPress={() => onActionPress(action.id)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  scrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 16,
  },
  actionButton: {
    width: 110,
    height: 140,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
});
