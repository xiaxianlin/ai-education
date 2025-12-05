import { studentApi } from "@ai-education/shared-frontend";
import { create } from "zustand";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthStoreState {
  isAuthenticated: boolean;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  check: () => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>(async (set) => {
  const token = await AsyncStorage.getItem("_t");

  return {
    isAuthenticated: token !== null,
    setToken: async (token: string) => {
      await AsyncStorage.setItem("_t", token);
      set({ isAuthenticated: true });
    },
    logout: async () => {
      await AsyncStorage.removeItem("_t");
      set({ isAuthenticated: false });
    },
    check: async () => {
      try {
        await studentApi.check();
      } catch (error) {
        await AsyncStorage.removeItem("_t");
        set({ isAuthenticated: false });
        throw error;
      }
    },
  };
});

