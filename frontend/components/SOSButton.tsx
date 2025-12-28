import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface SOSButtonProps {
  isActive: boolean;
  onPress: () => void;
  onCancel?: () => void;
  colors: any;
}

export const SOSButton: React.FC<SOSButtonProps> = ({
  isActive,
  onPress,
  onCancel,
  colors,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ripple1Anim = useRef(new Animated.Value(0)).current;
  const ripple2Anim = useRef(new Animated.Value(0)).current;
  const ripple3Anim = useRef(new Animated.Value(0)).current;

  // Pulse animation for the button
  useEffect(() => {
    if (!isActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isActive]);

  // Ripple animation for active state
  useEffect(() => {
    if (isActive) {
      const ripple = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ripple1Anim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(ripple2Anim, {
              toValue: 1,
              duration: 1200,
              delay: 200,
              useNativeDriver: true,
            }),
            Animated.timing(ripple3Anim, {
              toValue: 1,
              duration: 1400,
              delay: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(ripple1Anim, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(ripple2Anim, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(ripple3Anim, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      ripple.start();
      return () => ripple.stop();
    }
  }, [isActive]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const rippleStyle = (anim: any) => ({
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 0],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 2.5],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      {isActive && (
        <>
          <Animated.View
            style={[
              styles.ripple,
              styles.ripple1,
              rippleStyle(ripple1Anim),
            ]}
          />
          <Animated.View
            style={[
              styles.ripple,
              styles.ripple2,
              rippleStyle(ripple2Anim),
            ]}
          />
          <Animated.View
            style={[
              styles.ripple,
              styles.ripple3,
              rippleStyle(ripple3Anim),
            ]}
          />
        </>
      )}

      <Animated.View
        style={{
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
          ],
        }}>
        <TouchableOpacity
          onPress={isActive ? onCancel : onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}>
          <LinearGradient
            colors={
              isActive
                ? ['#FF1654', '#CC1244']
                : ['#FF6B35', '#FF5520']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.button,
              {
                shadowColor: isActive ? '#FF1654' : '#FF6B35',
                shadowOpacity: isActive ? 0.4 : 0.2,
              },
            ]}>
            <MaterialCommunityIcons
              name={isActive ? 'close-circle' : 'phone-alert'}
              size={32}
              color="#FFFFFF"
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.textContainer}>
        <Text style={[styles.buttonLabel, { color: colors.light.text }]}>
          {isActive ? 'Cancel SOS' : 'Emergency SOS'}
        </Text>
        <Text style={[styles.buttonSubtext, { color: colors.light.icon }]}>
          {isActive
            ? 'Help is on the way'
            : 'Press for immediate help'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  ripple: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#FF1654',
  },
  ripple1: {
    width: 120,
    height: 120,
    top: '50%',
    left: '50%',
    marginTop: -60,
    marginLeft: -60,
  },
  ripple2: {
    width: 120,
    height: 120,
    top: '50%',
    left: '50%',
    marginTop: -60,
    marginLeft: -60,
  },
  ripple3: {
    width: 120,
    height: 120,
    top: '50%',
    left: '50%',
    marginTop: -60,
    marginLeft: -60,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 12,
  },
  textContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 12,
    fontWeight: '500',
  },
});
