import React, { createContext, useContext, useState, useCallback } from 'react';
import { authAPI, usersAPI } from '../utils/api';
import { storageService } from '../utils/storage';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'user' | 'doctor' | 'nurse' | 'ambulance' | 'volunteer';
  latitude?: number;
  longitude?: number;
  isAvailable?: boolean;
  emergencyContacts?: any[];
  specialization?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateLocation: (latitude: number, longitude: number) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response.data;

      await storageService.setAuthToken(token);
      await storageService.setUserData(userData);

      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    setLoading(true);
    try {
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data;

      await storageService.setAuthToken(token);
      await storageService.setUserData(newUser);

      setUser(newUser);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await storageService.clearAuthData();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLocation = useCallback(
    async (latitude: number, longitude: number) => {
      if (user) {
        try {
          await usersAPI.updateLocation(user.id, latitude, longitude);
          setUser((prev) =>
            prev ? { ...prev, latitude, longitude } : null
          );
        } catch (error) {
          console.error('Update location error:', error);
        }
      }
    },
    [user]
  );

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isLoggedIn,
    login,
    register,
    logout,
    updateLocation,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
