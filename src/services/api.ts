import axios from 'axios';
import { useAuthStore } from '@/hooks/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    withCredentials: true,
});

// Attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      useAuthStore.getState().logout();
      // Optionally: window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;