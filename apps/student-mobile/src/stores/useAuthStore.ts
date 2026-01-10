import { create } from "zustand";

interface AuthState {
  token: string | null;
  user: any | null;
  _hasHydrated: boolean;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

import * as SecureStore from "expo-secure-store";
import { createJSONStorage, persist } from "zustand/middleware";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      _hasHydrated: false,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          return (await SecureStore.getItemAsync(name)) || null;
        },
        setItem: async (name, value) => {
          await SecureStore.setItemAsync(name, value);
        },
        removeItem: async (name) => {
          await SecureStore.deleteItemAsync(name);
        },
      })),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
