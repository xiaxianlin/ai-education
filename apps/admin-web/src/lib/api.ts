import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { go } from './router';

const TOKEN_KEY = 'token';
/**
 * 基础 API 客户端
 */
export class ApiClient {
  private client: AxiosInstance;

  constructor(config?: AxiosRequestConfig) {
    this.client = axios.create({
      baseURL: '/api/admin',
      timeout: 10 * 60 * 1000, // 10 minutes
      headers: { 'Content-Type': 'application/json' },
      ...config,
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 添加认证 token
        const token = this.getToken();
        if (token) {
          config.headers['x-access-token'] = token;
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
            go('/login');
            return data?.message || error.message || '网络错误';
          }
          return response.data;
        }
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
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
    return response.data.data as T;
  }
}

/**
 * 管理端 API 客户端类
 */
export class AdminApiClient extends ApiClient {
  // ========== 认证相关 ==========

  /**
   * 登录
   */
  async login(data: LoginModel): Promise<string> {
    return this.post<string>('/login', data);
  }

  /**
   * 检查登录状态
   */
  async check(): Promise<Manager> {
    return this.get<Manager>('/check');
  }

  /**
   * 修改密码
   */
  async modifyPassword(data: ModifyPasswordModel): Promise<void> {
    return this.post<void>('/modify_password', data);
  }

  // ========== 管理员管理 ==========

  /**
   * 创建管理员
   */
  async createManager(data: CreateManagerModel): Promise<Manager> {
    return this.post<Manager>('/manager', data);
  }

  /**
   * 删除管理员
   */
  async deleteManager(id: string): Promise<void> {
    return this.delete<void>(`/manager/${id}`);
  }

  /**
   * 更新管理员状态
   */
  async updateManagerStatus(id: string, status: number): Promise<void> {
    return this.patch<void>(`/manager/${id}/status/${status}`);
  }

  /**
   * 更新管理员类型
   */
  async updateManagerType(id: string, type: number): Promise<void> {
    return this.patch<void>(`/manager/${id}/type/${type}`);
  }

  /**
   * 获取所有管理员
   */
  async getAllManagers(): Promise<Manager[]> {
    return this.get<Manager[]>('/manager/all');
  }

  /**
   * 重置管理员密码
   */
  async resetManagerPassword(id: string): Promise<{ password: string }> {
    return this.post<{ password: string }>(`/manager/${id}/reset`);
  }

  // ========== 学生管理 ==========

  /**
   * 搜索学生
   */
  async searchStudents(params?: SearchParams & { phone?: string; status?: number }): Promise<ListResponse<Student>> {
    return this.get<ListResponse<Student>>('/student/search', { params });
  }

  /**
   * 创建学生
   */
  async createStudent(data: { name: string; phone: string }): Promise<Student> {
    return this.post<Student>('/student', data);
  }

  /**
   * 更新学生
   */
  async updateStudent(
    id: string,
    data: { name?: string; phone?: string; grade?: number; status?: number },
  ): Promise<Student> {
    return this.patch<Student>(`/student/${id}`, data);
  }

  /**
   * 获取学生详情
   */
  async getStudentDetail(id: string): Promise<Student> {
    return this.get<Student>(`/student/${id}`);
  }

  /**
   * 删除学生
   */
  async deleteStudent(id: string): Promise<void> {
    return this.delete<void>(`/student/${id}`);
  }

  /**
   * 重置学生密码
   */
  async resetStudentPassword(id: string): Promise<{ password: string }> {
    return this.post<{ password: string }>(`/student/${id}/reset_password`);
  }

  /**
   * 获取学生的教材列表
   */
  async getStudentTextbooks(id: string): Promise<Textbook[]> {
    return this.get<Textbook[]>(`/student/${id}/textbooks`);
  }

  /**
   * 获取学生未使用的教材列表
   */
  async getStudentUnusedTextbooks(id: string): Promise<Textbook[]> {
    return this.get<Textbook[]>(`/student/${id}/unused_textbooks`);
  }

  /**
   * 为学生添加教材
   */
  async addStudentTextbook(id: string, textbookId: number): Promise<void> {
    return this.post<void>(`/student/${id}/textbook/${textbookId}`);
  }

  /**
   * 移除学生的教材
   */
  async removeStudentTextbook(id: string, textbookId: number): Promise<void> {
    return this.delete<void>(`/student/${id}/textbook/${textbookId}`);
  }

  // ========== 题目管理 ==========

  /**
   * 获取题目
   */
  async getQuestion(id: string): Promise<Question> {
    return this.get<Question>(`/question/${id}`);
  }

