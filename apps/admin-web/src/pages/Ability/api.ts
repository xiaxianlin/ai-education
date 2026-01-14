import { apiClient } from '@/lib/api';

/**
 * 创建能力请求
 */
export interface CreateAbilityRequest {
  subject: string;
  grade: number;
  code: string;
  name: string;
  description?: string;
  difficulty?: number; // 1-5
}

/**
 * 更新能力请求
 */
export interface UpdateAbilityRequest {
  code?: string;
  name?: string;
  description?: string;
  difficulty?: number; // 1-5
  is_active?: number;
}

/**
 * 搜索能力请求
 */
export interface SearchAbilityRequest {
  subject?: string;
  grade?: number;
}

/**
 * 批量删除能力请求
 */
export interface BatchDeleteAbilityRequest {
  ids: number[];
}

export const AbilityApi = {
  /**
   * 根据科目获取能力数据（按年级分组）
   * GET /ability/by-subject/{subject}
   */
  async getBySubject(subject: string) {
    return apiClient.get<Record<string, Ability[]>>(
      `/ability/by-subject/${subject}`
    );
  },

  // ========== 能力管理 ==========

  /**
   * 搜索能力
   * GET /ability/search
   */
  async searchAbilities(params?: SearchAbilityRequest) {
    return apiClient.get<Ability[]>('/ability/search', params);
  },

  /**
   * 获取能力详情
   * GET /ability/{id}
   */
  async getAbility(id: number) {
    return apiClient.get<Ability>(`/ability/${id}`);
  },

  /**
   * 创建能力
   * POST /ability
   */
  async createAbility(data: CreateAbilityRequest) {
    return apiClient.post<number>('/ability', data);
  },

  /**
   * 更新能力
   * PATCH /ability/{id}
   */
  async updateAbility(id: number, data: UpdateAbilityRequest) {
    return apiClient.patch(`/ability/${id}`, data);
  },

  /**
   * 删除能力
   * DELETE /ability/{id}
   */
  async deleteAbility(id: number) {
    return apiClient.delete(`/ability/${id}`);
  },

  /**
   * 批量删除能力
   * POST /ability/batch_delete
   */
  async batchDeleteAbilities(ids: number[]) {
    return apiClient.post<{ message: string; deleted_count: number }>(
      '/ability/batch_delete',
      { ids }
    );
  },

  /**
   * 导出能力数据（按学科和年级）
   * POST /ability/export
   */
  async exportAbilitiesByGrade(params: {
    subject: string;
    grade: number;
  }): Promise<Blob> {
    const url = `/api/admin/ability/export?subject=${encodeURIComponent(
      params.subject
    )}&grade=${params.grade}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-access-token': apiClient.getToken() || '',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`导出失败: ${response.statusText} - ${errorText}`);
    }

    return await response.blob();
  },

  /**
   * 导入能力数据（按学科和年级）
   * POST /ability/import
   */
  async importAbilitiesByGrade(
    file: File,
    params: {
      subject: string;
      grade: number;
    }
  ): Promise<{ deleted_count: number; created_count: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `/api/admin/ability/import?subject=${encodeURIComponent(
      params.subject
    )}&grade=${params.grade}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-access-token': apiClient.getToken() || '',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `导入失败: ${response.statusText}`);
    }

    return await response.json();
  },
};
