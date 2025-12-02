/**
 * 结果视图 - 包裹 ResultModal
 * 直接从 store 中获取报告和会话类型
 */
import { memo } from "react";
import { ResultModal } from "./ResultModal";
import { useSessionStore } from "../stores/session-store";

export const ResultView = memo(() => {
  const report = useSessionStore((state) => state.report);
  const sessionType = useSessionStore(
    (state) => state.session?.session_type
  ) as PracticeSessionType | undefined;

  if (!report) return null;

  return <ResultModal report={report} sessionType={sessionType} />;
});

ResultView.displayName = "ResultView";
