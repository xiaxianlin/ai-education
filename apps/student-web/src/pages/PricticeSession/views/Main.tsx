/**
 * 练习会话主视图
 * 根据会话状态选择渲染哪个视图
 */
import { LoadingPage } from "@/components/biz";
import { usePageModel } from "../models/page";
import { PanelType } from "../types";
import { EmptyView } from "./EmptyView";
import { ProcessingView } from "./ProcessingView";
import { ProcessingViewV2 } from "./ProcessingViewV2";
import { ReadyView } from "./ReadyView";
import { ResultView } from "./ResultView";
import { SettlementView } from "./SettlementView";

export function MainView() {
  const { panel } = usePageModel();

  switch (panel) {
    case PanelType.LOADING:
      return <LoadingPage />;
    case PanelType.EMPTY:
      return <EmptyView />;
    case PanelType.READY:
      return <ReadyView />;
    case PanelType.PROCESSING: {
      const { question } = usePageModel();
      const isV2 = (question as any)?.interactionType || (question as any)?.version === "v2";
      return isV2 ? <ProcessingViewV2 /> : <ProcessingView />;
    }
    case PanelType.SETTLEMENT:
      return <SettlementView />;
    case PanelType.RESULT:
      return <ResultView />;
    default:
      return null;
  }
}
