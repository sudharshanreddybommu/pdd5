import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export type UserRole = 'PATIENT' | 'DOCTOR';

export interface User {
  id: string;
  phone?: string;
  email: string;
  role: UserRole;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: any | null;
  hospital: any | null;
  loading: boolean;
  login: (userData: { user: User; token: string; profile?: any; hospital?: any }) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('opmd_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState<any | null>(() => {
    const saved = localStorage.getItem('opmd_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [hospital, setHospital] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        setHospital(res.data.hospital || null);
        localStorage.setItem('opmd_user', JSON.stringify(res.data.user));
        if (res.data.profile) {
          localStorage.setItem('opmd_profile', JSON.stringify(res.data.profile));
        }
      }
    } catch (e) {
      setUser(null);
      setProfile(null);
      setHospital(null);
      localStorage.removeItem('opmd_token');
      localStorage.removeItem('opmd_user');
      localStorage.removeItem('opmd_profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('opmd_token');
    if (token) {
      refreshProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = (data: { user: User; token: string; profile?: any; hospital?: any }) => {
    localStorage.setItem('opmd_token', data.token);
    localStorage.setItem('opmd_user', JSON.stringify(data.user));
    if (data.profile) {
      localStorage.setItem('opmd_profile', JSON.stringify(data.profile));
    }
    setUser(data.user);
    setProfile(data.profile || null);
    setHospital(data.hospital || null);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    localStorage.removeItem('opmd_token');
    localStorage.removeItem('opmd_user');
    localStorage.removeItem('opmd_profile');
    setUser(null);
    setProfile(null);
    setHospital(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, hospital, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
