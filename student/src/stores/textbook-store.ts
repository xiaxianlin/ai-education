/**
 * 教材全局状态管理
 * 管理当前激活的教材和单元列表
 */
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface TextbookStoreState {
  activeTextbook: Textbook | null;
  units: Unit[];
  setActiveTextbook: (textbook: Textbook | null) => void;
  setUnits: (units: Unit[]) => void;
  clearTextbook: () => void;
}

export const useTextbookStore = create<TextbookStoreState>()(
  devtools(
    persist(
      (set) => ({
        activeTextbook: null,
        units: [],
        setActiveTextbook: (textbook) => set({ activeTextbook: textbook }),
        setUnits: (units) => set({ units }),
        clearTextbook: () => set({ activeTextbook: null, units: [] }),
      }),
      {
        name: "textbook-storage",
        partialize: (state) => ({
          activeTextbook: state.activeTextbook,
        }),
      }
    ),
    {
      name: "textbook-store",
    }
  )
);
