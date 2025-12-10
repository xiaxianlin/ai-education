import { go } from './router';
import { ApiClient } from '@ai-education/shared-web';

const client = new ApiClient('/api/admin');

client.addResponseInterceptor(
  (response) => response,
  (error) => {
    // 统一错误处理
    const response = error.response;
    if (response) {
      const data = response.data;
      const status = data?.status || response.status;

      // 处理认证错误
      if (status === 401 || status === 403) {
        client.removeToken();
        go('/login');
        return;
      }

      return response;
    }

    return Promise.reject(error);
  },
);

/**
 * 管理端 API 客户端类
 */
export const adminApi = {
  // ========== 认证相关 ==========

  /**
   * 登录
   * POST /login
   */
  async login(data: LoginRequest): Promise<string> {
    return client.post<string>('/login', data);
  },

  /**
   * 检查登录状态
   * GET /check
   */
  async check(): Promise<Manager> {
    return client.get<Manager>('/check');
  },

  /**
   * 修改密码
   * POST /modify_password
   */
  async modifyPassword(data: ModifyPasswordRequest) {
    return client.post('/modify_password', data);
  },

  // ========== 通用配置 ==========

  /**
   * 获取系统配置
   * GET /configs
   */
  async getConfigs(params?: { subject?: string; grade?: number }): Promise<Configs> {
    return client.get<Configs>('/configs', { params });
  },

  // ========== 管理员管理 ==========

  /**
   * 创建管理员
   * POST /manager
   */
  async createManager(data: CreateManagerRequest): Promise<Manager> {
    return client.post<Manager>('/manager', data);
  },

  /**
   * 删除管理员
   * DELETE /manager/{id}
   */
  async deleteManager(id: string) {
    return client.delete(`/manager/${id}`);
  },

  /**
   * 更新管理员状态
   * PATCH /manager/{id}
   */
  async updateManager(id: string, data: UpdateManagerRequest) {
    return client.patch(`/manager/${id}`, data);
  },

  /**
   * 获取所有管理员
   * GET /manager/all
   */
  async getAllManagers(): Promise<Manager[]> {
    return client.get<Manager[]>('/manager/all');
  },

  /**
   * 重置管理员密码
   * POST /manager/{id}/reset
   */
  async resetManagerPassword(id: string) {
    return client.post<string>(`/manager/${id}/reset`);
  },

  // ========== 学生管理 ==========

  /**
   * 搜索学生
   * GET /student/search
   */
  async searchStudents(params?: SearchStudentRequest) {
    return client.get<SearchResponse<Student>>('/student/search', { params });
  },

  /**
   * 创建学生
   * POST /student
   * @returns 密码 string
   */
  async createStudent(data: SaveStudentRequest) {
    return client.post<string>('/student', data);
  },

  /**
   * 更新学生
   * PATCH /student/{id}
   */
  async updateStudent(id: string, data: SaveStudentRequest) {
    return client.patch(`/student/${id}`, data);
  },

  /**
   * 获取学生详情
   * GET /student/{id}
   */
  async getStudent(id: string) {
    return client.get<Student>(`/student/${id}`);
  },

  /**
   * 删除学生
   * DELETE /student/{id}
   */
  async deleteStudent(id: string) {
    return client.delete(`/student/${id}`);
  },

  /**
   * 重置学生密码
   * POST /student/{id}/reset_password
   * @returns 密码 string
   */
  async resetStudentPassword(id: string) {
    return client.post<string>(`/student/${id}/reset_password`);
  },

  /**
   * 获取学生的教材列表
   * GET /student/{id}/textbooks
   */
  async getStudentTextbooks(id: string) {
    return client.get<Textbook[]>(`/student/${id}/textbooks`);
  },

  /**
   * 获取学生未使用的教材列表
   * GET /student/{id}/unused_textbooks
   */
  async getStudentUnusedTextbooks(id: string) {
    return client.get<Textbook[]>(`/student/${id}/unused_textbooks`);
  },

  /**
   * 为学生添加教材
   * POST /student/{id}/textbook/{textbook_id}
   */
  async addStudentTextbook(id: string, textbookId: number) {
    return client.post(`/student/${id}/textbook/${textbookId}`);
  },

  /**
   * 移除学生的教材
   * DELETE /student/{id}/textbook/{textbook_id}
   */
  async removeStudentTextbook(id: string, textbookId: number) {
    return client.delete(`/student/${id}/textbook/${textbookId}`);
  },

  // ========== 题目管理 ==========

  /**
   * 获取题目
   * GET /question/{id}
   */
  async getQuestion(id: string): Promise<Question> {
    return client.get<Question>(`/question/${id}`);
  },

  /**
   * 搜索题目
   * GET /question/search
   */
  async searchQuestions(params?: SearchQuestionRequest) {
    return client.get<SearchResponse<Question>>('/question/search', { params });
  },

  /**
   * 搜索资源题目
   * GET /question/resource/search
   */
  async searchResourceQuestions(params?: SearchQuestionRequest) {
    return client.get<SearchResponse<Question>>('/question/resource/search', { params });
  },

  /**
   * 更新题目
   * PATCH /question/{id}
   */
  async updateQuestion(id: string, data: UpdateQuestionRequest) {
    return client.patch(`/question/${id}`, data);
  },

  /**
   * 删除题目
   * DELETE /question/{id}
   */
  async deleteQuestion(id: string) {
    return client.delete(`/question/${id}`);
  },

  /**
   * 生成题目图片
   * POST /question/{id}/generate_image
   */
  async generateQuestionImage(id: string) {
    return client.post(`/question/${id}/generate_image`);
  },

  /**
   * 生成题目音频
   * POST /question/{id}/generate_audio
   */
  async generateQuestionAudio(id: string) {
    return client.post(`/question/${id}/generate_audio`);
  },

  // ========== 教材管理 ==========

  /**
   * 获取教材
   * GET /textbook/{id}
   */
  async getTextbook(id: number) {
    return client.get<Textbook>(`/textbook/${id}`);
  },

  /**
   * 搜索教材
   * GET /textbook/search
   */
  async searchTextbooks(params?: SearchTextbookRequest) {
    return client.get<SearchResponse<Textbook>>('/textbook/search', { params });
  },

  /**
   * 创建教材
   * POST /textbook
   */
  async createTextbook(data: SaveTextbookRequest) {
    return client.post<number>('/textbook', data);
  },

  /**
   * 更新教材
   * PUT /textbook/{id}
   */
  async updateTextbook(id: number, data: SaveTextbookRequest) {
    return client.patch(`/textbook/${id}`, data);
  },

  /**
   * 删除教材
   * DELETE /textbook/{id}
   */
  async deleteTextbook(id: number) {
    return client.delete(`/textbook/${id}`);
  },

  /**
   * 解析教材
   * POST /textbook/{id}/parse
   */
  async parseTextbook(id: number) {
    return client.post(`/textbook/${id}/parse`);
  },

  /**
   * 上传教材文件
   * POST /textbook/{id}/upload
   */
  async uploadTextbook(id: number, data: FormData) {
    return client.form(`/textbook/${id}/upload`, data);
  },

  /**
   * 获取教材的单元列表
   * GET /textbook/{id}/units
   */
  async getTextbookUnits(id: number) {
    return client.get<Unit[]>(`/textbook/${id}/units`);
  },

  // ========== 单元管理 ==========

  /**
   * 创建单元
   * POST /unit
   */
  async createUnit(data: CreateUnitRequest) {
    return client.post<number>('/unit', data);
  },

  /**
   * 更新单元
   * PATCH /unit/{id}
   */
  async updateUnit(id: number, data: UpdateUnitRequest) {
    return client.patch(`/unit/${id}`, data);
  },

  /**
   * 删除单元
   * DELETE /unit/{id}
   */
  async deleteUnit(id: number) {
    return client.delete(`/unit/${id}`);
  },

  /**
   * 获取单元的知识点列表
   * GET /unit/{id}/knowledges
   */
  async getUnitKnowledges(id: number) {
    return client.get<Knowledge[]>(`/unit/${id}/knowledges`);
  },

  // ========== 知识点管理 ==========

  /**
   * 创建知识点
   * POST /knowledge
   */
  async createKnowledge(data: CreateKnowledgeRequest) {
    return client.post<number>('/knowledge', data);
  },

  /**
   * 更新知识点
   * PATCH /knowledge/{id}
   */
  async updateKnowledge(id: number, data: UpdateKnowledgeRequest) {
    return client.patch(`/knowledge/${id}`, data);
  },

  /**
   * 删除知识点
   * DELETE /knowledge/{id}
   */
  async deleteKnowledge(id: number) {
    return client.delete(`/knowledge/${id}`);
  },

  // ========== 教师用书管理 ==========

  /**
   * 获取教师用书
   * GET /teacher_book/{id}
   */
  async getTeacherBook(id: number) {
    return client.get<TeacherBook>(`/teacher_book/${id}`);
  },

  /**
   * 搜索教师用书
   * GET /teacher_book/search
   */
  async searchTeacherBooks(params?: SearchTeacherBookRequest) {
    return client.get<SearchResponse<TeacherBook>>('/teacher_book/search', { params });
  },

  /**
   * 创建教师用书
   * POST /teacher_book
   */
  async createTeacherBook(data: SaveTeacherBookRequest) {
    return client.post<number>('/teacher_book', data);
  },

  /**
   * 更新教师用书
   * PUT /teacher_book/{id}
   */
  async updateTeacherBook(id: number, data: SaveTeacherBookRequest) {
    return client.put(`/teacher_book/${id}`, data);
  },

  /**
   * 删除教师用书
   * DELETE /teacher_book/{id}
   */
  async deleteTeacherBook(id: number) {
    return client.delete(`/teacher_book/${id}`);
  },

  /**
   * 上传教师用书文件
   * POST /teacher_book/{id}/upload
   */
  async uploadTeacherBook(id: number, data: FormData) {
    return client.form(`/teacher_book/${id}/upload`, data);
  },

  // ========== 练习管理 ==========

  /**
   * 获取学生练习历史
   * GET /practice/{student_id}/history/{practice_type}
   */
  async getPracticeHistory(studentId: string, practiceType: string) {
    return client.get<PracticeSession[]>(`/practice/${studentId}/history/${practiceType}`);
  },

  /**
   * 获取练习会话详情
   * GET /practice/session/{session_id}
   */
  async getPracticeSession(sessionId: number) {
    return client.get<PracticeDetail>(`/practice/session/${sessionId}`);
  },

  /**
   * 删除练习会话
   * DELETE /practice/session/{session_id}
   */
  async removePracticeSession(sessionId: number) {
    return client.delete(`/practice/session/${sessionId}`);
  },
};
