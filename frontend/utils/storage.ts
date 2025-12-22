import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

interface StorageData {
  [key: string]: any;
}

export const storageService = {
  setAuthToken: async (token: string) => {
    try {
      await SecureStore.setItemAsync('authToken', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },

  getAuthToken: async () => {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  removeAuthToken: async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  setUserData: async (userData: any) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  },

  getUserData: async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  },

  clearAuthData: async () => {
    try {
      await AsyncStorage.multiRemove(['userData', 'authToken']);
      await SecureStore.deleteItemAsync('authToken');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },
};
