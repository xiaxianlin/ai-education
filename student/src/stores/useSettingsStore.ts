import { create } from 'zustand';

export interface UserSettings {
  grade: number | null; // 年级ID
  textbookVersion: string | null; // 教材版本
  semester: string | null; // 学期
  isInitialized: boolean; // 是否已完成初始设置
}

interface SettingsState {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  isSettingsComplete: () => boolean;
  init: () => void;
}

const STORAGE_KEY = 'student-settings';

const defaultSettings: UserSettings = {
  grade: null,
  textbookVersion: null,
  semester: null,
  isInitialized: false,
};

const loadSettings = (): UserSettings => {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return defaultSettings;
};

const saveSettings = (settings: UserSettings) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: typeof window !== 'undefined' ? loadSettings() : defaultSettings,
  
  updateSettings: (newSettings) => {
    const updatedSettings = {
      ...get().settings,
      ...newSettings,
      isInitialized: true,
    };
    set({ settings: updatedSettings });
    saveSettings(updatedSettings);
  },
  
  isSettingsComplete: () => {
    const { settings } = get();
    return (
      settings.grade !== null &&
      settings.textbookVersion !== null &&
      settings.semester !== null
    );
  },
  
  init: () => {
    const settings = loadSettings();
    set({ settings });
  },
}));

// 年级选项
export const GRADES = [
  { id: 1, stage: '小学', grade: '一年级', label: '小学一年级' },
  { id: 2, stage: '小学', grade: '二年级', label: '小学二年级' },
  { id: 3, stage: '小学', grade: '三年级', label: '小学三年级' },
  { id: 4, stage: '小学', grade: '四年级', label: '小学四年级' },
  { id: 5, stage: '小学', grade: '五年级', label: '小学五年级' },
  { id: 6, stage: '小学', grade: '六年级', label: '小学六年级' },
];

// 教材版本选项
export const TEXTBOOK_VERSIONS = [
  '人教版',
  '苏教版',
  '北师大版',
  '沪教版',
  '外研版',
  '其他',
];

// 学期选项
export const SEMESTERS = ['上学期', '下学期'];