  /**
   * 搜索题目
   */
  async searchQuestions(
    params?: SearchParams & {
      question_id?: number;
      keyword?: string;
      textbook_id?: number;
      unit_id?: number;
      type?: string;
      subtype?: string;
      difficulty?: string;
      subject?: string;
      grade?: number;
    },
  ): Promise<ListResponse<Question>> {
    return this.get<ListResponse<Question>>('/question/search', { params });
  }

  /**
   * 搜索资源题目
   */
  async searchResourceQuestions(
    params?: SearchParams & {
      question_id?: number;
      keyword?: string;
      textbook_id?: number;
      unit_id?: number;
      type?: string;
      subtype?: string;
      difficulty?: string;
      subject?: string;
      grade?: number;
    },
  ): Promise<ListResponse<Question>> {
    return this.get<ListResponse<Question>>('/question/resource/search', { params });
  }

  /**
   * 更新题目
   */
  async updateQuestion(
    id: string,
    data: {
      subject?: string;
      grade?: number;
      type?: string;
      subtype?: string;
      content?: string;
      options?: string | string[];
      answer?: string;
      resource?: string;
      resource_type?: string;
      resource_content?: string;
      difficulty?: string;
      knowledge?: string;
      unit_id?: number;
      textbook_id?: number;
    },
  ): Promise<Question> {
    return this.patch<Question>(`/question/${id}`, data);
  }

  /**
   * 删除题目
   */
  async deleteQuestion(id: string): Promise<void> {
    return this.delete<void>(`/question/${id}`);
  }

  /**
   * 生成题目图片
   */
  async generateQuestionImage(id: string): Promise<Question> {
    return this.post<Question>(`/question/${id}/generate_image`);
  }

  /**
   * 生成题目音频
   */
  async generateQuestionAudio(id: string): Promise<Question> {
    return this.post<Question>(`/question/${id}/generate_audio`);
  }

  // ========== 教材管理 ==========

  /**
   * 获取教材
   */
  async getTextbook(id: number): Promise<Textbook> {
    return this.get<Textbook>(`/textbook/${id}`);
  }

  /**
   * 搜索教材
   */
  async searchTextbooks(
    params?: SearchParams & {
      version?: string;
      subject?: string;
      grade?: string;
    },
  ): Promise<ListResponse<Textbook>> {
    return this.get<ListResponse<Textbook>>('/textbook/search', { params });
  }

  /**
   * 创建教材
   */
  async createTextbook(data: { subject: string; version: string; grade: number; semester: string }): Promise<Textbook> {
    return this.post<Textbook>('/textbook', data);
  }

  /**
   * 更新教材
   */
  async updateTextbook(
    id: number,
    data: {
      subject: string;
      version: string;
      grade: number;
      semester: string;
    },
  ): Promise<Textbook> {
    return this.put<Textbook>(`/textbook/${id}`, data);
  }

  /**
   * 删除教材
   */
  async deleteTextbook(id: number): Promise<void> {
    return this.delete<void>(`/textbook/${id}`);
  }

  /**
   * 解析教材
   */
  async parseTextbook(id: number): Promise<Textbook> {
    return this.post<Textbook>(`/textbook/${id}/parse`);
  }

  /**
   * 切换教材状态
   */
  async toggleTextbookStatus(id: number, status: number): Promise<Textbook> {
    return this.patch<Textbook>(`/textbook/${id}/status/${status}`);
  }

  /**
   * 获取教材的单元列表
   */
  async getTextbookUnits(id: number): Promise<Unit[]> {
    return this.get<Unit[]>(`/textbook/${id}/units`);
  }

  /**
   * 获取教材的知识点列表
   */
  async getTextbookKnowledges(id: number): Promise<Knowledge[]> {
    return this.get<Knowledge[]>(`/textbook/${id}/knowledges`);
  }

  /**
   * 获取教材的题目列表
   */
  async getTextbookQuestions(id: number, params?: { page?: number; size?: number }): Promise<ListResponse<Question>> {
    return this.get<ListResponse<Question>>(`/textbook/${id}/questions`, { params });
  }

  /**
   * 上传教材文件
   */
  async uploadTextbook(id: number, formData: FormData): Promise<any> {
    return this.postForm<any>(`/textbook/${id}/upload`, formData);
  }

  // ========== 单元管理 ==========

  /**
   * 创建单元
   */
  async createUnit(data: { textbook_id: number; name: string; content: string }): Promise<Unit> {
    return this.post<Unit>('/unit', data);
  }

  /**
   * 更新单元
   */
  async updateUnit(
    id: number,
    data: {
      name?: string;
      content?: string;
    },
  ): Promise<Unit> {
    return this.patch<Unit>(`/unit/${id}`, data);
  }

