import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";

/**
 * 基础 API 客户端
 * 可被 admin-web 和 student-web 继承使用
 */
export class ApiClient {
  protected client: AxiosInstance;
  private tokenKey: string = "_token_";

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10 * 60 * 1000, // 10 minutes
      headers: { "Content-Type": "application/json" },
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers["x-access-token"] = token;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * 获取 token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * 设置 token
   */
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * 移除 token
   */
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  addRequestInterceptor(
    onFulfilled: (value: InternalAxiosRequestConfig) => InternalAxiosRequestConfig,
    onRejected: (error: AxiosError<ApiResponse>) => any
  ): void {
    this.client.interceptors.request.use(onFulfilled, onRejected);
  }

  addResponseInterceptor(
    onFulfilled: (value: AxiosResponse<ApiResponse>) => AxiosResponse<ApiResponse>,
    onRejected: (error: AxiosError<ApiResponse>) => any
  ): void {
    this.client.interceptors.response.use(onFulfilled, onRejected);
  }

  /**
   * GET 请求
   */
  async get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params, ...config });
    return response.data?.data as T;
  }

  /**
   * POST 请求
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data?.data as T;
  }

  /**
   * PUT 请求
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data?.data as T;
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data?.data as T;
  }

  /**
   * PATCH 请求
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data?.data as T;
  }

  /**
   * POST form 请求（用于文件上传）
   */
  async form<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        "Content-Type": "multipart/form-data",
        ...config?.headers,
      },
    });
    return response.data?.data as T;
  }
}
