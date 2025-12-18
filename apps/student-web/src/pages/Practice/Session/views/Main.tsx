/**
 * 练习会话主视图
 * 根据会话状态选择渲染哪个视图
 */
import { ReadyView } from "./ReadyView";
import { EmptyView } from "./EmptyView";
import { ResultView } from "./ResultView";
import { SettlementView } from "./SettlementView";
import { ProcessingView } from "./ProcessingView";
import { usePageModel } from "../models/PageModel";
import { LoadingPage } from "@/components/business";
import { PanelType } from "../types";

export function MainView() {
  const { panel } = usePageModel();

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
      return null;
  }
}
