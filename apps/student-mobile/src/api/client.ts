import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL
    ? `${process.env.EXPO_PUBLIC_API_URL}/api/student`
    : "http://127.0.0.1:7890/api/student",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 添加请求拦截器，注入 token
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers["x-access-token"] = token;
  }
  return config;
});

// 添加响应拦截器，统一处理数据结构和错误
client.interceptors.response.use(
  (response) => {
    console.log("[LOG_INFO]", response.data);
    const { status, data, message } = response.data;
    if (status !== 0) {
      switch (status) {
        case 401:
          useAuthStore.setState({ token: null });
          break;
        default:
          break;
      }
      return Promise.reject(new Error(message || "请求失败"));
    }
    return data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

import { PracticeStatisticsResponse } from "./types";

export const studentApi = {
  login: async (params: { phone: string; password: string }): Promise<string> => {
    return (await client.post("/login", params)) as any;
  },
  getPracticeStatistics: async (): Promise<PracticeStatisticsResponse> => {
    return (await client.get("/practice/statistics")) as any;
  },
  getPracticeRecords: async (): Promise<any> => {
    return (await client.get("/practice/records")) as any;
  },
  getAbilityAtomics: async (subject: string, grade: number): Promise<any[]> => {
    return (await client.get("/ability/atomics", { params: { subject, grade } })) as any;
  },
  getTextbookUnits: async (textbookId: number): Promise<any[]> => {
    return (await client.get(`/textbook/${textbookId}/units`)) as any;
  },
  getUnitKnowledges: async (unitId: number): Promise<any[]> => {
    return (await client.get(`/textbook/${unitId}/knowledges`)) as any;
  },
  createPractice: async (params: {
    type: string;
    ability_code?: string;
    unit_id?: number;
    subject?: string;
    grade?: number;
  }): Promise<string> => {
    return (await client.post("/practice/create", params)) as any;
  },
  getProfile: async (): Promise<any> => {
    return (await client.get("/profile")) as any;
  },
  getPracticeSessionData: async (sessionId: string): Promise<any> => {
    return (await client.get(`/practice/${sessionId}`)) as any;
  },
  submitAnswer: async (params: {
    session_id: string;
    question_id: string;
    answer: any;
    time_spent: number;
  }): Promise<any> => {
    return (await client.post("/practice/submit", params)) as any;
  },
  completePractice: async (sessionId: string): Promise<any> => {
    return (await client.post(`/practice/${sessionId}/complete`)) as any;
  },
};

export default client;
