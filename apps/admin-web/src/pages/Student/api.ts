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
   * PATCH /student/{id}
   */
  async updateStudent(id: string, data: SaveStudentRequest) {
    return apiClient.patch(`/student/${id}`, data);
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
   * 为学生添加教材
   * POST /student/{id}/textbook/{textbook_id}
   */
  async addStudentTextbook(id: string, textbookId: number) {
    return apiClient.post(`/student/${id}/textbook/${textbookId}`);
  },

  /**
   * 移除学生的教材
   * DELETE /student/{id}/textbook/{textbook_id}
   */
  async removeStudentTextbook(id: string, textbookId: number) {
    return apiClient.delete(`/student/${id}/textbook/${textbookId}`);
  },

  /**
   * 获取学生练习历史
   * GET /practice/{student_id}/history/{practice_type}
   */
  async getPracticeHistory(id: string, practice_slug: string) {
    return apiClient.get<PracticeSession[]>(`/student/${id}/practice_sessions/${practice_slug}`);
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
   * 为学生添加练习
   * POST /student/{id}/practice/{practice_id}
   */
  async addStudentPractice(id: string, practiceId: number) {
    return apiClient.post(`/student/${id}/practice/${practiceId}`);
  },

  /**
   * 移除学生的练习
   * DELETE /student/{id}/practice/{practice_id}
   */
  async removeStudentPractice(id: string, practiceId: number) {
    return apiClient.delete(`/student/${id}/practice/${practiceId}`);
  },
};
