import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { go } from "./router";
import { toast } from "sonner";

const TOKEN_KEY = "_t";
/**
 * 基础 API 客户端
 */
class ApiClient {
  private client: AxiosInstance;

  constructor(config?: AxiosRequestConfig) {
    this.client = axios.create({
      baseURL: "/api/student",
      timeout: 10 * 60 * 1000, // 10 minutes
      headers: {
        "Content-Type": "application/json",
      },
      ...config,
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 添加认证 token
        const token = this.getToken();
        if (token) {
          config.headers["x-access-token"] = token;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      (error) => {
        // 统一错误处理
        const response = error.response;
        if (response) {
          const data = response.data as ApiResponse;
          const status = data?.status || response.status;

          // 处理认证错误
          if (status === 401 || status === 403) {
            this.removeToken();
            go("/login");
            return;
          }

          toast.error(data?.message || "网络错误");
          return response;
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * 获取 token
   */
  private getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * 移除 token
   */
  private removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  /**
   * GET 请求
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data as T;
  }

  /**
   * POST 请求
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  /**
   * PUT 请求
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data as T;
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  /**
   * POST FormData 请求（用于文件上传）
   */
  async postForm<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        "Content-Type": "multipart/form-data",
        ...config?.headers,
      },
    });
    return response.data.data as T;
  }
}

/**
 * 学生端 API 客户端类
 */
export class StudentApiClient extends ApiClient {
  // ========== 认证相关 ==========

  /**
   * 用户登录
   * POST /login
   */
  async login(params: { phone: string; password: string }): Promise<string> {
    return this.post<string>("/login", params);
  }

  /**
   * 检查登录状态
   * GET /check
   */
  async check(): Promise<void> {
    return this.get<void>("/check");
  }

  // ========== 用户信息 ==========

  /**
   * 获取用户资料
   * GET /profile
   */
  async getProfile(): Promise<Student> {
    return this.get<Student>("/profile");
  }

  // ========== 练习相关 ==========

  /**
   * 获取每日练习
   * GET /practice/daily
   */
  async getDailyPractice(): Promise<PracticeSession[]> {
    return this.get<PracticeSession[]>("/practice/daily");
  }

  /**
   * 获取单元练习
   * GET /practice/unit
   */
  async getUnitPractice(): Promise<PracticeSession[]> {
    return this.get<PracticeSession[]>("/practice/unit");
  }

  /**
   * 获取能力评测
   * GET /practice/assessment
   */
  async getAssessment(): Promise<PracticeSession[]> {
    return this.get<PracticeSession[]>("/practice/assessment");
  }

  /**
   * 创建练习（异步任务）
   * POST /practice/create
   * @returns 任务ID和状态
   */
  async createPractice(params: {
    type: "daily_practice" | "unit_practice" | "assessment";
    textbook_id: number;
    unit_id?: number;
  }): Promise<CreatePracticeTaskResponse> {
    return this.post<CreatePracticeTaskResponse>("/practice/create", params);
  }

  /**
   * 查询练习生成任务状态
   * GET /practice/task/{task_id}
   */
  async getPracticeTaskStatus(taskId: string): Promise<PracticeTaskStatusResponse> {
    return this.get<PracticeTaskStatusResponse>(`/practice/task/${taskId}`);
  }

  /**
   * 开始练习
   * POST /practice/{session_id}/begin
   */
  async beginPractice(sessionId: number): Promise<void> {
    return this.post<void>(`/practice/${sessionId}/begin`);
  }

  /**
   * 提交答案
   * POST /practice/answer
   */
  async submitAnswer(params: {
    session_id: number;
    question_id: number;
    answer: string;
    time_spent: number;
    is_audio_answer?: boolean;
    audio_data?: string;
    audio_match?: boolean;
    audio_analysis?: string;
  }): Promise<{
    is_correct: boolean;
    correct_answer: string;
    user_answer: string;
    analysis?: string;
  }> {
    return this.post<{
      is_correct: boolean;
      correct_answer: string;
      user_answer: string;
      analysis?: string;
    }>("/practice/answer", params);
  }

  /**
   * 上传口语题录音并进行语音识别
   * POST /practice/answer/{session_id}/{question_id}/upload
   */
  async uploadRecording(
    sessionId: number,
    questionId: number,
    audioBlob: Blob,
  ): Promise<{
    oss_path: string;
    transcription: string;
    match: boolean;
    analysis: string;
  }> {
    const formData = new FormData();
    formData.append("audio_file", audioBlob, "audio.webm");
    return this.postForm<{
      oss_path: string;
      transcription: string;
      match: boolean;
      analysis: string;
    }>(`/practice/answer/${sessionId}/${questionId}/upload`, formData);
  }

  /**
   * 完成练习
   * POST /practice/{session_id}/complete
   */
  async completePractice(sessionId: number): Promise<PracticeSession> {
    return this.post<PracticeSession>(`/practice/${sessionId}/complete`);
  }

  /**
   * 获取练习会话详情
   * GET /practice/detail/{session_id}
   */
  async getSessionDetail(sessionId: number): Promise<PracticeSession> {
    return this.get<PracticeSession>(`/practice/detail/${sessionId}`);
  }

  /**
   * 获取练习历史记录
   * GET /practice/history/{type}
   */
  async getPracticeHistory(
    type: "daily_practice" | "unit_practice" | "assessment",
    limit?: number,
  ): Promise<PracticeSession[]> {
    const params = limit ? { limit } : undefined;
    return this.get<PracticeSession[]>(`/practice/history/${type}`, { params });
  }

  // ========== 教材相关 ==========

  /**
   * 获取教材的单元列表
   * GET /textbook/{textbook_id}/units
   */
  async getTextbookUnits(textbookId?: number): Promise<Unit[]> {
    return this.get<Unit[]>(`/textbook/${textbookId}/units`);
  }

  /**
   * 获取单元的知识点列表
   * GET /textbook/{unit_id}/knowledges
   */
  async getUnitKnowledge(unitId: number): Promise<Knowledge[]> {
    return this.get<Knowledge[]>(`/textbook/${unitId}/knowledges`);
  }
}

/**
 * 学生端 API 客户端实例
 * 直接使用此实例调用 API 方法
 */
export const studentApi = new StudentApiClient();
