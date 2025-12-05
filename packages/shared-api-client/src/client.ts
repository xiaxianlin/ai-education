import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse } from '@ai-education/shared-types';

/**
 * 基础 API 客户端
 */
export class ApiClient {
  private client: AxiosInstance;
  private tokenKey: string;

  constructor(baseURL: string, tokenKey: string = 'token', config?: AxiosRequestConfig) {
    this.tokenKey = tokenKey;
    this.client = axios.create({
      baseURL,
      timeout: 10 * 60 * 1000, // 10 minutes
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 添加认证 token
        const token = this.getToken();
        if (token) {
          config.headers['x-access-token'] = token;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response;
        // 统一处理响应格式
        if (data.status !== 0 && data.status !== undefined) {
          // 错误会在响应拦截器中处理，这里只处理成功情况
          return response;
        }
        return response;
      },
      (error) => {
        // 统一错误处理
        const response = error.response;
        if (response) {
          const data = response.data as ApiResponse;
          const status = data?.status || response.status;

          // 处理认证错误
          if (status === 401 || status === 403) {
            this.removeToken();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }

          // 处理未设置教材错误
          if (status === 405) {
            if (typeof window !== 'undefined') {
              window.location.href = '/settings';
            }
          }

          const message = data?.message || error.message || '网络错误';
          return Promise.reject(new Error(message));
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * 获取 token
   */
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  /**
   * 移除 token
   */
  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
  }

  /**
   * GET 请求
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data as T;
  }

  /**
   * POST 请求
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  /**
   * PUT 请求
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data as T;
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  /**
   * POST FormData 请求（用于文件上传）
   */
  async postForm<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
    return response.data.data as T;
  }
}

