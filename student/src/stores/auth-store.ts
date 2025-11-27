import { authService } from "@/services/auth";
import { create } from "zustand";

interface AuthStoreState {
  token?: string;
  student?: Student;
  textbook?: Textbook;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>((set) => {
  const token = localStorage.getItem("_t");

  return {
    token: token ?? undefined,
    student: undefined,
    isAuthenticated: token !== null,
    setToken: (token) => {
      localStorage.setItem("_t", token);
      set({ token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem("_t");
      set({ token: undefined, student: undefined, isAuthenticated: false });
    },
    init: async () => {
      const res = await authService.check();
      set({ student: res.student, textbook: res.textbook });
    },
  };
});
