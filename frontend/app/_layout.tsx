import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { storageService } from '@/utils/storage';

function RootContent() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { isLoggedIn, setUser, setIsLoggedIn, setLoading } = useAuth();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const token = await storageService.getAuthToken();
      const userData = await storageService.getUserData();

      if (token && userData) {
        setUser(userData);
        setIsLoggedIn(true);
        router.replace('/(tabs)');
      } else {
        setIsLoggedIn(false);
        router.replace('/auth/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsLoggedIn(false);
      router.replace('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootContent />
    </AuthProvider>
  );
}
