/**
 * 设置全局状态管理
 * 管理用户偏好设置
 */
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// 年级常量
export const GRADES = [
  { id: 1, label: "一年级" },
  { id: 2, label: "二年级" },
  { id: 3, label: "三年级" },
  { id: 4, label: "四年级" },
  { id: 5, label: "五年级" },
  { id: 6, label: "六年级" },
  { id: 7, label: "七年级" },
  { id: 8, label: "八年级" },
  { id: 9, label: "九年级" },
];

interface SettingsStoreState {
  // 主题设置
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  
  // 字体大小
  fontSize: "small" | "medium" | "large";
  setFontSize: (size: "small" | "medium" | "large") => void;
  
  // 音效开关
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  
  // 重置所有设置
  resetSettings: () => void;
}

const defaultSettings = {
  theme: "system" as const,
  fontSize: "medium" as const,
  soundEnabled: true,
};

export const useSettingsStore = create<SettingsStoreState>()(
  devtools(
    persist(
      (set) => ({
        ...defaultSettings,
        setTheme: (theme) => set({ theme }),
        setFontSize: (fontSize) => set({ fontSize }),
        setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
        resetSettings: () => set(defaultSettings),
      }),
      {
        name: "settings-storage",
      }
    ),
    {
      name: "settings-store",
    }
  )
);
