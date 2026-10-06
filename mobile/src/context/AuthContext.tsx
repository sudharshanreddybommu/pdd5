import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  isEmailVerified?: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  profile: any | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('opmd_token');
      const savedUser = await AsyncStorage.getItem('opmd_user');
      const savedProfile = await AsyncStorage.getItem('opmd_profile');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }

        // Verify with backend in background without blocking UI
        api.get('/auth/me')
          .then((res) => {
            if (res.data?.user) {
              setUser(res.data.user);
              AsyncStorage.setItem('opmd_user', JSON.stringify(res.data.user));
            }
          })
          .catch(() => {
            // Keep local offline user
          });
      }
    } catch (e) {
      console.warn('Auth check failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser, profile: receivedProfile } = res.data;

      setToken(receivedToken);
      setUser(receivedUser);
      setProfile(receivedProfile);

      await AsyncStorage.setItem('opmd_token', receivedToken);
      await AsyncStorage.setItem('opmd_user', JSON.stringify(receivedUser));
      if (receivedProfile) {
        await AsyncStorage.setItem('opmd_profile', JSON.stringify(receivedProfile));
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      return { success: false, message: msg };
    }
  };

  const register = async (data: any) => {
    try {
      const res = await api.post('/auth/register', data);
      return { success: true, message: res.data?.message || 'Registration successful' };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout').catch(() => {});
    } catch (e) {
      // Ignore
    } finally {
      setUser(null);
      setToken(null);
      setProfile(null);
      await AsyncStorage.multiRemove(['opmd_token', 'opmd_user', 'opmd_profile']);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        profile,
        loading,
        login,
        register,
        logout,
        checkAuth,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
