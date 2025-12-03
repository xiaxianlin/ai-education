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
    const token = localStorage.getItem("_t");
    if (token) {
      config.headers["x-access-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：处理错误和数据格式
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiData>) => {
    const { data = {} as ApiData } = response;
    console.log("data", data);
    if (data.status !== 0 && data.status !== undefined) {
      toast(data.message || "网络异常");
    }
    return response;
  },
  (error) => {
    const { data = {} as ApiData } = error.response;
    switch (data.status) {
      case 400:
        toast.error(data.message || "请求参数错误");
        break;
      case 401:
      case 403:
        localStorage.removeItem("_t");
        window.location.href = "/login";
        break;
      case 405:
        toast.error("未设置当前学习教材");
        window.location.href = "/settings";
        break;
      default:
        toast.error(data.message || "网络异常");
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: async <T = unknown>(url: string): Promise<T> => {
    const response = await axiosInstance.get<ApiData<T>>(url);
    return response.data.data;
  },
  postForm: async <T = unknown>(url: string, data: FormData): Promise<T> => {
    const response = await axiosInstance.post<ApiData<T>>(url, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data.status !== 0 && response.data.status !== undefined) {
      throw new Error(response.data.message || "请求失败");
    }
    if (response.data.data === undefined || response.data.data === null) {
      throw new Error("服务器返回数据为空");
    }
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
