import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';

// 开发环境使用代理路径，生产环境使用完整 URL
const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'development' ? '/api/student' : 'http://127.0.0.1:7890/api/student');

export interface ApiData<T = unknown> {
  data: T;
  message?: string;
  status?: number;
}

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10 * 60 * 1000, // 与 admin 保持一致，10分钟
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 token
axiosInstance.interceptors.request.use(
  (config) => {
    // 直接从 sessionStorage 获取 token（与 SecureStorage 保持一致）
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('_t');
      if (token && config.headers) {
        config.headers['x-access-token'] = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误和数据格式
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiData>) => {
    const { data = {} as ApiData } = response;
    
    // 处理状态码
    if (data.status === 401) {
      // 未授权，清除 token 并跳转到登录页
      // 401 错误不显示 toast，直接跳转登录页
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('_t');
        window.location.href = '/login';
      }
      throw new Error(data.message || '未授权，请重新登录');
    } else if (data.status === 499) {
      // 需要修改密码（student 项目中暂无密码修改页面，抛出错误）
      const errorMessage = data.message || '需要修改密码';
      console.error(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } else if (data.status !== 0 && data.status !== undefined) {
      // 其他错误状态
      const errorMessage = data.message || '网络异常';
      console.error(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    // 返回完整的 response（与 admin app.tsx 保持一致）
    return response;
  },
  (error) => {
    // 处理网络错误或其他错误
    if (error.response) {
      // 服务器返回了错误状态码
      // error.response.data 可能是 ApiData 格式，也可能不是
      const responseData = error.response.data;
      const httpStatus = error.response.status;
      
      // 处理 HTTP 401 状态码（未授权）
      if (httpStatus === 401) {
        // 未授权，清除 token 并跳转到登录页
        // 401 错误不显示 toast，直接跳转登录页
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('_t');
          window.location.href = '/login';
        }
        throw new Error(responseData && typeof responseData === 'object' && 'message' in responseData
          ? (responseData.message || '未授权，请重新登录')
          : '未授权，请重新登录');
      }
      
      // 如果返回的是 ApiData 格式，使用其 message
      const errorMessage = responseData && typeof responseData === 'object' && 'message' in responseData
        ? (responseData.message || `请求失败: ${httpStatus}`)
        : `请求失败: ${httpStatus}`;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } else if (error.request) {
      // 请求已发出但没有收到响应
      const errorMessage = '网络错误，请检查网络连接';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } else {
      // 其他错误（包括拦截器中抛出的错误）
      // 如果是 Error 对象且有 message，显示 toast
      if (error instanceof Error && error.message) {
        toast.error(error.message);
      } else {
        toast.error('操作失败，请重试');
      }
      throw error;
    }
  }
);

export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.get<ApiData<T>>(url, config).then(res => res.data.data);
  },
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.post<ApiData<T>>(url, data, config).then(res => res.data.data);
  },
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.put<ApiData<T>>(url, data, config).then(res => res.data.data);
  },
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return axiosInstance.delete<ApiData<T>>(url, config).then(res => res.data.data);
  },
};
