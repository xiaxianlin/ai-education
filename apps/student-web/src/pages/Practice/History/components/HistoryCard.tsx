/**
 * 历史记录卡片组件
 */
import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { formatDateTime, formatRelativeTime } from "@/utils/time";
import { Eye, Play } from "lucide-react";

interface HistoryCardProps {
  session: PracticeSession;
}

/**
 * 获取练习类型名称
 */
function getPracticeTypeName(type: PracticeType): string {
  switch (type) {
    case "daily_practice":
      return "每日练习";
    case "unit_practice":
      return "单元练习";
    case "assessment":
      return "能力评测";
    default:
      return "练习";
  }
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

export const HistoryCard: FC<HistoryCardProps> = ({ session }) => {
  const navigate = useNavigate();

  const {
    id,
    session_type,
    question_count,
    answer_count,
    correct_count,
    status,
    create_time,
    start_time,
    end_time,
  } = session;

  const isCompleted = status === 2;
  const isInProgress = status === 1;
  const accuracy =
    answer_count > 0 ? Math.round((correct_count / answer_count) * 100) : 0;

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
    <Card className="border-2 border-border hover:border-primary/40 transition-all shadow-sm h-full flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          {/* 头部信息 */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-base font-semibold text-foreground truncate">
                  {getPracticeTypeName(session_type)}
                </h3>
                <Badge variant={statusInfo.variant} className="text-xs shrink-0">
                  {statusInfo.text}
                </Badge>
              </div>
              {session.textbook && (
                <p className="text-xs text-muted-foreground truncate">
                  {session.textbook.subject} {session.textbook.grade}年级{session.textbook.semester}
                </p>
              )}
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-xl font-bold text-foreground">
                {question_count}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">总题数</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary">
                {answer_count}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">已答题</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {correct_count}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">正确数</div>
            </div>
          </div>

          {/* 正确率 */}
          {answer_count > 0 && (
            <div className="bg-primary/10 rounded-lg p-2 text-center">
              <div className="text-sm font-semibold text-primary">
                正确率: {accuracy}%
              </div>
            </div>
          )}

          {/* 时间信息 */}
          <div className="text-xs text-muted-foreground line-clamp-1">
            {isCompleted && end_time
              ? `完成: ${timeText}`
              : isInProgress && start_time
              ? `开始: ${timeText}`
              : `创建: ${timeText}`}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2 mt-auto">
          <Button
            variant="outline"
            onClick={handleViewDetail}
            className="flex-1 text-xs h-8"
            size="sm"
          >
            <Eye className="h-3 w-3 mr-1" />
            详情
          </Button>
          {!isCompleted && (
            <Button onClick={handleContinue} className="flex-1 text-xs h-8" size="sm">
              <Play className="h-3 w-3 mr-1" />
              继续
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

