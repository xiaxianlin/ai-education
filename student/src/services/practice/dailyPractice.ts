/**
 * 每日练习 API 服务
 * 根据 API.md 规范实现
 */
import { api } from "@/lib/api";
import type { PracticeSession, DailyPracticeHistoryItem } from "./types";

export const dailyPracticeApi = {
  /**
   * 获取每日练习（根据 API.md: GET /api/student/practice/daily）
   * 获取当天的每日练习，如果当天没有，返回最近一次未完成的练习
   */
  getDaily: async (): Promise<PracticeSession | null> => {
    return api.get<PracticeSession | null>("/practice/daily");
  },

  /**
   * 创建每日练习（根据 API.md: POST /api/student/practice/daily）
   * 为学生生成今天的每日练习
   */
  create: async (): Promise<PracticeSession> => {
    return api.post<PracticeSession>("/practice/daily");
  },

  /**
   * 获取每日练习历史（根据 API.md: GET /api/student/practice/history/daily_practice）
   */
  getHistory: async (limit?: number): Promise<DailyPracticeHistoryItem[]> => {
    const params = limit ? `?limit=${limit}` : "";
    return api.get<DailyPracticeHistoryItem[]>(
      `/practice/history/daily_practice${params}`
    );
  },

  // ===== 兼容旧接口的方法 =====

  /**
   * 检查或创建每日练习
   * 先尝试获取，如果没有则创建
   */
  checkToday: async (): Promise<{
    session: PracticeSession | null;
    task_id: number | null;
    status: string;
    progress: number;
  }> => {
    try {
      const session = await dailyPracticeApi.getDaily();
      return {
        session,
        task_id: null,
        status: session
          ? session.status === 2
            ? "completed"
            : session.status === 1
            ? "in_progress"
            : "pending"
          : "failed",
        progress: session ? (session.status === 2 ? 100 : 0) : 0,
      };
    } catch (error) {
      return {
        session: null,
        task_id: null,
        status: "failed",
        progress: 0,
      };
    }
  },

  /**
   * 获取每日练习会话详情
   * 使用统一的会话详情接口
   */
  getSession: async (
    sessionId: number
  ): Promise<{ session: PracticeSession; questions?: any[] }> => {
    // 使用统一的会话详情接口
    const { practiceApi } = await import("./index");
    return practiceApi.getSessionDetail(sessionId);
  },

  /**
   * 提交每日练习答案
   * 使用统一的答案提交接口
   */
  submitAnswer: async (params: {
    session_id: number;
    question_id: number;
    answer: string;
    time_spent?: number;
    is_audio_answer?: boolean;
    audio_data?: string;
  }): Promise<{
    is_correct: boolean;
    correct_answer: string;
    analysis?: string;
    session_progress: {
      answer_count: number;
      correct_count: number;
      total_count: number;
    };
  }> => {
    const { practiceApi } = await import("./index");
    return practiceApi.submitAnswer(params);
  },

  /**
   * 完成每日练习
   * 使用统一的完成接口
   */
  complete: async (sessionId: number): Promise<{ report_id: number }> => {
    const { practiceApi } = await import("./index");
    return practiceApi.completePractice(sessionId);
  },

  /**
   * 获取每日练习生成进度（已废弃）
   */
  getProgress: async (): Promise<{
    status: string;
    progress: number;
    session?: PracticeSession;
    error_message?: string;
  }> => {
    // 新接口不再需要进度查询，直接返回
    return {
      status: "completed",
      progress: 100,
    };
  },

  /**
   * 获取每日练习统计数据
   */
  getStats: async (): Promise<{
    today_progress: number;
    daily_questions: number;
    completed_questions: number;
    consecutive_days: number;
    total_practice: number;
  }> => {
    // 从历史记录中计算统计数据
    const history = await dailyPracticeApi.getHistory(30);
    const today = new Date();
    const todayStr = `${today.getFullYear()}${String(
      today.getMonth() + 1
    ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
    const todayNum = parseInt(todayStr);

    const todaySession = history.find((item) => item.target_id === todayNum);
    const completedQuestions = todaySession?.answer_count || 0;
    const dailyQuestions = todaySession?.question_count || 0;

    return {
      today_progress:
        dailyQuestions > 0 ? (completedQuestions / dailyQuestions) * 100 : 0,
      daily_questions: dailyQuestions,
      completed_questions: completedQuestions,
      consecutive_days: 0, // 需要后端支持
      total_practice: history.length,
    };
  },

  /**
   * 上传录音文件
   */
  uploadAudio: async (audioBlob: Blob): Promise<{ audio_url: string }> => {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    // 使用 axios 直接调用，因为需要 FormData
    const axios = (await import("axios")).default;
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL ||
      (import.meta.env.MODE === "development"
        ? "/api/student"
        : "http://127.0.0.1:7890/api/student");

    const token = sessionStorage.getItem("_t");
    const response = await axios.post(
      `${API_BASE_URL}/practice/upload-audio`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-access-token": token || "",
        },
      }
    );

    // 处理响应格式
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return response.data;
  },
};
