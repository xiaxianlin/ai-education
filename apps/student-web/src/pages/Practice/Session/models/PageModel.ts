/**
 * 练习会话页面级状态管理
 * 使用 unstated-next 管理练习会话的所有状态和业务逻辑
 */
import { useEffect, useMemo, useState } from "react";
import { useRequest } from "ahooks";
import { useParams } from "react-router-dom";
import { createContainer } from "unstated-next";
import { studentApi } from "@/lib/api";
import { toast } from "sonner";
import { PanelType, QuestionType } from "../types";
import { getPanelType, getPracticeTypeName } from "../utils";

function useContainer() {
  const param = useParams<{ sessionId: string }>();
  const sessionId = Number(param.sessionId);

  const [panel, setPanel] = useState<PanelType>(PanelType.LOADING);
  const [order, setOrder] = useState(0);
  const [answerRecords, setAnswerRecords] = useState<Record<number, AnswerRecord>>({});
  const [answerRecord, setAnswerRecord] = useState<AnswerRecord>({
    text: "",
    match: false,
    analysis: "",
  });

  const { data, refresh } = useRequest(() => studentApi.getSessionDetail(sessionId), {
    ready: !!sessionId,
    onError: () => setPanel(PanelType.EMPTY),
  });

  const { session, report, questions = [], answers = [] } = data || {};

  const { run: begin } = useRequest(() => studentApi.beginPractice(sessionId), {
    manual: true,
    onSuccess: refresh,
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

  const { run: submitAnswer, loading: submitting } = useRequest(
    (params: AnswerRequest) => studentApi.submitAnswer(params),
    {
      manual: true,
      onSuccess: (res) => {
        const answerRecord = answerRecords[question.id];
        handleAnswer({
          ...answerRecord,
          correct_answer: res.correct_answer,
          analysis: answerRecord.analysis || res.analysis || "",
        });
      },
      onError: (e) => {
        toast.error(e?.message || "提交失败，请稍后重试");
      },
    }
  );

  const question = questions[order];
  const answer = answers[order];

  // 练习标题
  const title = useMemo(() => {
    return getPracticeTypeName(session?.session_type);
  }, [session?.session_type]);

  // 是否全部答完
  const isComplete = useMemo(() => {
    return Object.values(answerRecords).length === questions.length;
  }, [answerRecords]);

  const prev = () => {
    // 边界检查
    if (order - 1 < 0) {
      return;
    }
    setOrder((curr) => curr - 1);
  };

  const next = () => {
    // 边界检查
    if (order + 1 > questions.length) {
      return;
    }
    setOrder((curr) => curr + 1);
  };

  const handleAnswer = (value: AnswerRecord) => {
    setAnswerRecords((curr) => ({
      ...curr,
      [question.id]: { ...value },
    }));
  };

  const handleSubmit = (timeSpent: number) => {
    const answerRecord = answerRecords[question.id];

    if (!answerRecord) {
      toast.error("请先作答后再提交");
      return;
    }

    const isAudioAnswer = question.type === QuestionType.AUDIO;

    submitAnswer({
      session_id: session?.id || 0,
      question_id: question.id || 0,
      answer: answerRecord.text,
      time_spent: timeSpent,
      is_audio_answer: isAudioAnswer,
      audio_match: answerRecord.match,
      audio_analysis: answerRecord.analysis,
    });
  };

  useEffect(() => {
    setAnswerRecord(answerRecords[question?.id]);
  }, [question?.id, answerRecords]);

  // 初始化面板类型
  useEffect(() => {
    if (!session) return;
    setPanel(getPanelType(session, report));
    const initAnswerRecords = answers
      .filter((answer) => answer.status !== 0)
      .reduce(
        (acc, answer) => {
          return {
            ...acc,
            [answer.question_id]: {
              text: answer.text_answer || "",
              match: answer.status === 1,
              analysis: "",
            },
          };
        },
        {} as Record<number, AnswerRecord>
      );
    setAnswerRecords(initAnswerRecords);
  }, [session, report]);

  return {
    title,
    panel,
    session,
    report,
    order,
    answer,
    answers,
    question,
    questions,
    answerRecord,
    isComplete,
    submitting,
    prev,
    next,
    begin,
    complete,
    handleAnswer,
    handleSubmit,
    setAnswerRecord,
  };
}

export const PageModel = createContainer(useContainer);
export const usePageModel = PageModel.useContainer;
