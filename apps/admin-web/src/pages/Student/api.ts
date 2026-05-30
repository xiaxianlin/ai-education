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
   * 关联学生教师
   * PATCH /student/{id}/teacher
   */
  async assignStudentTeacher(id: string, teacherId: string) {
    return apiClient.patch(`/student/${id}/teacher`, { teacher_id: teacherId });
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
   * 获取学生练习历史（支持分页）
   * GET /student/{id}/practices?page=1&page_size=20
   */
  async getStudentPracticeSessions(id: string, params?: { page?: number; page_size?: number }) {
    return apiClient.get<{ data: Practice[]; total: number; page: number; pageSize: number }>(
      `/student/${id}/practices`,
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

  /**
   * 获取学生能力掌握度列表
   * GET /student/{id}/mastery
   */
  async getStudentMastery(id: string, params?: { subject?: string }) {
    return apiClient.get<StudentMastery[]>(`/student/${id}/mastery`, params);
  },

  /**
   * 获取学生能力掌握度概览
   * GET /student/{id}/mastery/summary
   */
  async getStudentMasterySummary(id: string) {
    return apiClient.get<StudentMasterySummary>(`/student/${id}/mastery/summary`);
  },
};

// 能力掌握度类型
interface StudentMastery {
  id: number;
  student_id: string;
  ability_code: string;
  mastery_score: number;
  mastery_level: string;
  correct_count: number;
  wrong_count: number;
  last_practice_time: number | null;
  ability_name: string | null;
  subject: string | null;
  grade: number | null;
}

interface StudentMasterySummary {
  total_abilities: number;
  avg_mastery_score: number;
  level_distribution: Record<string, number>;
}
