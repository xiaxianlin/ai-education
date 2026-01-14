import { create } from "zustand";
import { studentApi } from "../api/client";
import { useAuthStore } from "./useAuthStore";

interface Textbook {
  id: number;
  subject: string;
  grade: number;
  semester: string;
  name: string;
}

interface ProfileData {
  name: string | null;
  phone: string | null;
  grade: number | null;
  semester: string | null;
  subject: string | null;
  textbooks: Textbook[];
}

interface ProfileState {
  loading: boolean;
  profile: ProfileData;
  hasSettings: boolean;
  fetchProfile: () => Promise<void>;
  updateSettings: (params: { grade: number; semester: string; subject: string }) => Promise<void>;
  checkHasSettings: () => boolean;
}

const initialProfile: ProfileData = {
  name: null,
  phone: null,
  grade: null,
  semester: null,
  subject: null,
  textbooks: [],
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  loading: false,
  profile: initialProfile,
  hasSettings: false,

  fetchProfile: async () => {
    // 检查 token 是否可用
    const token = useAuthStore.getState().token;
    if (!token) {
      // Token 还未准备好，不执行请求
      return;
    }

    set({ loading: true });
    try {
      const data = await studentApi.getProfile();
      const { name, phone, grade, semester, subject, textbooks = [] } = data || {};
      const newProfile: ProfileData = { name, phone, grade, semester, subject, textbooks };
      set({
        profile: newProfile,
        hasSettings: !!(grade && semester && subject),
      });
    } catch (error: any) {
      // 401 表示未登录或登录失效，这是正常情况，不需要显示错误
      if (error?.message !== "登录失效") {
        console.error("获取用户信息失败:", error);
      }
    } finally {
      set({ loading: false });
    }
  },

  updateSettings: async (params: { grade: number; semester: string; subject: string }) => {
    try {
      await studentApi.updateSettings(params);
      // 成功后刷新 profile
      await get().fetchProfile();
    } catch (error) {
      console.error("更新设置失败:", error);
      throw error;
    }
  },

  checkHasSettings: () => {
    const state = get();
    const { grade, semester, subject } = state.profile;
    return !!(grade && semester && subject);
  },
}));
