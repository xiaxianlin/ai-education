import { create } from 'zustand';

interface AuthState {
  token: string | null;
  student: any | null;
  isAuthenticated: boolean;
  setToken: (token: string | null) => void;
  setStudent: (student: any | null) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // 初始化时从 localStorage 读取 token
  const init = () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token, isAuthenticated: true });
    }
  };

  // 初始化
  if (typeof window !== 'undefined') {
    init();
  }

  return {
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    student: null,
    isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
    setToken: (token) => {
      if (token) {
        localStorage.setItem('token', token);
        set({ token, isAuthenticated: true });
      } else {
        localStorage.removeItem('token');
        set({ token: null, isAuthenticated: false });
      }
    },
    setStudent: (student) => set({ student }),
    logout: () => {
      localStorage.removeItem('token');
      set({ token: null, student: null, isAuthenticated: false });
    },
    init,
  };
});

