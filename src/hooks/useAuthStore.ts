import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/services/api";
import type { AuthResponse, User, Role } from "@/types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: { email: string; password: string }) => Promise<User>;
  logout: () => void;
  hasRole: (roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      // Hydration effect: always reset isLoading to false on load
      _hydrate: () => set({ isLoading: false }),

      login: async ({ email, password }) => {
        set({ isLoading: true });
        console.log("Login payload:", { email, password });
        try {
          const { data } = await api.post<AuthResponse>("/api/auth/login", {
            email,
            password,
          });
          console.log("Login response data:", data);
          set({ user: data.user, token: data.token, isLoading: false });
          return data.user;
        } catch (e: any) {
          set({ isLoading: false });
          console.error("Login error:", e.response?.data || e.message);
          throw e;
        }
      },

      register: async ({
        name,
        email,
        password,
      }: {
        name: string;
        email: string;
        password: string;
      }) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post<AuthResponse>("/api/auth/register", {
            name,
            email,
            password,
          });
          set({ user: data.user, token: data.token, isLoading: false });
          return data.user;
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      logout: () => {
        set({ user: null, token: null });
      },

      hasRole: (roles) => {
        const u = get().user;
        return !!u && roles.includes(u.role);
      },
    }),
    {
      name: "auth-store",
      onRehydrateStorage: () => (state) => {
        state.isLoading = false;
      },
    }
  )
);
