/**
 * 练习会话状态管理 Store
 * 使用 unstated-next 管理练习会话的所有状态和业务逻辑
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createContainer } from "unstated-next";
import { studentApi } from "@/lib/api";

/**
 * 答案状态：0-未答, 1-正确, 2-错误
 */
type AnswerStatus = 0 | 1 | 2;

/** 录音上传结果 */
interface UploadRecordingResult {
  text: string;
  match: boolean;
  analysis: string;
}

interface SessionState {
  // ===== 状态 =====
  loading: boolean;
  session: PracticeSession | null;
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<string | number, string>; // questionId -> answer text
  audioAnswers: Record<string | number, string>; // questionId -> audio OSS path
  audioAnalysis: Record<string | number, UploadRecordingResult>; // questionId -> audio analysis result
  answerStatus: Record<string | number, AnswerStatus>; // questionId -> status
  startTime: number; // 当前题目开始时间（毫秒时间戳）
  submitting: boolean;
  report: PracticeReport | null;
}

interface SessionStoreValue extends SessionState {
  loadSession: (sessionId: number) => Promise<void>;
  beginPractice: () => Promise<void>;
  setAnswer: (questionId: number, answer: string) => void;
  setAudioAnswer: (questionId: number, audioBase64: string) => void;
  setAudioAnalysis: (questionId: number, analysis: UploadRecordingResult) => void;
  submitCurrentAnswer: () => Promise<AnswerResponse>;
  goPrev: () => void;
  goNext: () => void;
  completePractice: () => Promise<void>;
  reset: () => void;
}

const initialState: SessionState = {
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

function useSessionStoreInternal(): SessionStoreValue {
  const [state, setState] = useState<SessionState>(initialState);
  const stateRef = useRef<SessionState>(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const set = useCallback(
    (updater: Partial<SessionState> | ((prev: SessionState) => Partial<SessionState>)) => {
      setState((prev) => {
        const partial = typeof updater === "function" ? updater(prev) : updater;
        const next = { ...prev, ...partial };
        stateRef.current = next;
        return next;
      });
    },
    []
  );

  const get = useCallback(() => stateRef.current, []);

  const loadSession = useCallback(
    async (sessionId: number) => {
      try {
        set({ loading: true });

        const detail = await studentApi.getSessionDetail(sessionId);
        const { session, questions, answers, report } = detail;

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

        let firstUnansweredIndex = 0;
        if (questions && questions.length > 0) {
          const index = questions.findIndex((q: Question) => {
            const questionId = typeof q.id === "string" ? parseInt(q.id, 10) : q.id;
            return restoredStatus[questionId] === undefined || restoredStatus[questionId] === 0;
          });
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
    [set]
  );

  const beginPractice = useCallback(async () => {
    const currentSession = get().session;
    if (!currentSession) {
      throw new Error("会话不存在");
    }

    await studentApi.beginPractice(currentSession.id);
    await loadSession(currentSession.id);
  }, [get, loadSession]);

  const setAnswer = useCallback(
    (questionId: number, answer: string) => {
      set((prev) => ({
        userAnswers: {
          ...prev.userAnswers,
          [questionId]: answer,
        },
      }));
    },
    [set]
  );

  const setAudioAnswer = useCallback(
    (questionId: number, audioOssPath: string) => {
      set((prev) => ({
        audioAnswers: {
          ...prev.audioAnswers,
          [questionId]: audioOssPath,
        },
      }));
    },
    [set]
  );

  const setAudioAnalysis = useCallback(
    (questionId: number, analysis: UploadRecordingResult) => {
      set((prev) => ({
        audioAnalysis: {
          ...prev.audioAnalysis,
          [questionId]: analysis,
        },
      }));
    },
    [set]
  );

  const submitCurrentAnswer = useCallback(async () => {
    const { session, questions, currentQuestionIndex, userAnswers, audioAnswers, startTime } = get();

    if (!session || !questions || questions.length === 0) {
      throw new Error("会话或题目不存在");
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      throw new Error("当前题目不存在");
    }

    const questionId = typeof currentQuestion.id === "string" ? parseInt(currentQuestion.id, 10) : currentQuestion.id;
    const answer = userAnswers[questionId];
    const audioOssPath = audioAnswers[questionId];

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
        question_id: Number(currentQuestion.id),
        answer: answer || "",
        time_spent: timeSpent,
        is_audio_answer: !!audioOssPath,
        audio_data: audioOssPath,
      };

      const result = await studentApi.submitAnswer(submitParams);
      if (!result) {
        throw new Error("提交答案失败：服务器未返回结果");
      }

      set((prev) => {
        const progress = (result as any)?.session_progress;

        return {
          answerStatus: {
            ...prev.answerStatus,
            [questionId]: result.is_correct ? 1 : (2 as AnswerStatus),
          },
          session:
            prev.session && progress
              ? {
                  ...prev.session,
                  answer_count: progress.answer_count,
                  correct_count: progress.correct_count,
                  status: progress.status,
                }
              : prev.session,
          startTime: Date.now(),
        };
      });

      return result;
    } catch (error) {
      console.error("Failed to submit answer:", error);
      throw error;
    } finally {
      set({ submitting: false });
    }
  }, [get, set]);

  const goPrev = useCallback(() => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({
        currentQuestionIndex: currentQuestionIndex - 1,
        startTime: Date.now(),
      });
    }
  }, [get, set]);

  const goNext = useCallback(() => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        startTime: Date.now(),
      });
    }
  }, [get, set]);

  const completePractice = useCallback(async () => {
    const currentSession = get().session;
    if (!currentSession) {
      throw new Error("会话不存在");
    }

    await studentApi.completePractice(currentSession.id);
    await loadSession(currentSession.id);
  }, [get, loadSession]);

  const reset = useCallback(() => {
    set(initialState);
  }, [set]);

  return useMemo(
    () => ({
      ...state,
      loadSession,
      beginPractice,
      setAnswer,
      setAudioAnswer,
      setAudioAnalysis,
      submitCurrentAnswer,
      goPrev,
      goNext,
      completePractice,
      reset,
    }),
    [
      beginPractice,
      completePractice,
      goNext,
      goPrev,
      loadSession,
      setAnswer,
      setAudioAnalysis,
      setAudioAnswer,
      state,
      submitCurrentAnswer,
      reset,
    ]
  );
}

