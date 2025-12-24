/**
 * 历史记录卡片组件
 */
import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatDateTime, formatRelativeTime } from "@ai-education/shared-web";
import { Eye, Play } from "lucide-react";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

interface HistoryCardProps {
  practice?: Practice;
  session: PracticeSession;
}

/**
 * 获取状态文本和样式
 */
function getStatusInfo(status: PracticeSessionStatus) {
  switch (status) {
    case 0:
      return { text: "未开始", variant: "outline" as const };
    case 1:
      return { text: "进行中", variant: "secondary" as const };
    case 2:
      return { text: "已完成", variant: "default" as const };
    default:
      return { text: "未知", variant: "outline" as const };
  }
}

export const HistoryCard: FC<HistoryCardProps> = ({ session, practice }) => {
  const navigate = useNavigate();

  const { id, question_count, answer_count, correct_count, status, create_time, start_time, end_time } = session;

  const isCompleted = status === 2;
  const isInProgress = status === 1;
  const accuracy = answer_count > 0 ? Math.round((correct_count / answer_count) * 100) : 0;

  const statusInfo = getStatusInfo(status);
  const timeText = end_time
    ? formatDateTime(end_time)
    : start_time
      ? formatDateTime(start_time)
      : formatRelativeTime(create_time);

  const handleViewDetail = () => {
    navigate(`/practice/detail/${id}`);
  };

  const handleContinue = () => {
    navigate(`/practice/session/${id}`);
  };

  return (
    <div className="relative group bg-white rounded-[2rem] p-6 border-4 border-white shadow-xl shadow-primary/5 h-full flex flex-col bubbly-card transition-all">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-110">
              {practice?.icon || "📝"}
            </span>
            <div className="min-w-0">
              <h3 className="text-lg font-black text-foreground truncate">{practice?.name}</h3>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">
                {timeText}
              </div>
            </div>
          </div>
          <Badge
            variant={statusInfo.variant}
            className={cn(
              "rounded-xl px-3 py-1 font-black text-[10px]",
              isCompleted
                ? "bg-green-100 text-green-600 border-green-200"
                : isInProgress
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {statusInfo.text}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/30 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-foreground">{question_count}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase mt-1">总题数</div>
          </div>
          <div className="bg-primary/5 rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-primary">{accuracy}%</div>
            <div className="text-[10px] font-bold text-primary/60 uppercase mt-1">正确率</div>
          </div>
        </div>

        {/* Progress Bar (if in progress) */}
        {isInProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
              <span>进度</span>
              <span>
                {answer_count} / {question_count}
              </span>
            </div>
            <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(answer_count / question_count) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          onClick={handleViewDetail}
          className="flex-1 rounded-xl font-black text-xs border-2 border-primary/10 hover:bg-primary/5 hover:border-primary/20 transition-all"
        >
          <Eye className="h-4 w-4 mr-2" />
          详情
        </Button>
        {!isCompleted && (
          <Button
            onClick={handleContinue}
            className="flex-1 rounded-xl font-black text-xs shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="h-4 w-4 mr-2" />
            开始
          </Button>
        )}
      </div>
    </div>
  );
};
