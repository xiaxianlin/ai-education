import { go } from "@ai-education/shared-web";
import { ApiClient } from "@ai-education/shared-web/api";
import { toast } from "sonner";

export const apiClient = new ApiClient("/api/student");

apiClient.addResponseInterceptor(
  (response) => {
    const { status, message } = response?.data || {};
    // 处理认证错误
    if (status === 0) {
      return response;
    }
    if (status === 401) {
      apiClient.removeToken();
      go("/login");
    }
    throw Error(message);
  },
  (error) => error
);

apiClient.addResponseInterceptor(
  (response) => response,
  (error) => {
    // 仅在开发环境输出日志
    if (process.env.NODE_ENV === "development") {
      console.log(error.message);
    }
    toast.error(error.message || "网络错误");
    return Promise.reject(error);
  }
);

/**
 * 学生端 API 客户端类
 */
export const studentApi = {
  // ========== 认证相关 ==========

  /**
   * 用户登录
   * POST /login
   */
  async login(params: LoginRequest) {
    return apiClient.post<string>("/login", params);
  },

  /**
   * 检查登录状态
   * GET /check
   */
  async check() {
    return apiClient.get<string>("/check");
  },

  // ========== 用户信息 ==========

  /**
   * 获取用户资料
   * GET /profile
   */
  async getProfile() {
    return apiClient.get<Profile>("/profile");
  },

  // ========== 练习相关 ==========

  /**
   * 获取日常练习
   * GET /practice_session/daily
   */
  async getDailyPractices() {
    return apiClient.get<PracticeSession[]>("/practice_session/daily");
  },

  /**
   * 获取单元练习
   * GET /practice_session/unit/{textbook_id}
   */
  async getUnitPractices(textbookId: number) {
    return apiClient.get<PracticeSession[]>(`/practice_session/unit/${textbookId}`);
  },

  /**
   * 获取能力评测
   * GET /practice_session/assessment
   */
  async getAssessments() {
    return apiClient.get<PracticeSession[]>(`/practice_session/assessment`);
  },

  /**
   * 创建练习
   * POST /practice_session/create
   * @returns 练习会话 ID
   */
  async createPractice(params: CreatePracticeRequest) {
    return apiClient.post<number>("/practice_session/create", params);
  },

  /**
   * 开始练习
   * POST /practice_session/{session_id}/begin
   */
  async beginPractice(sessionId: number) {
    return apiClient.post(`/practice_session/${sessionId}/begin`);
  },

  /**
   * 提交答案
   * POST /practice_session/answer
   */
  async submitAnswer(params: AnswerRequest) {
    return apiClient.post<PracticeSessionAnswer>("/practice_session/answer", params);
  },

  /**
   * 上传口语题录音并进行语音识别
   * POST /practice_session/answer/audio/asr
   */
  async audioAnswerAnalyze(audioBlob: Blob) {
    const formData = new FormData();
    formData.append("audio_file", audioBlob, "audio.webm");
    return apiClient.form<AudioAnswerAnalysisResponse>("/practice_session/answer/audio/asr", formData);
  },

  /**
   * 完成练习
   * POST /practice_session/{session_id}/complete
   * @returns 报告 ID
   */
  async completePractice(sessionId: number) {
    return apiClient.post<number>(`/practice_session/${sessionId}/complete`);
  },

  /**
   * 获取练习会话详情
   * GET /practice_session/{session_id}
   */
  async getPracticeSessionData(sessionId: number) {
    return apiClient.get<PracticeSessionData>(`/practice_session/${sessionId}`);
  },

  /**
   * 获取练习历史记录
   * GET /practice_session/records/{practice_id}
   */
  async getPracticeRecords(practiceId: number): Promise<PracticeSession[]> {
    return apiClient.get<PracticeSession[]>(`/practice_session/records/${practiceId}`);
  },

  /**
   * 获取单元的知识点列表
   * GET /textbook/{unit_id}/knowledges
   */
  async getUnitKnowledges(unitId: number) {
    return apiClient.get<Knowledge[]>(`/textbook/${unitId}/knowledges`);
  },

  /**
   * 获取教材的单元列表
   * GET /textbook/{textbook_id}/units
   */
  async getTextbookUnits(textbookId: number) {
    return apiClient.get<Unit[]>(`/textbook/${textbookId}/units`);
  },
};
