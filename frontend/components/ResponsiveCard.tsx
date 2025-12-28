import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from 'react-native';

interface ResponsiveCardProps {
  children: ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  padding?: 'small' | 'medium' | 'large';
  variant?: 'light' | 'dark' | 'primary';
}

const { width } = Dimensions.get('window');

export default function ResponsiveCard({
  children,
  style,
  elevated = true,
  padding = 'medium',
  variant = 'light',
}: ResponsiveCardProps) {
  const paddingMap = {
    small: 8,
    medium: 12,
    large: 16,
  };

  const variantMap = {
    light: '#fff',
    dark: '#F8F9FF',
    primary: '#EEF2FF',
  };

  const cardStyle: ViewStyle = {
    backgroundColor: variantMap[variant],
    borderRadius: 12,
    padding: paddingMap[padding],
    marginVertical: 8,
    marginHorizontal: 12,
    elevation: elevated ? 3 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: elevated ? 0.1 : 0,
    shadowRadius: 4,
    ...style,
  };

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({});
