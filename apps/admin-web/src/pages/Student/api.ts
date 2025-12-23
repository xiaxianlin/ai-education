import { apiClient } from '@/lib/api';
export const StudentApi = {
  /**
   * 搜索学生
   * GET /student/search
   */
  async searchStudents(params?: SearchStudentRequest) {
    return apiClient.get<SearchResponse<Student>>('/student/search', params);
  },

  /**
   * 创建学生
   * POST /student
   * @returns 密码 string
   */
  async createStudent(data: SaveStudentRequest) {
    return apiClient.post<string>('/student', data);
  },

  /**
   * 更新学生
   * PUT /student/{id}
   */
  async updateStudent(id: string, data: SaveStudentRequest) {
    return apiClient.put(`/student/${id}`, data);
  },

  /**
   * 获取学生详情
   * GET /student/{id}
   */
  async getStudent(id: string) {
    return apiClient.get<Student>(`/student/${id}`);
  },

  /**
   * 删除学生
   * DELETE /student/{id}
   */
  async deleteStudent(id: string) {
    return apiClient.delete(`/student/${id}`);
  },

  /**
   * 重置学生密码
   * POST /student/{id}/reset_password
   * @returns 密码 string
   */
  async resetStudentPassword(id: string) {
    return apiClient.post<string>(`/student/${id}/reset_password`);
  },

  /**
   * 获取学生的教材列表
   * GET /student/{id}/textbooks
   */
  async getStudentTextbooks(id: string) {
    return apiClient.get<Textbook[]>(`/student/${id}/textbooks`);
  },

  /**
   * 获取学生未使用的教材列表
   * GET /student/{id}/unused_textbooks
   */
  async getStudentUnusedTextbooks(id: string) {
    return apiClient.get<Textbook[]>(`/student/${id}/unused_textbooks`);
  },

  /**
   * 为学生批量添加教材
   * POST /student/{id}/textbook
   */
  async addStudentTextbook(id: string, textbookIds: number[]) {
    return apiClient.post(`/student/${id}/textbook`, { ids: textbookIds });
  },

  /**
   * 批量移除学生的教材
   * DELETE /student/{id}/textbook
   */
  async removeStudentTextbook(id: string, textbookIds: number[]) {
    return apiClient.delete(`/student/${id}/textbook`, { data: { ids: textbookIds } });
  },

  /**
   * 获取学生练习历史
   * GET /student/{id}/practice_sessions/{session_type}
   */
  async getStudentPracticeSessions(id: string, practiceId: number) {
    return apiClient.get<PracticeSession[]>(`/student/${id}/practice_sessions/${practiceId}`);
  },

  /**
   * 获取学生练习会话详情
   * GET /student/{id}/practice_session/{session_id}
   */
  async getStudentPracticeSessionData(id: string, sessionId: number) {
    return apiClient.get(`/student/${id}/practice_session/${sessionId}`);
  },

  /**
   * 获取学生的练习列表
   * GET /student/{id}/practices
   */
  async getStudentPractices(id: string) {
    return apiClient.get<Practice[]>(`/student/${id}/practices`);
  },

  /**
   * 获取学生未使用的练习列表
   * GET /student/{id}/unused_practices
   */
  async getStudentUnusedPractices(id: string) {
    return apiClient.get<Practice[]>(`/student/${id}/unused_practices`);
  },

  /**
   * 为学生批量添加练习
   * POST /student/{id}/practice
   */
  async addStudentPractice(id: string, practiceIds: number[]) {
    return apiClient.post(`/student/${id}/practice`, { ids: practiceIds });
  },

  /**
   * 批量移除学生的练习
   * DELETE /student/{id}/practice
   */
  async removeStudentPractice(id: string, practiceIds: number[]) {
    return apiClient.delete(`/student/${id}/practice`, { data: { ids: practiceIds } });
  },
};
