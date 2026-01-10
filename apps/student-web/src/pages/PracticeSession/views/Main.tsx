/**
 * 练习会话主视图
 * 根据会话状态选择渲染哪个视图
 */
import { LoadingPage } from "@/components/biz";
import { useEffect } from "react";
import { usePracticeSessionModel } from "../models/page";
import { PanelType } from "../types";
import { EmptyView } from "./EmptyView";
import { ProcessingView } from "./ProcessingView";
import { ReadyView } from "./ReadyView";
import { ResultView } from "./ResultView";
import { SettlementView } from "./SettlementView";

export function MainView() {
  const { panel, session, questions, answers } = usePracticeSessionModel();

  // 调试日志
  useEffect(() => {
    console.log("[PracticeSession] State:", {
      panel,
      sessionId: session?.id,
      sessionStatus: session?.status,
      generateStatus: session?.generate_status,
      questionsCount: questions?.length,
      answersCount: answers?.length,
    });
  }, [panel, session, questions, answers]);

  switch (panel) {
    case PanelType.LOADING:
      return <LoadingPage />;
    case PanelType.EMPTY:
      return <EmptyView />;
    case PanelType.READY:
      return <ReadyView />;
    case PanelType.PROCESSING:
      return <ProcessingView />;
    case PanelType.SETTLEMENT:
      return <SettlementView />;
    case PanelType.RESULT:
      return <ResultView />;
    default:
      // 如果 panel 值不在预期范围内，显示加载状态而不是返回 null
      console.warn(`Unknown panel type: ${panel}, falling back to loading state`);
      return <LoadingPage />;
  }
}
