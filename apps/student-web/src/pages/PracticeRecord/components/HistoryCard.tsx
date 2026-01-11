/**
 * 历史记录卡片组件
 */
import { Badge, Button } from "@/components/ui";
import { getPracticeIcon } from "@/lib/practice";
import { formatRelativeTime } from "@ai-education/shared-web";
import { Eye, Play } from "lucide-react";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

/**
 * 根据状态映射获取正确率文本的 className
 */
function getAccuracyTextClassName(params: {
  isCompleted: boolean;
}): string {
  const base = "text-lg font-bold";
  const classes: string[] = [base];
  
  if (params.isCompleted) {
    classes.push("text-primary");
  } else {
    classes.push("text-foreground");
  }
  
  return classes.join(" ");
}

/**
 * 根据状态映射获取 Badge 的 className
 */
function getBadgeClassName(params: {
  statusClassName: string;
}): string {
  const base = "rounded-lg px-2.5 py-1 text-xs font-semibold";
  return `${base} ${params.statusClassName}`;
}

interface HistoryCardProps {
  session: Practice;
}

/**
 * 获取状态信息
 */
function getStatusInfo(status: PracticeStatus) {
  switch (status) {
    case 0:
      return { text: "未开始", className: "bg-muted text-muted-foreground" };
    case 1:
      return { text: "进行中", className: "bg-amber-100 text-amber-600" };
    case 2:
      return { text: "已完成", className: "bg-green-100 text-green-600" };
    default:
      return { text: "未知", className: "bg-muted text-muted-foreground" };
  }
}

export const HistoryCard: FC<HistoryCardProps> = ({ session }) => {
  const navigate = useNavigate();

  const { id, question_count, answer_count, correct_count, status, create_time } = session;

  const isCompleted = status === 2;
  const isInProgress = status === 1;
  const accuracy = answer_count > 0 ? Math.round((correct_count / answer_count) * 100) : 0;
  const statusInfo = getStatusInfo(status);

  const handleViewDetail = () => navigate(`/practice/result/${id}`);
  const handleContinue = () => navigate(`/practice/${id}`);

  // 获取能力名称或单元名称
  const practiceTagName = session.practice_type === "ability_practice" 
    ? session.ability_name || "能力练习"
    : session.unit_name || "单元练习";

  return (
    <div className="group bg-white rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            {getPracticeIcon(session.practice_type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs font-semibold">
                {practiceTagName}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">{formatRelativeTime(create_time)}</div>
          </div>
        </div>
        <Badge className={getBadgeClassName({
          statusClassName: statusInfo.className,
        })}>
          {statusInfo.text}
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 py-3 px-4 bg-secondary/30 rounded-xl mb-4">
        <div className="flex-1 text-center">
          <div className="text-lg font-bold text-foreground">{question_count}</div>
          <div className="text-[10px] text-muted-foreground font-medium">题目数</div>
        </div>
        <div className="w-px h-8 bg-border/50" />
        <div className="flex-1 text-center">
          <div className="text-lg font-bold text-foreground">{answer_count}</div>
          <div className="text-[10px] text-muted-foreground font-medium">已作答</div>
        </div>
        <div className="w-px h-8 bg-border/50" />
        <div className="flex-1 text-center">
          <div className={getAccuracyTextClassName({
            isCompleted,
          })}>
            {isCompleted ? `${accuracy}%` : "-"}
          </div>
          <div className="text-[10px] text-muted-foreground font-medium">正确率</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewDetail}
          disabled={!isCompleted}
          className="flex-1 rounded-lg text-xs font-semibold border-border/50 hover:bg-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          查看详情
        </Button>
        {!isCompleted && (
          <Button size="sm" onClick={handleContinue} className="flex-1 rounded-lg text-xs font-semibold">
            <Play className="h-3.5 w-3.5 mr-1.5" />
            {isInProgress ? "继续练习" : "开始练习"}
          </Button>
        )}
      </div>
    </div>
  );
};
