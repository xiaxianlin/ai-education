/**
 * 报告摘要组件
 */
import { FC } from "react";
import { Card, CardContent } from "@/components/card";
import { Trophy, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { formatDuration } from "@ai-education/shared-web";

interface ReportSummaryProps {
  report: PracticeReport;
  sessionType?: PracticeType;
}

export const ReportSummary: FC<ReportSummaryProps> = ({ report, sessionType }) => {
  const { total_questions, correct_questions, total_time, overall_score, current_ability, ability_level, percentile } =
    report;

  const wrongQuestions = total_questions - correct_questions;
  const accuracy = total_questions > 0 ? Math.round((correct_questions / total_questions) * 100) : 0;

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* 标题 */}
          <div className="text-center">
            <div className="text-5xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold text-foreground">练习报告</h2>
          </div>

          {/* 统计信息网格 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-500/10 rounded-2xl p-4 border-2 border-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700 dark:text-green-300 text-center">
                {correct_questions}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 text-center mt-1">正确题数</div>
            </div>
            <div className="bg-destructive/10 rounded-2xl p-4 border-2 border-destructive/20">
              <XCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
              <div className="text-2xl font-bold text-destructive text-center">{wrongQuestions}</div>
              <div className="text-xs text-destructive/80 text-center mt-1">错误题数</div>
            </div>
            <div className="bg-primary/10 rounded-2xl p-4 border-2 border-primary/20">
              <Trophy className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary text-center">{overall_score.toFixed(1)}</div>
              <div className="text-xs text-primary/80 text-center mt-1">总分</div>
            </div>
            <div className="bg-secondary/10 rounded-2xl p-4 border-2 border-secondary/20">
              <Clock className="h-6 w-6 text-secondary-foreground mx-auto mb-2" />
              <div className="text-lg font-bold text-secondary-foreground text-center">
                {formatDuration(total_time)}
              </div>
              <div className="text-xs text-secondary-foreground/80 text-center mt-1">总用时</div>
            </div>
          </div>

          {/* 正确率 */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border-2 border-green-500/20">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-700 dark:text-green-300 mb-2">{accuracy}%</div>
              <div className="text-lg text-green-600 dark:text-green-400">正确率</div>
            </div>
          </div>

          {/* 能力评估（仅能力评测显示） */}
          {sessionType === "assessment" && current_ability !== undefined && (
            <div className="bg-primary/10 rounded-2xl p-6 border-2 border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">能力评估</h3>
              </div>
              <div className="space-y-2 text-center">
                {ability_level && <div className="text-2xl font-bold text-primary">{ability_level}</div>}
                {current_ability !== undefined && (
                  <div className="text-sm text-muted-foreground">能力值: {current_ability.toFixed(2)}</div>
                )}
                {percentile !== undefined && percentile > 0 && (
                  <div className="text-sm text-muted-foreground">超过 {percentile}% 的同学</div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
