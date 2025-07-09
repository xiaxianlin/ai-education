import { Toast } from "@taroify/core";
import Taro from "@tarojs/taro";

interface RequestOptions<T = any> {
  path: string;
  method?: keyof Taro.request.Method;
  data?: T;
  headers?: Record<string, string>;
  auth?: boolean;
}

const request = async <T, R = any>(options: RequestOptions<T>) => {
  const { method, path, data, headers = {}, auth = true } = options || {};
  const baseUrl = process.env.TARO_APP_API;
  const dev_device = process.env.TARO_APP_DEV_DEVICE;
  try {
    const token = Taro.getStorageSync("ACCESS_TOKEN");
    const res = await Taro.request<RequestResult<R>>({
      url: `${baseUrl}${path}`,
      method,
      data,
      dataType: "json",
      header: {
        ...headers,
        ...(auth && token ? { "x-access-token": token } : {}),
        ...(dev_device ? { "x-dev-openid": dev_device } : {}),
      },
    });
    console.log("[LOG_INFO]", res.data);
    switch (res.statusCode) {
      case 200:
        return res.data;
      case 401:
        Taro.redirectTo({ url: "/pages/login/index" });
        break;
      default:
        Toast.fail(res.data.detail || "请求失败");
        break;
    }
  } catch (e) {
    Toast.fail("网络异常，请稍后再试");
  }
  return;
};

export const http = {
  get: <R>(path: string) => {
    return request<any, R>({ path, method: "GET" });
  },
  post: <T, R>(path: string, data?: T) => {
    return request<T, R>({ path, method: "POST", data });
  },
};
