/**
 * 练习会话页面级状态管理
 * 使用 unstated-next 管理练习会话的所有状态和业务逻辑
 */
import { useEffect, useMemo, useState } from "react";
import { useCounter, useRequest } from "ahooks";
import { useParams } from "react-router-dom";
import { createContainer } from "unstated-next";
import { studentApi } from "@/lib/api";
import { PanelType } from "../types";
import { getPanelType, getPracticeTypeName } from "../utils";

function useContainer() {
  const param = useParams<{ sessionId: string }>();
  const sessionId = Number(param.sessionId);

  const [panel, setPanel] = useState<PanelType>(PanelType.LOADING);
  const [step, { inc: next, dec: prev, set: setStep }] = useCounter(0);
  const [answer, setAnswer] = useState<AnswerRequest>();

  const { data, error, refresh } = useRequest(() => studentApi.getSessionDetail(sessionId), {
    ready: !!sessionId,
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
  });
  const { run: submitAnswer } = useRequest(() => studentApi.submitAnswer(answer!), {
    ready: !!answer,
    manual: true,
  });

  const title = useMemo(() => {
    return getPracticeTypeName(session?.session_type);
  }, [session?.session_type]);

  // 初始化面板类型
  useEffect(() => {
    if (!session) return;
    setPanel(getPanelType(session, report));
  }, [session, report]);

  return {
    panel,
    title,
    session,
    report,
    answers,
    questions,
    step,
    next,
    prev,
    setStep,
    begin,
    complete,
    submitAnswer,
  };
}

export const PageModel = createContainer(useContainer);
export const usePageModel = PageModel.useContainer;
