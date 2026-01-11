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
        // 更新当前题目的答案状态（用于显示反馈）
        setAnswer(res);

        // 刷新数据以同步状态
        refresh();

        // 检查是否有 AI 分析
        const hasAIAnalysis = (() => {
          if (!res.analysis) return false;
          try {
            const analysisData = typeof res.analysis === "string" ? JSON.parse(res.analysis) : res.analysis;
            return !!analysisData?.analysis;
          } catch {
            return false;
          }
        })();

        if (res.status === 1 && !hasAIAnalysis) {
          next();
        }
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

    const interactionType = question?.question_type?.interaction_type;
    const isComposite = question?.answer?.type === "composite";

    // 从 answer.answer 读取答案
    let rawAnswer = answer.answer;

    // 根据题型构建标准化的答案格式
    let formattedAnswer: any;

    if (isComposite) {
      // 复合题：构建 [{"sub_id": "1", "value": "答案"}] 格式
      if (rawAnswer) {
        try {
          const parsed = typeof rawAnswer === "string" ? JSON.parse(rawAnswer) : rawAnswer;
          formattedAnswer = Array.isArray(parsed) ? parsed : null;
        } catch {
          formattedAnswer = null;
        }
      } else {
        formattedAnswer = null;
      }
    } else if (interactionType === "multi_choice") {
      // 多选题：构建 ["A", "B", "C"] 数组格式
      if (rawAnswer) {
        try {
          const parsed = typeof rawAnswer === "string" ? JSON.parse(rawAnswer) : rawAnswer;
          formattedAnswer = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          formattedAnswer = Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer];
        }
      } else {
        formattedAnswer = [];
      }
    } else if (interactionType === "connect_line") {
      // 匹配题：构建 {"A": "1", "B": "2"} 对象格式
      if (rawAnswer) {
        try {
          const parsed = typeof rawAnswer === "string" ? JSON.parse(rawAnswer) : rawAnswer;
          formattedAnswer = typeof parsed === "object" && parsed !== null && !Array.isArray(parsed) ? parsed : {};
        } catch {
          formattedAnswer = {};
        }
      } else {
        formattedAnswer = {};
      }
    } else {
      // 其他题型：直接使用字符串
      formattedAnswer = rawAnswer || "";
    }

    submitAnswer({
      session_id: session?.id || "",
      question_id: question?.id || "",
      answer: formattedAnswer,
      time_spent: timeSpent,
      audio_url: answer.audio_url || undefined,
    });
  };

  // 当数据加载完成后，初始化面板状态和题目顺序
  useEffect(() => {
    if (!data || !data.session?.id) return;
    setPanel(getPanelType(data.session, data.report));
    const answers = data.answers || [];
    const initOrder = findLastIndex(answers, (answer) => answer.status !== 0) + 1;
    // 确保 initOrder 在有效范围内
    const safeOrder = Math.max(0, Math.min(initOrder, answers.length - 1));
    setOrder(safeOrder);
    setAnswer(answers[safeOrder]);
  }, [data?.session?.id]);

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
