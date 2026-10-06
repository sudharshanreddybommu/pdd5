import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default Backend URL points to current host machine on Wi-Fi
const DEFAULT_BASE_URL = 'http://172.23.50.66:5000/api';

export let BASE_API_URL = DEFAULT_BASE_URL;

// Load saved custom server IP if user configured it
AsyncStorage.getItem('opmd_custom_api_url').then((savedUrl) => {
  if (savedUrl) {
    BASE_API_URL = savedUrl;
    api.defaults.baseURL = savedUrl;
  }
}).catch(() => {});

export const setCustomApiUrl = async (url: string) => {
  BASE_API_URL = url;
  api.defaults.baseURL = url;
  await AsyncStorage.setItem('opmd_custom_api_url', url);
};

const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('opmd_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Error reading token from AsyncStorage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['opmd_token', 'opmd_user', 'opmd_profile']);
    }
    return Promise.reject(error);
  }
);

export default api;
