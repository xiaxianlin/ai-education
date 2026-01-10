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
   * GET /student/{id}/practices/{practice_type}
   */
  async getStudentPractices(id: string, practiceType: string) {
    return apiClient.get<Practice[]>(`/student/${id}/practices/${practiceType}`);
  },

  /**
   * 获取学生练习历史（支持分页）
   * GET /student/{id}/practices/{practice_type}?page=1&page_size=20
   */
  async getStudentPracticeSessions(
    id: string,
    practiceType: string,
    params?: { page?: number; page_size?: number },
  ) {
    return apiClient.get<{ data: Practice[]; total: number; page: number; pageSize: number }>(
      `/student/${id}/practices/${practiceType}`,
      params,
    );
  },

  /**
   * 获取学生练习详情
   * GET /student/{id}/practice/{session_id}
   */
  async getStudentPracticeData(id: string, sessionId: string) {
    return apiClient.get(`/student/${id}/practice/${sessionId}`);
  },
};
