import axios from "axios";
import { useAuthStore } from "@/hooks/useAuthStore";

const api = axios.create({
  baseURL: "http://localhost:4000",
  withCredentials: true,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
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
