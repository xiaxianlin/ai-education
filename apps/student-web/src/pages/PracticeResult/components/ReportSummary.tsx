/**
 * 报告摘要组件
 */
import { Card, CardContent } from "@/components/ui";
import { formatDuration } from "@ai-education/shared-web";
import { CheckCircle, Clock, TrendingUp, Trophy, XCircle } from "lucide-react";
import { FC } from "react";

interface ReportSummaryProps {
  report: PracticeReport;
  slug?: string;
}

/**
 * 环形进度条组件
 */
const RadialProgress: FC<{ percentage: number; size?: number; strokeWidth?: number }> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* 背景圆环 */}
        <circle
          className="text-muted/20"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* 进度圆环 */}
        <circle
          className="text-primary transition-all duration-1000 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-3xl font-black text-foreground">{percentage}%</span>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">正确率</span>
      </div>
    </div>
  );
};

export const ReportSummary: FC<ReportSummaryProps> = ({ report, slug }) => {
  const { total_questions, correct_questions, total_time, overall_score, current_ability, ability_level, percentile } =
    report;

  const wrongQuestions = total_questions - correct_questions;
  const accuracy = total_questions > 0 ? Math.round((correct_questions / total_questions) * 100) : 0;

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden bubbly-card">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-8">
            {/* 核心分数：环形进度条 */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 opacity-20 animate-pulse" />
              <RadialProgress percentage={accuracy} />
            </div>

            {/* 详细统计网格 */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-green-50 rounded-2xl p-4 border border-green-100 flex flex-col items-center justify-center group transition-colors hover:bg-green-100/50">
                <div className="p-2 bg-green-500 rounded-lg mb-2 shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div className="text-xl font-black text-green-700 leading-none">{correct_questions}</div>
                <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">正确</div>
              </div>

              <div className="bg-red-50 rounded-2xl p-4 border border-red-100 flex flex-col items-center justify-center group transition-colors hover:bg-red-100/50">
                <div className="p-2 bg-red-500 rounded-lg mb-2 shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                  <XCircle className="h-5 w-5 text-white" />
                </div>
                <div className="text-xl font-black text-red-700 leading-none">{wrongQuestions}</div>
                <div className="text-[10px] font-bold text-red-600 uppercase tracking-widest mt-1">错误</div>
              </div>

              <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex flex-col items-center justify-center group transition-colors hover:bg-primary/10">
                <div className="p-2 bg-primary rounded-lg mb-2 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div className="text-xl font-black text-primary leading-none">{overall_score.toFixed(1)}</div>
                <div className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mt-1">总评分</div>
              </div>

              <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 flex flex-col items-center justify-center group transition-colors hover:bg-orange-100/50">
                <div className="p-2 bg-orange-500 rounded-lg mb-2 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div className="text-xl font-black text-orange-700 leading-none">{formatDuration(total_time)}</div>
                <div className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-1">用时</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 综合评估（仅能力评测显示） */}
      {slug === "assessment" && current_ability !== undefined && (
        <Card className="border-none shadow-xl bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-md bubbly-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/20 rounded-xl">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-black text-foreground uppercase tracking-tight">综合评估</h3>
            </div>

            <div className="space-y-6 text-center">
              {ability_level && (
                <div className="inline-block px-4 py-2 bg-primary text-white text-xl font-black rounded-2xl shadow-xl shadow-primary/20">
                  {ability_level}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-primary/10 pt-6">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">能力值</div>
                  <div className="text-lg font-black text-foreground">{current_ability.toFixed(2)}</div>
                </div>
                {percentile !== undefined && percentile > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      击败学员
                    </div>
                    <div className="text-lg font-black text-primary">{percentile}%</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
