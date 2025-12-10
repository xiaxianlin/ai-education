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
  async login(data: LoginModel): Promise<string> {
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
  async modifyPassword(data: ModifyPasswordModel): Promise<void> {
    return client.post<void>('/modify_password', data);
  },

  // ========== 管理员管理 ==========

  /**
   * 创建管理员
   * POST /manager
   */
  async createManager(data: CreateManagerModel): Promise<Manager> {
    return client.post<Manager>('/manager', data);
  },

  /**
   * 删除管理员
   * DELETE /manager/{id}
   */
  async deleteManager(id: string): Promise<void> {
    return client.delete<void>(`/manager/${id}`);
  },

  /**
   * 更新管理员状态
   * PATCH /manager/{id}/status/{status}
   */
  async updateManagerStatus(id: string, status: number): Promise<void> {
    return client.patch<void>(`/manager/${id}/status/${status}`);
  },

  /**
   * 更新管理员类型
   * PATCH /manager/{id}/type/{type}
   */
  async updateManagerType(id: string, type: number): Promise<void> {
    return client.patch<void>(`/manager/${id}/type/${type}`);
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
  async resetManagerPassword(id: string): Promise<{ password: string }> {
    return client.post<{ password: string }>(`/manager/${id}/reset`);
  },

  // ========== 学生管理 ==========

  /**
   * 搜索学生
   * GET /student/search
   */
  async searchStudents(params?: SearchParams & { phone?: string; status?: number }): Promise<ListResponse<Student>> {
    return client.get<ListResponse<Student>>('/student/search', { params });
  },

  /**
   * 创建学生
   * POST /student
   */
  async createStudent(data: { name: string; phone: string }): Promise<Student> {
    return client.post<Student>('/student', data);
  },

  /**
   * 更新学生
   * PATCH /student/{id}
   */
  async updateStudent(
    id: string,
    data: { name?: string; phone?: string; grade?: number; status?: number },
  ): Promise<Student> {
    return client.patch<Student>(`/student/${id}`, data);
  },

  /**
   * 获取学生详情
   * GET /student/{id}
   */
  async getStudentDetail(id: string): Promise<Student> {
    return client.get<Student>(`/student/${id}`);
  },

  /**
   * 删除学生
   * DELETE /student/{id}
   */
  async deleteStudent(id: string): Promise<void> {
    return client.delete<void>(`/student/${id}`);
  },

  /**
   * 重置学生密码
   * POST /student/{id}/reset_password
   */
  async resetStudentPassword(id: string): Promise<{ password: string }> {
    return client.post<{ password: string }>(`/student/${id}/reset_password`);
  },

  /**
   * 获取学生的教材列表
   * GET /student/{id}/textbooks
   */
  async getStudentTextbooks(id: string): Promise<Textbook[]> {
    return client.get<Textbook[]>(`/student/${id}/textbooks`);
  },

  /**
   * 获取学生未使用的教材列表
   * GET /student/{id}/unused_textbooks
   */
  async getStudentUnusedTextbooks(id: string): Promise<Textbook[]> {
    return client.get<Textbook[]>(`/student/${id}/unused_textbooks`);
  },

  /**
   * 为学生添加教材
   * POST /student/{id}/textbook/{textbook_id}
   */
  async addStudentTextbook(id: string, textbookId: number): Promise<void> {
    return client.post<void>(`/student/${id}/textbook/${textbookId}`);
  },

  /**
   * 移除学生的教材
   * DELETE /student/{id}/textbook/{textbook_id}
   */
  async removeStudentTextbook(id: string, textbookId: number): Promise<void> {
    return client.delete<void>(`/student/${id}/textbook/${textbookId}`);
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
    return client.get<ListResponse<Question>>('/question/search', { params });
  },

  /**
   * 搜索资源题目
   * GET /question/resource/search
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
    return client.get<ListResponse<Question>>('/question/resource/search', { params });
  },

  /**
   * 更新题目
   * PATCH /question/{id}
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
    return client.patch<Question>(`/question/${id}`, data);
  },

  /**
   * 删除题目
   * DELETE /question/{id}
   */
  async deleteQuestion(id: string): Promise<void> {
    return client.delete<void>(`/question/${id}`);
  },

  /**
   * 生成题目图片
   * POST /question/{id}/generate_image
   */
  async generateQuestionImage(id: string): Promise<Question> {
    return client.post<Question>(`/question/${id}/generate_image`);
  },

  /**
   * 生成题目音频
   * POST /question/{id}/generate_audio
   */
  async generateQuestionAudio(id: string): Promise<Question> {
    return client.post<Question>(`/question/${id}/generate_audio`);
  },

  // ========== 教材管理 ==========

  /**
   * 获取教材
   * GET /textbook/{id}
   */
  async getTextbook(id: number): Promise<Textbook> {
    return client.get<Textbook>(`/textbook/${id}`);
  },

  /**
   * 搜索教材
   * GET /textbook/search
   */
  async searchTextbooks(
    params?: SearchParams & {
      version?: string;
      subject?: string;
      grade?: string;
    },
  ): Promise<ListData<Textbook>> {
    return client.get<ListData<Textbook>>('/textbook/search', { params });
  },

  /**
   * 创建教材
   * POST /textbook
   */
  async createTextbook(data: { subject: string; version: string; grade: number; semester: string }): Promise<Textbook> {
    return client.post<Textbook>('/textbook', data);
  },

  /**
   * 更新教材
   * PUT /textbook/{id}
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
    return client.put<Textbook>(`/textbook/${id}`, data);
  },

  /**
   * 删除教材
   * DELETE /textbook/{id}
   */
  async deleteTextbook(id: number): Promise<void> {
    return client.delete<void>(`/textbook/${id}`);
  },

  /**
   * 解析教材
   * POST /textbook/{id}/parse
   */
  async parseTextbook(id: number): Promise<Textbook> {
    return client.post<Textbook>(`/textbook/${id}/parse`);
  },

  /**
   * 切换教材状态
   * PATCH /textbook/{id}/status/{status}
   */
  async toggleTextbookStatus(id: number, status: number): Promise<Textbook> {
    return client.patch<Textbook>(`/textbook/${id}/status/${status}`);
  },

  /**
   * 获取教材的单元列表
   * GET /textbook/{id}/units
   */
  async getTextbookUnits(id: number): Promise<Unit[]> {
    return client.get<Unit[]>(`/textbook/${id}/units`);
  },

  /**
   * 获取教材的知识点列表
   * GET /textbook/{id}/knowledges
   */
  async getTextbookKnowledges(id: number): Promise<Knowledge[]> {
    return client.get<Knowledge[]>(`/textbook/${id}/knowledges`);
  },

  /**
   * 获取教材的题目列表
   * GET /textbook/{id}/questions
   */
  async getTextbookQuestions(id: number, params?: { page?: number; size?: number }): Promise<ListResponse<Question>> {
    return client.get<ListResponse<Question>>(`/textbook/${id}/questions`, { params });
  },

  /**
   * 上传教材文件
   * POST /textbook/{id}/upload
   */
  async uploadTextbook(id: number, formData: FormData): Promise<any> {
    return client.form<any>(`/textbook/${id}/upload`, formData);
  },

  // ========== 单元管理 ==========

  /**
   * 创建单元
   * POST /unit
   */
  async createUnit(data: { textbook_id: number; name: string; content: string }): Promise<Unit> {
    return client.post<Unit>('/unit', data);
  },

  /**
   * 更新单元
   * PATCH /unit/{id}
   */
  async updateUnit(
    id: number,
    data: {
      name?: string;
      content?: string;
    },
  ): Promise<Unit> {
    return client.patch<Unit>(`/unit/${id}`, data);
  },

  /**
   * 删除单元
   * DELETE /unit/{id}
   */
  async deleteUnit(id: number): Promise<void> {
    return client.delete<void>(`/unit/${id}`);
  },

  /**
   * 搜索单元
   * GET /unit/search
   */
  async searchUnits(params?: SearchParams): Promise<ListResponse<Unit>> {
    return client.get<ListResponse<Unit>>('/unit/search', { params });
  },

  /**
   * 获取单元的知识点列表
   * GET /unit/{id}/knowledges
   */
  async getUnitKnowledges(id: number): Promise<Knowledge[]> {
    return client.get<Knowledge[]>(`/unit/${id}/knowledges`);
  },

  /**
   * 获取单元的题目列表
   * GET /unit/{id}/questions
   */
  async getUnitQuestions(id: number, params?: { page?: number; size?: number }): Promise<ListResponse<Question>> {
    return client.get<ListResponse<Question>>(`/unit/${id}/questions`, { params });
  },

  // ========== 知识点管理 ==========

  /**
   * 创建知识点
   * POST /knowledge
   */
  async createKnowledge(data: {
    textbook_id: number;
    unit_id: number;
    name: string;
    content: string;
  }): Promise<Knowledge> {
    return client.post<Knowledge>('/knowledge', data);
  },

  /**
   * 更新知识点
   * PATCH /knowledge/{id}
   */
  async updateKnowledge(
    id: number,
    data: {
      name?: string;
      content?: string;
    },
  ): Promise<Knowledge> {
    return client.patch<Knowledge>(`/knowledge/${id}`, data);
  },

  /**
   * 删除知识点
   * DELETE /knowledge/{id}
   */
  async deleteKnowledge(id: number): Promise<void> {
    return client.delete<void>(`/knowledge/${id}`);
  },

  /**
   * 搜索知识点
   * GET /knowledge/search
   */
  async searchKnowledges(params?: SearchParams): Promise<ListResponse<Knowledge>> {
    return client.get<ListResponse<Knowledge>>('/knowledge/search', { params });
  },

  /**
   * 获取知识点的题目列表
   * GET /knowledge/{id}/questions
   */
  async getKnowledgeQuestions(id: number, params?: { page?: number; size?: number }): Promise<ListResponse<Question>> {
    return client.get<ListResponse<Question>>(`/knowledge/${id}/questions`, { params });
  },

  // ========== 教师用书管理 ==========

  /**
   * 获取教师用书
   * GET /teacher_book/{id}
   */
  async getTeacherBook(id: number): Promise<TeacherBook> {
    return client.get<TeacherBook>(`/teacher_book/${id}`);
  },

  /**
   * 搜索教师用书
   * GET /teacher_book/search
   */
  async searchTeacherBooks(
    params?: SearchParams & {
      version?: string;
      subject?: string;
      grade?: string;
    },
  ): Promise<ListResponse<TeacherBook>> {
    return client.get<ListResponse<TeacherBook>>('/teacher_book/search', { params });
  },

  /**
   * 创建教师用书
   * POST /teacher_book
   */
  async createTeacherBook(data: {
    subject: string;
    version: string;
    grade: number;
    semester: string;
  }): Promise<TeacherBook> {
    return client.post<TeacherBook>('/teacher_book', data);
  },

  /**
   * 更新教师用书
   * PUT /teacher_book/{id}
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
    return client.put<TeacherBook>(`/teacher_book/${id}`, data);
  },

  /**
   * 删除教师用书
   * DELETE /teacher_book/{id}
   */
  async deleteTeacherBook(id: number): Promise<void> {
    return client.delete<void>(`/teacher_book/${id}`);
  },

  /**
   * 上传教师用书文件
   * POST /teacher_book/{id}/upload
   */
  async uploadTeacherBook(id: number, formData: FormData): Promise<any> {
    return client.form<any>(`/teacher_book/${id}/upload`, formData);
  },

  // ========== 练习管理 ==========

  /**
   * 获取学生练习历史
   * GET /practice/{student_id}/history/{practice_type}
   */
  async getPracticeHistory(studentId: string, practiceType: string): Promise<PracticeSession[]> {
    return client.get<PracticeSession[]>(`/practice/${studentId}/history/${practiceType}`);
  },

  /**
   * 获取练习会话详情
   * GET /practice/session/{session_id}
   */
  async getPracticeSession(sessionId: number): Promise<PracticeDetail> {
    return client.get<PracticeDetail>(`/practice/session/${sessionId}`);
  },

  /**
   * 删除练习会话
   * DELETE /practice/session/{session_id}
   */
  async removePracticeSession(sessionId: number): Promise<void> {
    return client.delete<void>(`/practice/session/${sessionId}`);
  },

  // ========== 通用配置 ==========

  /**
   * 获取系统配置
   * GET /configs
   */
  async getConfigs(params?: { subject?: string; grade?: number }): Promise<Configs> {
    return client.get<Configs>('/configs', { params });
  },
};