const SessionStore = createContainer(useSessionStoreInternal);

type UseSessionStore = {
  (): SessionStoreValue;
  <T>(selector: (state: SessionStoreValue) => T): T;
};

export const SessionProvider = SessionStore.Provider;
export const useSessionStore: UseSessionStore = ((selector?: (state: SessionStoreValue) => unknown) => {
  const store = SessionStore.useContainer();
  return selector ? selector(store) : store;
}) as UseSessionStore;

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
    return Object.values(state.answerStatus).filter((status) => status !== undefined && status !== 0).length;
  });
};

export const useCurrentAnswerStatus = () => {
  return useSessionStore((state) => {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return undefined;
    const questionId = typeof currentQuestion.id === "string" ? parseInt(currentQuestion.id, 10) : currentQuestion.id;
    return state.answerStatus[questionId];
  });
};

export const useCurrentAnswer = () => {
  return useSessionStore((state) => {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return undefined;
    const questionId = typeof currentQuestion.id === "string" ? parseInt(currentQuestion.id, 10) : currentQuestion.id;
    return state.userAnswers[questionId];
  });
};

export const useCurrentAudioAnswer = () => {
  return useSessionStore((state) => {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return undefined;
    const questionId = typeof currentQuestion.id === "string" ? parseInt(currentQuestion.id, 10) : currentQuestion.id;
    return state.audioAnswers[questionId];
  });
};

export const useIsLastQuestion = () => {
  return useSessionStore((state) => {
    return state.currentQuestionIndex === state.questions.length - 1 && state.questions.length > 0;
  });
};

export const useHasAnsweredCurrent = () => {
  return useSessionStore((state) => {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    if (!currentQuestion) return false;
    const questionId = typeof currentQuestion.id === "string" ? parseInt(currentQuestion.id, 10) : currentQuestion.id;
    const status = state.answerStatus[questionId];
    return status !== undefined && status !== 0;
  });
};
