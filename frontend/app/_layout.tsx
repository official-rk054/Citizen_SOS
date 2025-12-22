import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="profile/index" />
          <Stack.Screen name="appointments/index" />
          <Stack.Screen name="appointments/book" />
          <Stack.Screen name="ambulance/book" />
          <Stack.Screen name="emergency/tracking" />
          <Stack.Screen name="doctors/map" />
          <Stack.Screen name="nearby/index" />
          <Stack.Screen name="settings/payment" />
          <Stack.Screen name="settings/orders" />
          <Stack.Screen name="settings/contact" />
          <Stack.Screen name="settings/help" />
          <Stack.Screen name="settings/faq" />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
