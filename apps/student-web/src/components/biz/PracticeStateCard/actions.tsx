/**
 * 练习卡片 Actions 组件
 * 四个状态的按钮组件
 */
import { Button } from "@/components/ui";
import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { FileText, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * 生成中状态按钮
 */
export function GeneratingAction({ sessionId }: { sessionId?: string }) {
  const pollCountRef = useRef(0);

  const { data: progressData } = useRequest(
    () => (sessionId ? studentApi.getPracticeProgress(sessionId) : Promise.resolve(null)),
    {
      ready: !!sessionId,
      pollingInterval: 2000,
      onSuccess: () => {
        pollCountRef.current += 1;
      },
    }
  );

  const progress = progressData?.progress ?? Math.min(pollCountRef.current * 5, 90);

  return (
    <Button disabled className="w-full h-11 rounded-xl font-medium">
      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
      创建中 ({progress}%)...
    </Button>
  );
}

/**
 * 已完成状态按钮
 */
export function CompletedAction({
  practiceId,
  creating,
  onCreatePractice,
}: {
  practiceId: string;
  creating: boolean;
  onCreatePractice: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        onClick={onCreatePractice}
        disabled={creating}
        className="flex-1 h-11 rounded-xl font-medium"
      >
        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1.5" />}
        重新创建
      </Button>
      <Button onClick={() => navigate(`/practice/result/${practiceId}`)} className="flex-1 h-11 rounded-xl font-medium">
        <FileText className="h-4 w-4 mr-1.5" />
        查看报告
      </Button>
    </div>
  );
}

/**
 * 练习中/已就绪状态按钮
 */
export function PracticingAction({ practiceId }: { practiceId: string }) {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate(`/practice/${practiceId}`)} className="w-full h-11 rounded-xl font-medium">
      开始练习
    </Button>
  );
}

/**
 * 等待创建状态按钮
 */
export function WaitingAction({
  creating,
  onCreatePractice,
}: {
  creating: boolean;
  onCreatePractice: () => void;
}) {
  return (
    <Button onClick={onCreatePractice} disabled={creating} className="w-full h-11 rounded-xl font-medium">
      {creating ? (
        <>
          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          创建中...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-1.5" />
          创建练习
        </>
      )}
    </Button>
  );
}
