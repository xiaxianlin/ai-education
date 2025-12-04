/**
 * 练习服务 API
 * 对应后端 server/student/routes/practice.py
 */
import { api } from "@/lib/api";
import type {
  PracticeSession,
  PracticeType,
  CreatePracticeRequest,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  UploadRecordingResult,
  CompletePracticeResponse,
  Question
} from "@/types";

export const practiceService = {
  // ===== 获取练习信息 =====

  /**
   * 获取每日练习
   * GET /practice/daily
   */
  getDailyPractice: async () => {
    return api.get<PracticeSession[]>("/practice/daily");
  },

  /**
   * 获取单元练习
   * GET /practice/unit
   */
  getUnitPractice: async () => {
    return api.get<PracticeSession[]>("/practice/unit");
  },

  /**
   * 获取能力评测
   * GET /practice/assessment
   */
  getAssessment: async () => {
    return api.get<PracticeSession[]>("/practice/assessment");
  },

  // ===== 创建练习 =====

  /**
   * 创建练习
   * POST /practice/create
   */
  createPractice: async (params: CreatePracticeRequest) => {
    return api.post<PracticeSession>(`/practice/create`, params);
  },

  // ===== 练习操作 =====

  /**
   * 开始练习
   * POST /practice/{session_id}/begin
   */
  beginPractice: async (sessionId: number) => {
    return api.post(`/practice/${sessionId}/begin`);
  },

  /**
   * 提交答案
   * POST /practice/answer
   */
  submitAnswer: async (params: SubmitAnswerParams) => {
    return api.post<SubmitAnswerResponse>("/practice/answer", params);
  },

  /**
   * 上传口语题录音并进行语音识别
   * POST /practice/answer/{session_id}/{question_id}/upload
   */
  uploadRecording: async (
    sessionId: number,
    questionId: number,
    audioBlob: Blob
  ) => {
    const formData = new FormData();
    formData.append("audio_file", audioBlob, "audio.webm");
    return api.postForm<UploadRecordingResult>(
      `/practice/answer/${sessionId}/${questionId}/upload`,
      formData
    );
  },

  /**
   * 完成练习
   * POST /practice/{session_id}/complete
   */
  completePractice: async (sessionId: number) => {
    return api.post<CompletePracticeResponse>(
      `/practice/${sessionId}/complete`
    );
  },

  // ===== 获取详情 =====

  /**
   * 获取练习会话详情
   * GET /practice/session/{session_id}
   */
  getSessionDetail: async (sessionId: number) => {
    return api.get<PracticeSessionDetail>(`/practice/detail/${sessionId}`);
  },

  /**
   * 获取练习历史记录
   * GET /practice/history/{type}
   */
  getHistory: async (
    type: "daily_practice" | "unit_practice" | "assessment",
    limit?: number
  ) => {
    const params = limit ? `?limit=${limit}` : "";
    return api.get<PracticeSession[]>(`/practice/history/${type}${params}`);
  },
};
