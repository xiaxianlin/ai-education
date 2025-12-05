/**
 * 练习会话状态管理 Store
 * 使用 zustand 管理练习会话的所有状态和业务逻辑
 */
import { create } from "zustand";
import { studentApi } from "@ai-education/shared-frontend";

/**
 * 答案状态：0-未答, 1-正确, 2-错误
 */
type AnswerStatus = 0 | 1 | 2;

interface SessionStoreState {
  // ===== 状态 =====
  loading: boolean;
  session: PracticeSession | null;
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<number, string>; // questionId -> answer text
  audioAnswers: Record<number, string>; // questionId -> audio OSS path
  audioAnalysis: Record<number, UploadRecordingResult>; // questionId -> audio analysis result
  answerStatus: Record<number, AnswerStatus>; // questionId -> status
  startTime: number; // 当前题目开始时间（毫秒时间戳）
  submitting: boolean;
  report: PracticeReport | null;

  // ===== Actions =====
  loadSession: (sessionId: number) => Promise<void>;
  beginPractice: () => Promise<void>;
  setAnswer: (questionId: number, answer: string) => void;
  setAudioAnswer: (questionId: number, audioOssPath: string) => void;
  setAudioAnalysis: (questionId: number, analysis: UploadRecordingResult) => void;
  submitCurrentAnswer: () => Promise<SubmitAnswerResponse>;
  goPrev: () => void;
  goNext: () => void;
  completePractice: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  loading: true,
  session: null,
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: {},
  audioAnswers: {},
  audioAnalysis: {},
  answerStatus: {},
  startTime: Date.now(),
  submitting: false,
  report: null,
};

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  ...initialState,

  /**
   * 加载会话详情
   */
  loadSession: async (sessionId: number) => {
    try {
      set({ loading: true });

      const detail = await studentApi.getSessionDetail(sessionId);
      const { session, questions, answers, report } = detail;

      // 恢复已提交的答案
      const restoredAnswers: Record<number, string> = {};
      const restoredAudioAnswers: Record<number, string> = {};
      const restoredStatus: Record<number, AnswerStatus> = {};

      if (answers && answers.length > 0) {
        answers.forEach((answer: PracticeAnswer) => {
          if (answer.text_answer) {
            restoredAnswers[answer.question_id] = answer.text_answer;
          }
          if (answer.audio_answer) {
            restoredAudioAnswers[answer.question_id] = answer.audio_answer;
          }
          if (answer.status !== undefined) {
            restoredStatus[answer.question_id] = answer.status as AnswerStatus;
          }
        });
      }

      // 找到第一个未回答的题目
      let firstUnansweredIndex = 0;
      if (questions && questions.length > 0) {
        const index = questions.findIndex(
          (q: Question) =>
            restoredStatus[q.id] === undefined || restoredStatus[q.id] === 0
        );
        if (index !== -1) {
          firstUnansweredIndex = index;
        }
      }

      set({
        session,
        questions: questions || [],
        userAnswers: restoredAnswers,
        audioAnswers: restoredAudioAnswers,
        answerStatus: restoredStatus,
        currentQuestionIndex: firstUnansweredIndex,
        report: report || null,
        startTime: Date.now(),
        loading: false,
      });
    } catch (error) {
      console.error("Failed to load session:", error);
      set({ loading: false });
      throw error;
    }
  },

  /**
   * 开始练习
   */
  beginPractice: async () => {
    const { session } = get();
    if (!session) {
      throw new Error("会话不存在");
    }

    await studentApi.beginPractice(session.id);
    // 重新加载会话以获取最新状态
    await get().loadSession(session.id);
  },

  /**
   * 设置文本答案
   */
  setAnswer: (questionId: number, answer: string) => {
    set((state) => ({
      userAnswers: {
        ...state.userAnswers,
        [questionId]: answer,
      },
    }));
  },

  /**
   * 设置音频答案（OSS 路径）
   */
  setAudioAnswer: (questionId: number, audioOssPath: string) => {
    set((state) => ({
      audioAnswers: {
        ...state.audioAnswers,
        [questionId]: audioOssPath,
      },
    }));
  },

  /**
   * 设置音频理解分析结果
   */
  setAudioAnalysis: (questionId: number, analysis: UploadRecordingResult) => {
    set((state) => ({
      audioAnalysis: {
        ...state.audioAnalysis,
        [questionId]: analysis,
      },
    }));
  },

  /**
   * 提交当前题目答案
   */
  submitCurrentAnswer: async () => {
    const {
      session,
      questions,
      currentQuestionIndex,
      userAnswers,
      audioAnswers,
      audioAnalysis,
      startTime,
    } = get();

    if (!session || !questions || questions.length === 0) {
      throw new Error("会话或题目不存在");
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      throw new Error("当前题目不存在");
    }

    const answer = userAnswers[currentQuestion.id];
    const audioOssPath = audioAnswers[currentQuestion.id];
    const audioAnalysisResult = audioAnalysis[currentQuestion.id];

    // 验证答案
    if (currentQuestion.type === "口语题" && !audioOssPath) {
      throw new Error("请先录音");
    }
    if (currentQuestion.type !== "口语题" && !answer) {
      throw new Error("请先选择答案");
    }

    try {
      set({ submitting: true });

      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      const submitParams = {
        session_id: session.id,
        question_id: currentQuestion.id,
        answer: answer || "",
        time_spent: timeSpent,
        is_audio_answer: !!audioOssPath,
        audio_data: audioOssPath,
      };

      const result = await studentApi.submitAnswer(submitParams);
      if (!result) {
        throw new Error("提交答案失败：服务器未返回结果");
      }

      // 更新答案状态
      set((state) => {
        const progress = (result as any)?.session_progress;

        return {
          answerStatus: {
            ...state.answerStatus,
            [currentQuestion.id]: result.is_correct ? 1 : 2,
          },
          // 如果后端返回了会话进度，则同步更新会话统计；否则保持原有会话数据
          session:
            state.session && progress
              ? {
                  ...state.session,
                  answer_count: progress.answer_count,
                  correct_count: progress.correct_count,
                  status: progress.status,
                }
              : state.session,
          startTime: Date.now(), // 重置开始时间
        };
      });

      return result;
    } catch (error) {
      console.error("Failed to submit answer:", error);
      throw error;
    } finally {
      set({ submitting: false });
    }
  },

  /**
   * 上一题
   */
  goPrev: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({
        currentQuestionIndex: currentQuestionIndex - 1,
        startTime: Date.now(),
      });
    }
  },

  /**
   * 下一题
   */
  goNext: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        startTime: Date.now(),
      });
    }
  },

  /**
   * 完成练习
   */
  completePractice: async () => {
    const { session } = get();
    if (!session) {
      throw new Error("会话不存在");
    }

    await studentApi.completePractice(session.id);
    // 重新加载会话以获取报告
    await get().loadSession(session.id);
  },

  /**
   * 重置状态
   */
  reset: () => {
    set(initialState);
  },
}));

