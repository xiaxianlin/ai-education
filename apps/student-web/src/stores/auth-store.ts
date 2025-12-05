import { studentApi } from "@ai-education/shared-student";
import { create } from "zustand";

interface AuthStoreState {
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  check: () => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>((set) => {
  const token = localStorage.getItem("_t");

  return {
    isAuthenticated: token !== null,
    setToken: (token) => {
      localStorage.setItem("_t", token);
      set({ isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem("_t");
      set({ isAuthenticated: false });
    },
    check: () => studentApi.check(),
  };
});
