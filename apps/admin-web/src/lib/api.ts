import { ApiClient, go } from '@ai-education/shared-web';
import { toast } from '@/components/ui/toast';

export const apiClient = new ApiClient('/api/admin');

apiClient.addResponseInterceptor(
  (response) => {
    const { status, message } = response?.data || {};
    // 处理认证错误
    if (status === 0) {
      return response;
    }
    if (status === 401) {
      apiClient.removeToken();
      go('/login');
    }
    throw Error(message);
  },
  (error) => error,
);

apiClient.addResponseInterceptor(
  (response) => response,
  (error) => {
    // 仅在开发环境输出日志
    if (process.env.NODE_ENV === 'development') {
      console.log(error.message);
    }
    toast.error(error.message || '网络错误');
    return Promise.reject(error);
  },
);

/**
 * 管理端 API 客户端类
 */
export const CommonApi = {
  /**
   * 检查登录状态
   * GET /check
   */
  async check(): Promise<Manager> {
    return apiClient.get<Manager>('/check');
  },

  /**
   * 获取系统配置
   * GET /configs
   */
  async getConfigs(params?: { subject?: string; grade?: number }) {
    return apiClient.get<Configs>('/configs', params);
  },
};
