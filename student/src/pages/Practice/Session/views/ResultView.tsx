/**
 * 结果面板 - 展示练习结果
 * 参考单元练习卡片风格设计
 */
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  History,
} from "lucide-react";
import { useSessionStore } from "../stores/session-store";

export const ResultView = memo(() => {
  const navigate = useNavigate();
  const report = useSessionStore((state) => state.report);
  const sessionType = useSessionStore(
    (state) => state.session?.session_type
  ) as PracticeSessionType | undefined;

  if (!report) return null;

  const getBackPath = () => {
    switch (sessionType) {
      case "daily_practice":
        return "/home";
      case "unit_practice":
        return "/unit-practice";
      case "assessment":
        return "/home";
      default:
        return "/home";
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}分${secs}秒` : `${minutes}分钟`;
  };

  const totalQuestions = report.total_questions || 0;
  const correctQuestions = report.correct_questions || 0;
  const score = report.overall_score || 0;
  const totalTime = report.total_time || 0;
  const accuracy =
    totalQuestions > 0
      ? Math.round((correctQuestions / totalQuestions) * 100)
      : 0;

  // 根据正确率获取评价
  const getGrade = () => {
    if (accuracy >= 90) return { emoji: "🌟", text: "太棒了！", color: "text-yellow-500" };
    if (accuracy >= 70) return { emoji: "👍", text: "做得不错！", color: "text-primary" };
    if (accuracy >= 50) return { emoji: "💪", text: "继续加油！", color: "text-accent" };
    return { emoji: "🙌", text: "再接再厉！", color: "text-muted-foreground" };
  };

  const grade = getGrade();

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="relative overflow-hidden border-2 border-primary transition-all duration-300 shadow-lg ring-2 ring-primary/20 bg-primary/5 rounded-2xl max-w-md w-full">
        <CardContent className="relative z-10 p-6">
          {/* 标题区 */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Trophy className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">练习完成！</h2>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                <span className={grade.color}>
                  {grade.emoji} {grade.text}
                </span>
              </p>
            </div>
          </div>

          {/* 核心数据 - 正确率 */}
          <div className="bg-card rounded-xl p-4 mb-4 border border-border">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-1">
                {accuracy}%
              </div>
              <div className="text-sm text-muted-foreground">正确率</div>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-card rounded-xl p-3 border border-border flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <div>
                <div className="text-lg font-bold text-foreground">
                  {correctQuestions}
                </div>
                <div className="text-xs text-muted-foreground">正确</div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border flex items-center gap-3">
              <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div>
                <div className="text-lg font-bold text-foreground">
                  {totalQuestions - correctQuestions}
                </div>
                <div className="text-xs text-muted-foreground">错误</div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border flex items-center gap-3">
              <Trophy className="h-5 w-5 text-accent flex-shrink-0" />
              <div>
                <div className="text-lg font-bold text-foreground">
                  {score.toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">得分</div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-3 border border-border flex items-center gap-3">
              <Clock className="h-5 w-5 text-secondary-foreground flex-shrink-0" />
              <div>
                <div className="text-lg font-bold text-foreground">
                  {formatTime(totalTime)}
                </div>
                <div className="text-xs text-muted-foreground">用时</div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all bg-muted/60 hover:bg-muted hover:text-foreground border-transparent"
              onClick={() => navigate(getBackPath())}
            >
              <Home className="h-4 w-4 mr-2" />
              返回
            </Button>
            <Button
              onClick={() => navigate("/history")}
              className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all text-white shadow-sm bg-primary hover:bg-primary/90"
            >
              <History className="h-4 w-4 mr-2" />
              历史记录
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ResultView.displayName = "ResultView";
