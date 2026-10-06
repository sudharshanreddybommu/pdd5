import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('opmd_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clean stale session
      if (localStorage.getItem('opmd_token')) {
        localStorage.removeItem('opmd_token');
        localStorage.removeItem('opmd_user');
        localStorage.removeItem('opmd_profile');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
