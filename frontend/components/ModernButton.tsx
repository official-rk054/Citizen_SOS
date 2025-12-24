import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  iconColor?: string;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: {
    backgroundColor: '#5B5FFF',
    textColor: '#fff',
    borderColor: undefined,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: '#F8F9FF',
    textColor: '#5B5FFF',
    borderColor: '#5B5FFF',
    borderWidth: 1.5,
  },
  danger: {
    backgroundColor: '#FF4444',
    textColor: '#fff',
    borderColor: undefined,
    borderWidth: 0,
  },
  success: {
    backgroundColor: '#4CAF50',
    textColor: '#fff',
    borderColor: undefined,
    borderWidth: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    textColor: '#5B5FFF',
    borderColor: '#5B5FFF',
    borderWidth: 1.5,
  },
};

const sizeStyles = {
  small: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 12 },
  medium: { paddingVertical: 10, paddingHorizontal: 20, fontSize: 14 },
  large: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16 },
};

export default function ModernButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  iconColor,
  style,
  fullWidth = false,
}: ModernButtonProps) {
  const variantStyle = variantStyles[variant] || variantStyles.primary;
  const sizeStyle = sizeStyles[size] || sizeStyles.medium;

  const buttonStyle: ViewStyle = {
    backgroundColor: variantStyle.backgroundColor,
    borderColor: variantStyle.borderColor,
    borderWidth: variantStyle.borderWidth,
    borderRadius: 10,
    paddingVertical: sizeStyle.paddingVertical,
    paddingHorizontal: sizeStyle.paddingHorizontal,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    ...style,
  };

  const textStyle: TextStyle = {
    color: variantStyle.textColor,
    fontSize: sizeStyle.fontSize as any,
    fontWeight: '600',
    marginHorizontal: icon ? 6 : 0,
  };

  const renderIcon = () => {
    if (!icon || loading) return null;
    return (
      <MaterialIcons
        name={icon as any}
        size={sizeStyle.fontSize + 2}
        color={iconColor || variantStyle.textColor}
        style={{ marginRight: iconPosition === 'left' ? 6 : 0, marginLeft: iconPosition === 'right' ? 6 : 0 }}
      />
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {iconPosition === 'left' && renderIcon()}
      {loading ? (
        <ActivityIndicator color={variantStyle.textColor} size="small" />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
      {iconPosition === 'right' && renderIcon()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
