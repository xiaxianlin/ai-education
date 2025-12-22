import { go } from "@ai-education/shared-web";
import { toast } from "sonner";
import { ApiClient } from "@ai-education/shared-web/api";

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
    if (process.env.NODE_ENV === 'development') {
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
   * GET /practice/daily
   */
  async getDailyPractice(textbookId: number) {
    return apiClient.get<PracticeSession>(`/practice/daily/${textbookId}`);
  },

  /**
   * 获取单元练习
   * GET /practice/unit
   */
  async getUnitPractice(unitId: number) {
    return apiClient.get<PracticeSession>(`/practice/unit/${unitId}`);
  },

  /**
   * 获取能力评测
   * GET /practice/assessment
   */
  async getAssessment(textbookId: number) {
    return apiClient.get<PracticeSession>(`/practice/assessment/${textbookId}`);
  },

  /**
   * 获取可用的练习列表（系统+自定义）
   * GET /practice/list
   */
  async listPractices() {
    return apiClient.get<Practice[]>("/practice/list");
  },

  /**
   * 创建练习（异步任务）
   * POST /practice/create
   * @returns 任务ID
   */
  async createPractice(params: CreatePracticeRequest) {
    return apiClient.post<string>("/practice/create", params);
  },

  /**
   * 查询练习生成任务状态
   * GET /practice/task/{task_id}/status
   * @returns Celery 任务状态字符串
   */
  async getPracticeTaskStatus(taskId: string) {
    return apiClient.get<TaskStatus>(`/practice/task/${taskId}/status`);
  },

  /**
   * 开始练习
   * POST /practice/{session_id}/begin
   */
  async beginPractice(sessionId: number) {
    return apiClient.post(`/practice/${sessionId}/begin`);
  },

  /**
   * 提交答案
   * POST /practice/answer
   */
  async submitAnswer(params: AnswerRequest) {
    return apiClient.post<PracticeAnswer>("/practice/answer", params);
  },

  /**
   * 上传口语题录音并进行语音识别
   * POST /practice/answer/audio/analyze
   */
  async audioAnswerAnalyze(sessionId: number, questionId: string, audioBlob: Blob) {
    const formData = new FormData();
    formData.append("session_id", sessionId.toString());
    formData.append("question_id", questionId);
    formData.append("audio_type", "webm");
    formData.append("audio_file", audioBlob, "audio.webm");
    return apiClient.form<AudioAnswerAnalysisResponse>("/practice/answer/audio/analyze", formData);
  },

  /**
   * 完成练习
   * POST /practice/{session_id}/complete
   * @returns 报告 ID
   */
  async completePractice(sessionId: number) {
    return apiClient.post<number>(`/practice/${sessionId}/complete`);
  },

  /**
   * 获取练习会话详情
   * GET /practice/detail/{session_id}
   */
  async getSessionDetail(sessionId: number) {
    return apiClient.get<PracticeData>(`/practice/detail/${sessionId}`);
  },

  /**
   * 获取练习历史记录
   * GET /practice/history/{type}
   */
  async getPracticeHistory(type: PracticeType): Promise<PracticeSession[]> {
    return apiClient.get<PracticeSession[]>(`/practice/history/${type}`);
  },

  // ========== 教材相关 ==========

  /**
   * 获取教材的单元列表
   * GET /textbook/{textbook_id}/units
   */
  async getTextbookUnits(textbookId?: number) {
    return apiClient.get<Unit[]>(`/textbook/${textbookId}/units`);
  },

  /**
   * 获取单元的知识点列表
   * GET /textbook/{unit_id}/knowledges
   */
  async getUnitKnowledge(unitId: number) {
    return apiClient.get<Knowledge[]>(`/textbook/${unitId}/knowledges`);
  },
};
