/**
 * 练习结果页面级状态管理
 */
import { studentApi } from "@/lib/api";
import { parseReport, hasAIReportContent } from "@ai-education/shared-web";
import type { ParsedReport } from "@ai-education/shared-web";
import { useRequest } from "ahooks";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createContainer } from "unstated-next";
import { getStatusInfo } from "../utils";

export type { ParsedReport };

function useContainer() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  // API 请求
  const {
    data: detail,
    loading,
    error,
  } = useRequest(() => studentApi.getPracticeSessionData(sessionId || ""), {
    ready: !!sessionId,
    refreshDeps: [sessionId],
  });

  // 派生状态：解析后的报告（Model 层完成 JSON 解析）
  const report = useMemo(() => parseReport(detail?.report), [detail?.report]);

  // 派生状态：答案映射
  const answerMap = useMemo(() => {
    if (!detail?.answers) {
      return new Map<string, PracticeAnswer>();
    }
    const map = new Map<string, PracticeAnswer>();
    detail.answers.forEach((answer) => {
      map.set(answer.question_id, answer);
    });
    return map;
  }, [detail?.answers]);

  // 派生状态：会话状态信息
  const statusInfo = useMemo(() => {
    if (!detail?.session) {
      return { text: "未知", variant: "outline" as const };
    }
    return getStatusInfo(detail.session.status);
  }, [detail?.session?.status]);

  // 派生状态：是否已完成
  const isCompleted = useMemo(() => {
    return detail?.session?.status === 2;
  }, [detail?.session?.status]);

  // 派生状态：是否进行中
  const isInProgress = useMemo(() => {
    return detail?.session?.status === 1;
  }, [detail?.session?.status]);

  // 派生状态：AI 报告是否可用
  const hasAIReport = useMemo(() => hasAIReportContent(report), [report]);

  // 导航处理函数
  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    if (detail?.session?.id) {
      navigate(`/practice/session/${detail.session.id}`);
    }
  };

  return {
    detail,
    report,
    loading,
    error,
    answerMap,
    statusInfo,
    isCompleted,
    isInProgress,
    hasAIReport,
    handleBack,
    handleContinue,
  };
}

export const PracticeResultModel = createContainer(useContainer);
export const usePracticeResultModel = PracticeResultModel.useContainer;
