import { apiClient } from '@/lib/api';

/**
 * 创建能力域请求
 */
export interface CreateAbilityDomainRequest {
  subject: string;
  code: string;
  name: string;
  description?: string;
  sort_order?: number;
}

/**
 * 更新能力域请求
 */
export interface UpdateAbilityDomainRequest {
  name?: string;
  description?: string;
  sort_order?: number;
  is_active?: number;
}

/**
 * 搜索能力域请求
 */
export interface SearchAbilityDomainRequest {
  subject?: string;
}

/**
 * 创建原子能力请求
 */
export interface CreateAbilityAtomicRequest {
  subject: string;
  grade: number;
  domain_code: string;
  code: string;
  name: string;
  description?: string;
  difficulty?: number; // 1-5
  sort_order?: number;
}

/**
 * 更新原子能力请求
 */
export interface UpdateAbilityAtomicRequest {
  name?: string;
  description?: string;
  difficulty?: number; // 1-5
  sort_order?: number;
  is_active?: number;
}

/**
 * 搜索原子能力请求
 */
export interface SearchAbilityAtomicRequest {
  subject?: string;
  grade?: number;
  domain_code?: string;
}

export const AbilityApi = {
  /**
   * 搜索能力域
   * GET /ability/domain/search
   */
  async searchDomains(params?: SearchAbilityDomainRequest) {
    return apiClient.get<AbilityDomain[]>('/ability/domain/search', params);
  },

  /**
   * 获取能力域详情
   * GET /ability/domain/{id}
   */
  async getDomain(id: number) {
    return apiClient.get<AbilityDomain>(`/ability/domain/${id}`);
  },

  /**
   * 创建能力域
   * POST /ability/domain
   */
  async createDomain(data: CreateAbilityDomainRequest) {
    return apiClient.post<number>('/ability/domain', data);
  },

  /**
   * 更新能力域
   * PATCH /ability/domain/{id}
   */
  async updateDomain(id: number, data: UpdateAbilityDomainRequest) {
    return apiClient.patch(`/ability/domain/${id}`, data);
  },

  /**
   * 删除能力域
   * DELETE /ability/domain/{id}
   */
  async deleteDomain(id: number) {
    return apiClient.delete(`/ability/domain/${id}`);
  },

  /**
   * 根据科目获取能力数据（二级结构）
   * GET /ability/by-subject/{subject}
   */
  async getBySubject(subject: string) {
    return apiClient.get<AbilityDomainWithAtomics[]>(
      `/ability/by-subject/${subject}`
    );
  },

  // ========== 原子能力管理 ==========

  /**
   * 搜索原子能力
   * GET /ability/atomic/search
   */
  async searchAtomics(params?: SearchAbilityAtomicRequest) {
    return apiClient.get<AbilityAtomic[]>('/ability/atomic/search', params);
  },

  /**
   * 获取原子能力详情
   * GET /ability/atomic/{id}
   */
  async getAtomic(id: number) {
    return apiClient.get<AbilityAtomic>(`/ability/atomic/${id}`);
  },

  /**
   * 创建原子能力
   * POST /ability/atomic
   */
  async createAtomic(data: CreateAbilityAtomicRequest) {
    return apiClient.post<number>('/ability/atomic', data);
  },

  /**
   * 更新原子能力
   * PATCH /ability/atomic/{id}
   */
  async updateAtomic(id: number, data: UpdateAbilityAtomicRequest) {
    return apiClient.patch(`/ability/atomic/${id}`, data);
  },

  /**
   * 删除原子能力
   * DELETE /ability/atomic/{id}
   */
  async deleteAtomic(id: number) {
    return apiClient.delete(`/ability/atomic/${id}`);
  },

  /**
   * 按能力域查询原子能力
   * GET /ability/atomic/by-domain/{domain_code}
   */
  async getAtomicsByDomain(domainCode: string, subject?: string) {
    return apiClient.get<AbilityAtomic[]>(
      `/ability/atomic/by-domain/${domainCode}`,
      subject ? { subject } : undefined
    );
  },
};
