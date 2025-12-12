/**
 * 练习会话页面级状态管理
 * 使用 unstated-next 管理练习会话的所有状态和业务逻辑
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCounter, useRequest } from "ahooks";
import { useParams } from "react-router-dom";
import { createContainer } from "unstated-next";
import { studentApi } from "@/lib/api";
import { toast } from "sonner";
import { PanelType } from "../types";
import { getPanelType, getPracticeTypeName } from "../utils";

type DraftAnswer = {
  value: string;
  isAudio: boolean;
  audio?: {
    match?: boolean;
    analysis?: string;
    /** 是否已完成录音解析（用于 UI 提示） */
    uploaded?: boolean;
  };
};

function useContainer() {
  const param = useParams<{ sessionId: string }>();
  const sessionId = Number(param.sessionId);

  const [panel, setPanel] = useState<PanelType>(PanelType.LOADING);
  const [step, { inc: next, dec: prev, set: setStep }] = useCounter(0);
  const [stepStartAt, setStepStartAt] = useState<number>(() => Date.now());
  const [draftByQuestionId, setDraftByQuestionId] = useState<Record<number, DraftAnswer>>({});

  const {
    data,
    loading: detailLoading,
    error: detailError,
    refresh,
  } = useRequest(() => studentApi.getSessionDetail(sessionId), {
    ready: !!sessionId,
    onError: () => {
      setPanel(PanelType.EMPTY);
    },
  });

  const { session, report, questions = [], answers = [] } = data || {};

  const { run: begin, loading: beginning } = useRequest(() => studentApi.beginPractice(sessionId), {
    manual: true,
    onSuccess: refresh,
  });

  const { run: complete, loading: completing } = useRequest(() => studentApi.completePractice(sessionId), {
    manual: true,
    onBefore: () => {
      setPanel(PanelType.SETTLEMENT);
    },
    onSuccess: () => {
      setPanel(PanelType.RESULT);
      refresh();
    },
    onError: (e) => {
      toast.error(e?.message || "结算失败，请稍后重试");
      setPanel(PanelType.PROCESSING);
    },
  });
  const { runAsync: submitAnswer, loading: submitting } = useRequest(
    (params: AnswerRequest) => studentApi.submitAnswer(params),
    {
    manual: true,
    },
  );

  const title = useMemo(() => {
    return getPracticeTypeName(session?.session_type);
  }, [session?.session_type]);

  const question = questions[step];
  const answer = answers[step];

  const currentQuestionId = useMemo(() => {
    if (!question) return null;
    const id = Number(question.id);
    return Number.isFinite(id) ? id : null;
  }, [question]);

  const currentDraft = useMemo(() => {
    if (!currentQuestionId) return undefined;
    return draftByQuestionId[currentQuestionId];
  }, [draftByQuestionId, currentQuestionId]);

  const setCurrentDraftValue = useCallback(
    (value: string) => {
      if (!currentQuestionId) return;
      setDraftByQuestionId((prevMap) => {
        const prev = prevMap[currentQuestionId];
        const isAudio = question?.type === "口语题" || prev?.isAudio || false;
        return {
          ...prevMap,
          [currentQuestionId]: {
            value,
            isAudio,
            audio: prev?.audio,
          },
        };
      });
    },
    [currentQuestionId, question?.type],
  );

  const setCurrentDraftAudio = useCallback(
    (audio: NonNullable<DraftAnswer["audio"]>, value?: string) => {
      if (!currentQuestionId) return;
      setDraftByQuestionId((prevMap) => {
        const prev = prevMap[currentQuestionId];
        return {
          ...prevMap,
          [currentQuestionId]: {
            value: value ?? prev?.value ?? "",
            isAudio: true,
            audio: {
              ...prev?.audio,
              ...audio,
            },
          },
        };
      });
    },
    [currentQuestionId],
  );

  const canPrev = step > 0;
  const isLast = questions.length > 0 ? step >= questions.length - 1 : true;
  const hasAnswered = (answer?.status || 0) !== 0;

  const canSubmit = useMemo(() => {
    if (submitting || completing || beginning) return false;
    if (hasAnswered) return true;
    return !!currentDraft?.value?.trim();
  }, [beginning, completing, currentDraft?.value, hasAnswered, submitting]);

  const handleSubmit = useCallback(async () => {
    if (!session || !question || !currentQuestionId || !answer) {
      toast.error("当前题目数据异常，请稍后重试");
      return;
    }

    // 已答题：作为“下一题/完成练习”入口
    if ((answer.status || 0) !== 0) {
      if (isLast) {
        complete();
      } else {
        next();
      }
      return;
    }

    const userAnswer = (currentDraft?.value || "").trim();
    if (!userAnswer) {
      toast.error("请先作答后再提交");
      return;
    }

    const timeSpent = Math.max(1, Math.floor((Date.now() - stepStartAt) / 1000));
    const isAudioAnswer = question.type === "口语题" || !!currentDraft?.isAudio;

    try {
      await submitAnswer({
        session_id: session.id,
        question_id: currentQuestionId,
        answer: userAnswer,
        time_spent: timeSpent,
        is_audio_answer: isAudioAnswer,
        audio_match: isAudioAnswer ? currentDraft?.audio?.match : undefined,
        audio_analysis: isAudioAnswer ? currentDraft?.audio?.analysis : undefined,
      });

      toast.success(isAudioAnswer ? "已提交口语答案" : "已提交");
      await refresh();

      if (isLast) {
        complete();
      } else {
        next();
      }
    } catch (e: any) {
      toast.error(e?.message || "提交失败，请稍后重试");
    }
  }, [
    answer,
    complete,
    currentDraft,
    currentQuestionId,
    isLast,
    next,
    question,
    refresh,
    session,
    stepStartAt,
    submitAnswer,
  ]);

  // 初始化面板类型
  useEffect(() => {
    if (!session) return;
    setPanel(getPanelType(session, report));
  }, [session, report]);

  // step 切换时重置计时
  useEffect(() => {
    setStepStartAt(Date.now());
  }, [step]);

  // 数据加载后，确保 step 在合法范围内
  useEffect(() => {
    if (!questions.length) return;
    if (step < 0) setStep(0);
    if (step > questions.length - 1) setStep(questions.length - 1);
  }, [questions.length, setStep, step]);

  return {
    panel,
    title,
    session,
    report,
    answers,
    questions,
    step,
    question,
    answer,
    next,
    prev,
    setStep,
    begin,
    complete,
    handleSubmit,
    detailLoading,
    detailError,
    submitting,
    canPrev,
    canSubmit,
    isLast,
    hasAnswered,
    currentDraft,
    setCurrentDraftValue,
    setCurrentDraftAudio,
  };
}

export const PageModel = createContainer(useContainer);
export const usePageModel = PageModel.useContainer;

export const useCurrentQuestion = () => usePageModel().question;
export const useCurrentAnswer = () => usePageModel().answer;
