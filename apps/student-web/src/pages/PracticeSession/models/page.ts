/**
 * 练习会话页面级状态管理
 */
import { studentApi } from "@/lib/api";
import { getPracticeName } from "@/lib/practice";
import { useRequest } from "ahooks";
import { findLastIndex } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { createContainer } from "unstated-next";
import { PanelType } from "../types";
import { getPanelType } from "../utils";

function useContainer() {
  const param = useParams<{ sessionId: string }>();
  const sessionId = param.sessionId || "";

  const [panel, setPanel] = useState<PanelType>(PanelType.LOADING);
  const [order, setOrder] = useState(0);
  const [answer, setAnswer] = useState<PracticeAnswer>();

  const { data, refresh } = useRequest(() => studentApi.getPracticeSessionData(sessionId), {
    ready: !!sessionId,
    onSuccess: (res) => {
      console.log("[PracticeSession] API Response:", res);
    },
    onError: (err) => {
      console.error("[PracticeSession] API Error:", err);
      setPanel(PanelType.EMPTY);
    },
  });

  const { run: begin } = useRequest(() => studentApi.beginPractice(sessionId), {
    manual: true,
    onSuccess: () => {
      setPanel(PanelType.PROCESSING);
      refresh();
    },
  });

  const { run: complete } = useRequest(() => studentApi.completePractice(sessionId), {
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

  /** 上一题 */
  const prev = () => {
    setOrder((curr) => {
      // 边界检查
      if (curr - 1 < 0) {
        return curr;
      }
      const newOrder = curr - 1;
      setAnswer(answers[newOrder]);
      return newOrder;
    });
  };

  /** 下一题 */
  const next = () => {
    setOrder((curr) => {
      // 边界检查
      if (curr + 1 >= questions.length) {
        return curr;
      }
      const newOrder = curr + 1;
      setAnswer(answers[newOrder]);
      return newOrder;
    });
  };

  /** 跳转到指定题目 */
  const jumpTo = (index: number) => {
    if (index < 0 || index >= questions.length) {
      return;
    }
    setOrder(index);
    setAnswer(answers[index]);
  };

  const { run: submitAnswer, loading: submitting } = useRequest(
    (params: AnswerRequest) => studentApi.submitAnswer(params),
    {
      manual: true,
      onSuccess: (res) => {
        if (res.status === 1) {
          next();
        }
        refresh();
      },
    }
  );

  const { session, report, questions = [], answers = [] } = data || {};
  const question = questions[order];

  // 是否全部答完
  const isComplete = useMemo(() => {
    return answers.every((answer) => answer.status !== 0);
  }, [answers]);

  /** 提交答案 */
  const handleSubmit = (timeSpent: number) => {
    if (!answer) {
      toast.error("请先作答后再提交");
      return;
    }

    // 判断是否为口语题：根据 interaction_type 判断
    const isAudioAnswer = question?.question_type?.interaction_type === "voice_input" || question?.question_type?.interaction_type === "free_speak";

    submitAnswer({
      session_id: session?.id || "",
      question_id: question?.id || "",
      answer: answer.text_answer || "",
      time_spent: timeSpent,
      is_audio_answer: isAudioAnswer,
      audio_match: answer.status === 1 ? true : false,
      audio_analysis: answer.analysis,
    });
  };

  // 当数据加载完成后，初始化面板状态和题目顺序
  useEffect(() => {
    if (!data || !data.session) return;
    setPanel(getPanelType(data.session, data.report));
    const answers = data.answers || [];
    const initOrder = findLastIndex(answers, (answer) => answer.status !== 0) + 1;
    // 确保 initOrder 在有效范围内
    const safeOrder = Math.max(0, Math.min(initOrder, answers.length - 1));
    setOrder(safeOrder);
    setAnswer(answers[safeOrder]);
  }, [data]);

  return {
    title: session ? getPracticeName(session.practice_type) : undefined,
    panel,
    session,
    report,
    order,
    answer,
    answers,
    question,
    questions,
    isComplete,
    submitting,
    prev,
    next,
    jumpTo,
    begin,
    complete,
    setAnswer,
    handleSubmit,
  };
}

export const PracticeSessionModel = createContainer(useContainer);
export const usePracticeSessionModel = PracticeSessionModel.useContainer;
