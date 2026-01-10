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

  /**
   * 更新学生设置
   * PUT /profile
   */
  async updateSettings(params: UpdateStudentSettingsRequest) {
    return apiClient.put("/profile", params);
  },

  // ========== 练习相关 ==========

  /**
   * 获取练习
   * GET /practice/?practice_type=ability_practice&ability_code=xxx
   * GET /practice/?practice_type=unit_practice&unit_id=xxx
   */
  async getPractice(params: {
    practice_type: "ability_practice" | "unit_practice";
    ability_code?: string;
    unit_id?: number;
  }) {
    return apiClient.get<Practice | null>("/practice/", params);
  },

  /**
   * 获取原子能力列表
   * GET /ability/atomics
   */
  async getAbilityAtomics(subject: string, grade: number) {
    return apiClient.get<AbilityAtomic[]>("/ability/atomics", { subject, grade });
  },

  /**
   * 创建练习
   * POST /practice/create
   * @returns 练习 ID
   */
  async createPractice(params: CreatePracticeRequest) {
    return apiClient.post<string>("/practice/create", params);
  },

  /**
   * 开始练习
   * POST /practice/{session_id}/begin
   */
  async beginPractice(sessionId: string) {
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
   * POST /practice/answer/audio/asr
   */
  async audioAnswerAnalyze(audioBlob: Blob) {
    const formData = new FormData();
    formData.append("audio_file", audioBlob, "audio.webm");
    return apiClient.form<AudioAnswerAnalysisResponse>("/practice/answer/audio/asr", formData);
  },

  /**
   * 完成练习
   * POST /practice/{session_id}/complete
   * @returns 报告 ID
   */
  async completePractice(sessionId: string) {
    return apiClient.post<number>(`/practice/${sessionId}/complete`);
  },

  /**
   * 获取练习详情
   * GET /practice/{session_id}
   */
  async getPracticeData(sessionId: string) {
    return apiClient.get<PracticeData>(`/practice/${sessionId}`);
  },

  /**
   * 获取练习生成进度
   * GET /practice/progress/{session_id}
   */
  async getPracticeProgress(sessionId: string) {
    return apiClient.get<{ progress: number; step: string; message: string }>(`/practice/progress/${sessionId}`);
  },

  /**
   * 获取练习会话数据（别名，兼容旧代码）
   * GET /practice/{session_id}
   */
  async getPracticeSessionData(sessionId: string | number) {
    return apiClient.get<PracticeData>(`/practice/${sessionId}`);
  },

  /**
   * 获取练习历史记录
   * GET /practice/records
   * 返回当前学生年级和学科的练习记录
   */
  async getPracticeRecords(
    page: number = 1,
    pageSize: number = 20
  ): Promise<{
    data: Practice[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    return apiClient.get<{
      data: Practice[];
      total: number;
      page: number;
      pageSize: number;
    }>("/practice/records", { page, page_size: pageSize });
  },

  /**
   * 获取练习统计数据
   * GET /practice/statistics
   */
  async getPracticeStatistics() {
    return apiClient.get<PracticeStatisticsResponse>("/practice/statistics");
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
