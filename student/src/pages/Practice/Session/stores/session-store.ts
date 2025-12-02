/**
 * 练习会话状态管理 Store
 * 使用 zustand 管理练习会话的所有状态和业务逻辑
 */
import { create } from "zustand";
import { practiceService } from "@/services/practice";

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
  audioAnswers: Record<number, string>; // questionId -> audio base64
  answerStatus: Record<number, AnswerStatus>; // questionId -> status
  startTime: number; // 当前题目开始时间（毫秒时间戳）
  submitting: boolean;
  report: PracticeReport | null;

  // ===== Actions =====
  loadSession: (sessionId: number) => Promise<void>;
  beginPractice: () => Promise<void>;
  setAnswer: (questionId: number, answer: string) => void;
  setAudioAnswer: (questionId: number, audioBase64: string) => void;
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

      const detail = await practiceService.getSessionDetail(sessionId);
      const { session, questions, answers, report } = detail;

      // 恢复已提交的答案
      const restoredAnswers: Record<number, string> = {};
      const restoredStatus: Record<number, AnswerStatus> = {};

      if (answers && answers.length > 0) {
        answers.forEach((answer: PracticeAnswer) => {
          if (answer.text_answer) {
            restoredAnswers[answer.question_id] = answer.text_answer;
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

    await practiceService.beginPractice(session.id);
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
   * 设置音频答案（base64）
   */
  setAudioAnswer: (questionId: number, audioBase64: string) => {
    set((state) => ({
      audioAnswers: {
        ...state.audioAnswers,
        [questionId]: audioBase64,
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
    const audioBase64 = audioAnswers[currentQuestion.id];

    // 验证答案
    if (currentQuestion.type === "口语题" && !audioBase64) {
      throw new Error("请先录音");
    }
    if (currentQuestion.type !== "口语题" && !answer) {
      throw new Error("请先选择答案");
    }

    try {
      set({ submitting: true });

      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      // 处理音频数据：如果已经是 base64 字符串，直接使用；否则需要转换
      let finalAudioData: string | undefined;
      if (audioBase64 && currentQuestion.type === "口语题") {
        // 如果已经是纯 base64（不包含 data: 前缀），直接使用
        if (
          !audioBase64.startsWith("http") &&
          !audioBase64.startsWith("data:")
        ) {
          finalAudioData = audioBase64;
        } else if (audioBase64.startsWith("data:")) {
          // 提取 base64 部分
          finalAudioData = audioBase64.split(",")[1];
        } else {
          // 从 URL 获取音频数据并转换为 base64
          const response = await fetch(audioBase64);
          const blob = await response.blob();
          const reader = new FileReader();
          finalAudioData = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const base64 = reader.result as string;
              resolve(base64.split(",")[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      }

      const submitParams: SubmitAnswerParams = {
        session_id: session.id,
        question_id: currentQuestion.id,
        answer: answer || "",
        time_spent: timeSpent,
        is_audio_answer: !!finalAudioData,
        audio_data: finalAudioData,
      };

      const result = await practiceService.submitAnswer(submitParams);

      // 更新答案状态
      set((state) => {
        const progress = (result as any).session_progress;

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

    await practiceService.completePractice(session.id);
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

