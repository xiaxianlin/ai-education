/**
 * 每日练习 API 服务
 * 负责每日练习相关的所有 API 调用
 */
import { api } from '@/lib/api';
import type {
  DailyPracticeSession,
  CreateDailyPracticeParams,
  DailyPracticeSessionDetail,
  DailyPracticeReport,
  DailyPracticeHistoryItem,
  SubmitAnswerParams,
  AnswerResult,
} from './types';

export const dailyPracticeApi = {
  /**
   * 创建每日练习会话
   */
  create: async (params: CreateDailyPracticeParams = {}): Promise<DailyPracticeSession> => {
    return api.post<DailyPracticeSession>('/practice/daily', {
      count: params.count || 10,
      practice_type: params.practice_type || 'daily',
    });
  },

  /**
   * 获取每日练习会话详情
   */
  getSession: async (sessionId: number): Promise<DailyPracticeSessionDetail> => {
    return api.get<DailyPracticeSessionDetail>(`/practice/daily/${sessionId}`);
  },

  /**
   * 提交每日练习答案
   */
  submitAnswer: async (params: SubmitAnswerParams): Promise<AnswerResult> => {
    return api.post<AnswerResult>('/practice/daily/answer', params);
  },

  /**
   * 完成每日练习
   */
  complete: async (sessionId: number): Promise<DailyPracticeReport> => {
    return api.post<DailyPracticeReport>('/practice/daily/complete', { session_id: sessionId });
  },

  /**
   * 获取每日练习历史
   */
  getHistory: async (limit?: number): Promise<DailyPracticeHistoryItem[]> => {
    const params = limit ? `?limit=${limit}` : '';
    return api.get<DailyPracticeHistoryItem[]>(`/practice/daily/history${params}`);
  },

  /**
   * 检查或创建每日练习（30道题）
   */
  checkToday: async (): Promise<{
    session: DailyPracticeSession | null;
    task_id: number | null;
    status: string;
    progress: number;
  }> => {
    return api.get('/practice/daily/check');
  },

  /**
   * 获取每日练习生成进度
   */
  getProgress: async (taskId: number): Promise<{
    status: string;
    progress: number;
    session?: DailyPracticeSession;
    error_message?: string;
  }> => {
    return api.get(`/practice/daily/progress/${taskId}`);
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
    return api.get('/practice/daily/stats');
  },

  /**
   * 上传录音文件
   */
  uploadAudio: async (audioBlob: Blob): Promise<{ audio_url: string }> => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    
    // 使用 axios 直接调用，因为需要 FormData
    const axios = (await import('axios')).default;
    const API_BASE_URL = 
      import.meta.env.VITE_API_BASE_URL || 
      (import.meta.env.MODE === 'development' ? '/api/student' : 'http://127.0.0.1:7890/api/student');
    
    const token = sessionStorage.getItem('_t');
    const response = await axios.post(
      `${API_BASE_URL}/practice/upload-audio`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-access-token': token || '',
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

