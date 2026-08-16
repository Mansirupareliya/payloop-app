import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';

interface User {
  id: string;
  email: string;
  phone?: string;
  name?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: true, // Start true for initial check
      hasCompletedOnboarding: false,

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      login: async (email, password) => {
        try {
          const { token, user } = await authApi.login({ email, password });
          set({ isAuthenticated: true, user, token });
        } catch (error) {
          console.error("Login failed:", error);
          throw error;
        }
      },

      signup: async (email, password, phone) => {
        try {
          // Register the user on backend — do NOT auto-login.
          // User must login manually after signup.
          await authApi.signup({ email, password, phone });
        } catch (error) {
          console.error("Signup failed:", error);
          throw error;
        }
      },

      logout: () => set({ isAuthenticated: false, user: null, token: null }),

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        try {
          // You could call authApi.verifyToken(token) here if it existed without using the global request
          // Or just let the api helper use the token from the store
          const { user } = await authApi.me();
          set({ isAuthenticated: true, user, isLoading: false });
        } catch (error) {
          console.error("Token verification failed:", error);
          set({ isAuthenticated: false, user: null, token: null, isLoading: false });
        }
      },
    }),
    {
      name: 'payloop-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
