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
    return apiClient.post<Manager>('/manager', data);
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
    return apiClient.post<string>(`/manager/${id}/reset`);
  },
};
