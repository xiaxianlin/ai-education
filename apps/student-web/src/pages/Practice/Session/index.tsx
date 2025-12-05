/**
 * 通用练习会话页面
 * 根据 session_id 进行答题，支持所有类型的练习
 * 入口仅负责选择渲染哪个视图
 */
import { BackButton } from "./components/common/BackButton";
import { LoadingView } from "./views/LoadingView";
import { StartPanel } from "./views/StartPanel";
import { EmptySession } from "./views/EmptySession";
import { ResultView } from "./views/ResultView";
import { QuestionStep } from "./views/QuestionStep";
import { useSessionLoader } from "./hooks/useSessionLoader";
import { useSessionStore, useCurrentQuestion } from "./stores/session-store";

export default function PracticeSession() {
  // 加载会话
  useSessionLoader();

  const loading = useSessionStore((state) => state.loading);
  const session = useSessionStore((state) => state.session);
  const report = useSessionStore((state) => state.report);
  const currentQuestion = useCurrentQuestion();

  if (loading) {
    return <LoadingView />;
  }

  if (report) {
    return <ResultView />;
  }

  if (!session || !currentQuestion) {
    return <EmptySession />;
  }

  if (session.status === 0) {
    return <StartPanel />;
  }

  const practiceTypeName =
    session.session_type === "daily_practice"
      ? "每日练习"
      : session.session_type === "unit_practice"
      ? "单元练习"
      : session.session_type === "assessment"
      ? "能力评测"
      : "练习";

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="space-y-6">
      <BackButton onClick={handleBack} label={`返回${practiceTypeName}`} />
      <QuestionStep />
    </div>
  );
}
