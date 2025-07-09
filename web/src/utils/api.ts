import { history } from '@umijs/max';
import { message } from 'antd';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

// 定义接口返回数据的通用格式
interface ApiResponse<T = any> {
  ok: boolean;
  data: T;
  message?: string;
  status?: number;
  detail?: any;
}

// 定义扩展的请求配置
interface RequestConfig extends AxiosRequestConfig {
  retry?: boolean;
}

class HttpClient {
  private instance: AxiosInstance;
  private defaultConfig: AxiosRequestConfig = {
    baseURL: '/api', // 从环境变量获取
    timeout: 10 * 60 * 1000,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  };

  constructor(config?: RequestConfig) {
    // 合并配置
    this.instance = axios.create({ ...this.defaultConfig, ...config });

    // 请求拦截器
    this.instance.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers['x-access-token'] = token;
      }
      return config;
    });

    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        if (!response.data.ok) {
          message.error(response.data.message);
        }
        return response;
      },
      (error: any) => {
        const { status } = error.response;
        if (status === 401) {
          history.push('/login');
        } else {
          message.error('网络异常');
        }
        return Promise.reject(error);
      },
    );
  }

  // 公共请求方法
  public request<T = any>(config: RequestConfig): Promise<T> {
    return this.instance(config);
  }

  // GET请求
  public async get<T = any>(url: string, params?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const res = await this.instance.get(url, { ...config, params });
    return res.data;
  }

  // POST请求
  public async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const res = await this.instance.post(url, data, config);
    return res.data;
  }

  // PUT请求
  public async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const res = await this.instance.put(url, data, config);
    return res.data;
  }

  // DELETE请求
  public async delete<T = any>(url: string, params?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const res = await this.instance.delete(url, { ...config, params });
    return res.data;
  }

  // PATCH请求
  public async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const res = await this.instance.patch(url, data, config);
    return res.data;
  }

  // 上传文件
  public async upload<T = any>(url: string, data: FormData, config?: RequestConfig): Promise<ApiResponse<T>> {
    const res = await this.instance.post(url, data, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
}

export const api = new HttpClient();