/**
 * Selectors - 派生状态
 */
export const useCurrentQuestion = () => {
  return useSessionStore((state) => {
    if (state.questions.length === 0) return null;
    return state.questions[state.currentQuestionIndex] || null;
  });
};

export const useTotalQuestions = () => {
  return useSessionStore((state) => state.questions.length);
};

export const useAnsweredCount = () => {
  return useSessionStore((state) => {
    return Object.values(state.answerStatus).filter(
      (status) => status !== undefined && status !== 0
    ).length;
  });
};

export const useCurrentAnswerStatus = () => {
  return useSessionStore((state) => {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return undefined;
    return state.answerStatus[currentQuestion.id];
  });
};

export const useCurrentAnswer = () => {
  return useSessionStore((state) => {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return undefined;
    return state.userAnswers[currentQuestion.id];
  });
};

export const useCurrentAudioAnswer = () => {
  return useSessionStore((state) => {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return undefined;
    return state.audioAnswers[currentQuestion.id];
  });
};

export const useIsLastQuestion = () => {
  return useSessionStore((state) => {
    return (
      state.currentQuestionIndex === state.questions.length - 1 &&
      state.questions.length > 0
    );
  });
};

export const useHasAnsweredCurrent = () => {
  return useSessionStore((state) => {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return false;
    const status = state.answerStatus[currentQuestion.id];
    return status !== undefined && status !== 0;
  });
};

