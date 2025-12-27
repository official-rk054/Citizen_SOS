/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Healthcare-inspired color theme with modern gradients
 */

import { Platform } from 'react-native';

// Healthcare Color Palette
const primaryBlue = '#0066CC';      // Medical blue
const secondaryGreen = '#00A86B';   // Healing green
const accentOrange = '#FF6B35';     // Energy orange
const accentPink = '#FF1654';       // Alert pink
const neutralGray = '#F5F6F7';      // Clean background
const darkGray = '#2C3E50';         // Dark text

const tintColorLight = primaryBlue;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: darkGray,
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    // Healthcare specific
    primary: primaryBlue,
    secondary: secondaryGreen,
    accent: accentOrange,
    danger: accentPink,
    success: secondaryGreen,
    cardBackground: neutralGray,
    cardBorder: '#E5E7EB',
    gradientStart: primaryBlue,
    gradientEnd: '#0052A3',
    secondaryGradientStart: secondaryGreen,
    secondaryGradientEnd: '#007D4F',
  },
  dark: {
    text: '#F3F4F6',
    background: '#0F172A',
    tint: tintColorDark,
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    // Healthcare specific
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F97316',
    danger: '#EF4444',
    success: '#10B981',
    cardBackground: '#1E293B',
    cardBorder: '#334155',
    gradientStart: '#3B82F6',
    gradientEnd: '#1E40AF',
    secondaryGradientStart: '#10B981',
    secondaryGradientEnd: '#047857',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
