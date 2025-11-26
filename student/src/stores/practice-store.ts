/**
 * 练习全局状态管理
 * 管理当前练习会话和会话详情
 */
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface PracticeStoreState {
  currentSession: PracticeSession | null;
  sessionDetail: PracticeSessionDetail | null;
  setCurrentSession: (session: PracticeSession | null) => void;
  setSessionDetail: (detail: PracticeSessionDetail | null) => void;
  clearSession: () => void;
}

export const usePracticeStore = create<PracticeStoreState>()(
  devtools(
    (set) => ({
      currentSession: null,
      sessionDetail: null,
      setCurrentSession: (session) => set({ currentSession: session }),
      setSessionDetail: (detail) => set({ sessionDetail: detail }),
      clearSession: () => set({ currentSession: null, sessionDetail: null }),
    }),
    {
      name: "practice-store",
    }
  )
);
