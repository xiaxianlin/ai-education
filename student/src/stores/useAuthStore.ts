import { create } from 'zustand';
import { SecureStorage } from '@/shared/lib/secureStorage';
import type { StudentInfo } from '@/shared/types/api';

interface AuthState {
  token: string | null;
  student: StudentInfo | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  setStudent: (student: StudentInfo | null) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // 初始化时从安全存储读取 token
  const init = () => {
    const token = SecureStorage.getToken();
    if (token) {
      set({ token, isAuthenticated: true });
    }
  };

  // 初始化
  if (typeof window !== 'undefined') {
    init();
  }

  return {
    token: typeof window !== 'undefined' ? SecureStorage.getToken() : null,
    student: null,
    isAuthenticated: typeof window !== 'undefined' ? SecureStorage.hasToken() : false,
    setToken: (token) => {
      if (token) {
        SecureStorage.setToken(token);
        set({ token, isAuthenticated: true });
      } else {
        SecureStorage.removeToken();
        set({ token: null, isAuthenticated: false });
      }
    },
    setStudent: (student) => set({ student }),
    logout: () => {
      SecureStorage.removeToken();
      set({ token: null, student: null, isAuthenticated: false });
    },
    init,
  };
});

