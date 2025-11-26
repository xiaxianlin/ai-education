import { api } from "@/lib/api";

export const PracticeApi = {
  getDailyPractice: async () => {
    return api.get<PracticeSession | undefined>("/practice/daily");
  },

  getUnitPractice: async () => {
    return api.get<PracticeSession | undefined>("/practice/unit");
  },

  getAssessment: async () => {
    return api.get<PracticeSession | undefined>("/practice/assessment");
  },

  createDailyPractice: async () => {
    return api.post<number>("/practice/daily_practice/create");
  },

  createUnitPractice: async (unitId: number) => {
    return api.post<number>(`/practice/unit_practice/create?unit_id=${unitId}`);
  },

  createAssessment: async () => {
    return api.post<number>("/practice/assessment_practice/create");
  },

  beginPractice: async (sessionId: number) => {
    return api.post(`/practice/${sessionId}/begin`);
  },

  answer: async (params: AnswerParams) => {
    return api.post("/practice/answer", params);
  },

  completePractice: async (sessionId: number) => {
    return api.post(`/practice/${sessionId}/complete`);
  },

  getSessionDetail: async (sessionId: number) => {
    return api.get<PracticeSessionDetail>(`/practice/session/${sessionId}`);
  },

  getPracticeHistory: async (
    type: "daily_practice" | "unit_practice" | "assessment"
  ) => {
    return api.get<PracticeSession[]>(`/practice/history/${type}`);
  },
};
