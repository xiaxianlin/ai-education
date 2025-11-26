import axios, { AxiosInstance, AxiosResponse } from "axios";
import { toast } from "sonner";

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: "/api/student",
  timeout: 10 * 60 * 1000,
  headers: { "Content-Type": "application/json" },
});

// 请求拦截器：添加 token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("_t");
    if (token && config.headers) {
      config.headers["x-access-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：处理错误和数据格式
axiosInstance.interceptors.response.use((response: AxiosResponse<ApiData>) => {
  const { data = {} as ApiData } = response;

  switch (data.status) {
    case 401:
      sessionStorage.removeItem("_t");
      window.location.href = "/login";
      break;
    case 403:
      toast.error("未设置当前学习教材");
      window.location.href = "/settings";
      break;
    case 400:
      toast.error(data.message || "请求参数错误");
      break;
    default:
      if (data.status !== 0 && data.status !== undefined) {
        toast.error(data.message || "网络异常");
      }
  }
  return response;
});

export const api = {
  get: async <T = unknown>(url: string): Promise<T> => {
    const response = await axiosInstance.get<ApiData<T>>(url);
    return response.data.data;
  },
  post: async <T = unknown>(url: string, data?: unknown): Promise<T> => {
    const response = await axiosInstance.post<ApiData<T>>(url, data);
    return response.data.data;
  },
  put: async <T = unknown>(url: string, data?: unknown): Promise<T> => {
    const response = await axiosInstance.put<ApiData<T>>(url, data);
    return response.data.data;
  },
  delete: async <T = unknown>(url: string): Promise<T> => {
    const response = await axiosInstance.delete<ApiData<T>>(url);
    return response.data.data;
  },
};
