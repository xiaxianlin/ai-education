/**
 * 能力评测 API 服务
 * 根据 API.md 规范实现
 */
import { api } from "@/lib/api";
import type { PracticeSession, AssessmentHistoryItem } from "./types";

export const assessmentApi = {
  /**
   * 获取能力评估（根据 API.md: GET /api/student/practice/assessment）
   * 获取未完成的能力评估
   */
  getAssessment: async (): Promise<PracticeSession | null> => {
    return api.get<PracticeSession | null>("/practice/assessment");
  },

  /**
   * 创建能力评估（根据 API.md: POST /api/student/practice/assessment）
   * 为学生生成能力评估
   */
  create: async (): Promise<PracticeSession> => {
    return api.post<PracticeSession>("/practice/assessment");
  },

  /**
   * 获取能力评估历史（根据 API.md: GET /api/student/practice/history/assessment）
   */
  getHistory: async (limit?: number): Promise<AssessmentHistoryItem[]> => {
    const params = limit ? `?limit=${limit}` : "";
    return api.get<AssessmentHistoryItem[]>(
      `/practice/history/assessment${params}`
    );
  },

  // ===== 兼容旧接口的方法 =====

  /**
   * 获取下一道评测题目
   * 从会话中获取下一题
   */
  getNextQuestion: async (
    assessmentId: number
  ): Promise<{
    question: any;
    progress: {
      current: number;
      max: number;
      min: number;
    };
    current_ability: number;
    confidence: number;
  } | null> => {
    try {
      const { practiceApi } = await import("./index");
      const detail = await practiceApi.getSessionDetail(assessmentId);

      if (
        !detail.session ||
        !detail.questions ||
        detail.questions.length === 0
      ) {
        return null;
      }

      // 找到未答的题目
      const answeredIds = new Set(
        detail.answers?.map((a) => a.question_id) || []
      );
      const nextQuestion = detail.questions.find((q) => !answeredIds.has(q.id));

      if (!nextQuestion) {
        return null;
      }

      const session = detail.session;
      const answeredCount = session.answer_count || 0;
      const questionCount = session.question_count || 0;

      return {
        question: nextQuestion,
        progress: {
          current: answeredCount + 1,
          max: questionCount,
          min: 10, // 默认最小值
        },
        current_ability: (session as any).current_ability || 0,
        confidence: (session as any).confidence || 0,
      };
    } catch (error) {
      console.error("获取下一题失败:", error);
      return null;
    }
  },

  /**
   * 提交评测答案
   * 使用统一的答案提交接口
   */
  submitAnswer: async (params: {
    session_id: number;
    question_id: number;
    answer: string;
    time_spent?: number;
    is_audio_answer?: boolean;
    audio_data?: string;
  }): Promise<{
    is_correct: boolean;
    correct_answer: string;
    current_ability: number;
    confidence: number;
    answered_count: number;
  }> => {
    const { practiceApi } = await import("./index");
    const result = await practiceApi.submitAnswer(params);

    // 获取更新后的会话信息以获取能力值
    const detail = await practiceApi.getSessionDetail(params.session_id);
    const session = detail.session as any;

    return {
      is_correct: result.is_correct,
      correct_answer: result.correct_answer,
      current_ability: session.current_ability || 0,
      confidence: session.confidence || 0,
      answered_count: session.answer_count || 0,
    };
  },

  /**
   * 完成能力评测
   * 使用统一的完成接口
   */
  complete: async (assessmentId: number): Promise<{ report_id: number }> => {
    const { practiceApi } = await import("./index");
    return practiceApi.completePractice(assessmentId);
  },
};
