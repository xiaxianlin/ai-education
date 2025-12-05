import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';

export interface ApiData<T = any> {
  status?: number;
  message?: string;
  data?: T;
}

// 创建 axios 实例
const request = axios.create({
  timeout: 10 * 60 * 1000,
  baseURL: '/api/admin',
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['x-access-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiData>) => {
    const { data = {} as any } = response;
    const code = data.status;
    
    if (code === 401) {
      window.location.hash = '#/login';
    } else if (code === 499) {
      window.location.hash = '#/password';
    } else if (code !== 0 && code !== undefined) {
      message.error(data.message || '网络异常');
      throw new Error(data.message || '网络异常');
    }
    
    return response;
  },
  (error) => {
    message.error(error.message || '网络异常');
    return Promise.reject(error);
  }
);

export default request;

