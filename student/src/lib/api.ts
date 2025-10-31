import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 开发环境使用代理路径，生产环境使用完整 URL
const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'development' ? '/api/student' : 'http://127.0.0.1:7890/api/student');

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-access-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误和数据格式
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message, data } = response.data;
    
    // 如果 code 不为 0，抛出错误
    if (code !== 0) {
      throw new Error(message || '请求失败');
    }
    
    return data;
  },
  (error) => {
    // 处理网络错误或其他错误
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response;
      const message = data?.message || `请求失败: ${status}`;
      throw new Error(message);
    } else if (error.request) {
      // 请求已发出但没有收到响应
      throw new Error('网络错误，请检查网络连接');
    } else {
      // 其他错误
      throw new Error(error.message || '请求失败');
    }
  }
);

export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.get<T>(url, config);
  },
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.post<T>(url, data, config);
  },
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.put<T>(url, data, config);
  },
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.delete<T>(url, config);
  },
};
