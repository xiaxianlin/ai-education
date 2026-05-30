import { apiClient } from '@/lib/api';

export const AuthApi = {
  /**
   * 登录
   * POST /login
   */
  async login(data: LoginRequest): Promise<string> {
    return apiClient.post<string>('/login', data);
  },

  /**
   * 修改密码
   * POST /modify_password
   */
  async modifyPassword(data: ModifyPasswordRequest) {
    return apiClient.post('/modify_password', data);
  },
  /**
   * 创建管理员
   * POST /manager
   */
  async createManager(data: CreateManagerRequest) {
    return apiClient.post<PasswordResponse>('/manager', data);
  },

  /**
   * 删除管理员
   * DELETE /manager/{id}
   */
  async deleteManager(id: string) {
    return apiClient.delete(`/manager/${id}`);
  },

  /**
   * 更新管理员状态
   * PATCH /manager/{id}
   */
  async updateManager(id: string, data: UpdateManagerRequest) {
    return apiClient.patch(`/manager/${id}`, data);
  },

  /**
   * 获取所有管理员
   * GET /manager/all
   */
  async getAllManagers(): Promise<Manager[]> {
    return apiClient.get<Manager[]>('/manager/all');
  },

  /**
   * 重置管理员密码
   * POST /manager/{id}/reset
   */
  async resetManagerPassword(id: string) {
    return apiClient.post<PasswordResponse>(`/manager/${id}/reset`);
  },

  /**
   * 查询教师
   * GET /teacher/search
   */
  async searchTeachers(data?: TeacherSearchRequest): Promise<SearchResponse<Teacher>> {
    return apiClient.get<SearchResponse<Teacher>>('/teacher/search', data);
  },

  /**
   * 创建教师
   * POST /teacher
   */
  async createTeacher(data: CreateTeacherRequest) {
    return apiClient.post<PasswordResponse | Teacher>('/teacher', data);
  },

  /**
   * 获取教师详情
   * GET /teacher/{id}
   */
  async getTeacher(id: string) {
    return apiClient.get<TeacherDetail>(`/teacher/${id}`);
  },

  /**
   * 更新教师
   * PATCH /teacher/{id}
   */
  async updateTeacher(id: string, data: UpdateTeacherRequest) {
    return apiClient.patch(`/teacher/${id}`, data);
  },

  /**
   * 删除教师
   * DELETE /teacher/{id}
   */
  async deleteTeacher(id: string) {
    return apiClient.delete(`/teacher/${id}`);
  },

  /**
   * 重置教师密码
   * POST /teacher/{id}/reset_password
   */
  async resetTeacherPassword(id: string) {
    return apiClient.post<PasswordResponse>(`/teacher/${id}/reset_password`);
  },

  /**
   * 查询教师认领申请
   * GET /teacher-claims
   */
  async getTeacherClaims(data?: { status?: TeacherClaimStatus }): Promise<StudentTeacherClaim[]> {
    return apiClient.get<StudentTeacherClaim[]>('/teacher-claims', data);
  },

  /**
   * 更新教师认领申请
   * PATCH /teacher-claims/{id}
   */
  async updateTeacherClaim(id: number, data: UpdateTeacherClaimRequest): Promise<StudentTeacherClaim> {
    return apiClient.patch<StudentTeacherClaim>(`/teacher-claims/${id}`, data);
  },
};