  /**
   * 删除单元
   */
  async deleteUnit(id: number): Promise<void> {
    return this.delete<void>(`/unit/${id}`);
  }

  /**
   * 搜索单元
   */
  async searchUnits(params?: SearchParams): Promise<ListResponse<Unit>> {
    return this.get<ListResponse<Unit>>('/unit/search', { params });
  }

  /**
   * 获取单元的知识点列表
   */
  async getUnitKnowledges(id: number): Promise<Knowledge[]> {
    return this.get<Knowledge[]>(`/unit/${id}/knowledges`);
  }

  /**
   * 获取单元的题目列表
   */
  async getUnitQuestions(id: number, params?: { page?: number; size?: number }): Promise<ListResponse<Question>> {
    return this.get<ListResponse<Question>>(`/unit/${id}/questions`, { params });
  }


  // ========== 知识点管理 ==========

  /**
   * 创建知识点
   */
  async createKnowledge(data: {
    textbook_id: number;
    unit_id: number;
    name: string;
    content: string;
  }): Promise<Knowledge> {
    return this.post<Knowledge>('/knowledge', data);
  }

  /**
   * 更新知识点
   */
  async updateKnowledge(
    id: number,
    data: {
      name?: string;
      content?: string;
    },
  ): Promise<Knowledge> {
    return this.patch<Knowledge>(`/knowledge/${id}`, data);
  }

  /**
   * 删除知识点
   */
  async deleteKnowledge(id: number): Promise<void> {
    return this.delete<void>(`/knowledge/${id}`);
  }

  /**
   * 搜索知识点
   */
  async searchKnowledges(params?: SearchParams): Promise<ListResponse<Knowledge>> {
    return this.get<ListResponse<Knowledge>>('/knowledge/search', { params });
  }

  /**
   * 获取知识点的题目列表
   */
  async getKnowledgeQuestions(id: number, params?: { page?: number; size?: number }): Promise<ListResponse<Question>> {
    return this.get<ListResponse<Question>>(`/knowledge/${id}/questions`, { params });
  }

  // ========== 教师用书管理 ==========

  /**
   * 获取教师用书
   */
  async getTeacherBook(id: number): Promise<TeacherBook> {
    return this.get<TeacherBook>(`/teacher_book/${id}`);
  }

  /**
   * 搜索教师用书
   */
  async searchTeacherBooks(
    params?: SearchParams & {
      version?: string;
      subject?: string;
      grade?: string;
    },
  ): Promise<ListResponse<TeacherBook>> {
    return this.get<ListResponse<TeacherBook>>('/teacher_book/search', { params });
  }

  /**
   * 创建教师用书
   */
  async createTeacherBook(data: {
    subject: string;
    version: string;
    grade: number;
    semester: string;
  }): Promise<TeacherBook> {
    return this.post<TeacherBook>('/teacher_book', data);
  }

  /**
   * 更新教师用书
   */
  async updateTeacherBook(
    id: number,
    data: {
      subject: string;
      version: string;
      grade: number;
      semester: string;
    },
  ): Promise<TeacherBook> {
    return this.put<TeacherBook>(`/teacher_book/${id}`, data);
  }

  /**
   * 删除教师用书
   */
  async deleteTeacherBook(id: number): Promise<void> {
    return this.delete<void>(`/teacher_book/${id}`);
  }

  /**
   * 上传教师用书文件
   */
  async uploadTeacherBook(id: number, formData: FormData): Promise<any> {
    return this.postForm<any>(`/teacher_book/${id}/upload`, formData);
  }

  // ========== 练习管理 ==========

  /**
   * 获取学生练习历史
   */
  async getPracticeHistory(studentId: string, practiceType: string): Promise<PracticeSession[]> {
    return this.get<PracticeSession[]>(`/practice/${studentId}/history/${practiceType}`);
  }

  /**
   * 获取练习会话详情
   */
  async getPracticeSession(sessionId: number): Promise<PracticeDetail> {
    return this.get<PracticeDetail>(`/practice/session/${sessionId}`);
  }

  /**
   * 删除练习会话
   */
  async removePracticeSession(sessionId: number): Promise<void> {
    return this.delete<void>(`/practice/session/${sessionId}`);
  }

  // ========== 通用配置 ==========

  /**
   * 获取系统配置
   */
  async getConfigs(params?: { subject?: string; grade?: number }): Promise<Configs> {
    return this.get<Configs>('/configs', { params });
  }
}

/**
 * 管理端 API 客户端实例
 * 直接使用此实例调用 API 方法
 */
export const adminApi = new AdminApiClient();
