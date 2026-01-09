/**
 * 练习会话页面级状态管理
 */
import { useOnce } from "@/common/hooks";
import { studentApi } from "@/lib/api";
import { getPracticeName } from "@/lib/practice";
import { useRequest } from "ahooks";
import { findLastIndex } from "lodash-es";
import { useMemo, useState } from "react";
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
    onError: () => setPanel(PanelType.EMPTY),
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
    // 边界检查
    if (order - 1 < 0) {
      return;
    }
    setOrder((curr) => curr - 1);
    setAnswer(answers[order - 1]);
  };

  /** 下一题 */
  const next = () => {
    // 边界检查
    if (order + 1 >= questions.length) {
      return;
    }
    setOrder((curr) => curr + 1);
    setAnswer(answers[order + 1]);
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

  useOnce(
    () => {
      if (!data) return;
      setPanel(getPanelType(data.session, data.report));
      const initOrder = findLastIndex(data.answers, (answer) => answer.status !== 0) + 1;
      setOrder(initOrder);
      setAnswer(data.answers[initOrder]);
    },
    { ready: !!data }
  );

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
