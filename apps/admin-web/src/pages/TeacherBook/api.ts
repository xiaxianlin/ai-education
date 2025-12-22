import { apiClient } from '@/lib/api';

export const TeacherBookApi = {
  /**
   * 获取教师用书
   * GET /teacher_book/{id}
   */
  async getTeacherBook(id: number) {
    return apiClient.get<TeacherBook>(`/teacher_book/${id}`);
  },

  /**
   * 搜索教师用书
   * GET /teacher_book/search
   */
  async searchTeacherBooks(subject: string, grade: number) {
    return apiClient.get<TeacherBook[]>('/teacher_book/search', { subject, grade });
  },

  /**
   * 创建教师用书
   * POST /teacher_book
   */
  async createTeacherBook(data: SaveTeacherBookRequest) {
    return apiClient.post<number>('/teacher_book', data);
  },

  /**
   * 更新教师用书
   * PUT /teacher_book/{id}
   */
  async updateTeacherBook(id: number, data: SaveTeacherBookRequest) {
    return apiClient.put(`/teacher_book/${id}`, data);
  },

  /**
   * 删除教师用书
   * DELETE /teacher_book/{id}
   */
  async deleteTeacherBook(id: number) {
    return apiClient.delete(`/teacher_book/${id}`);
  },

  /**
   * 上传教师用书文件
   * POST /teacher_book/{id}/upload
   */
  async uploadTeacherBook(id: number, data: FormData) {
    return apiClient.form(`/teacher_book/${id}/upload`, data);
  },
};
