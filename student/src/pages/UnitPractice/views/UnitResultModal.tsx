import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Award,
  Clock,
  CheckCircle2,
  TrendingUp,
  Star,
  Sparkles,
  Home,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KnowledgeScore {
  rate: number;
  correct: number;
  total: number;
}

interface UnitPracticeReport {
  correct_questions: number;
  total_questions: number;
  score: number;
  total_time: number;
  unit_name: string;
  knowledge_scores: Record<string, KnowledgeScore>;
}

interface UnitResultModalProps {
  report: UnitPracticeReport;
}

export function UnitResultModal({ report }: UnitResultModalProps) {
  const navigate = useNavigate();

  const accuracy = (report.correct_questions / report.total_questions) * 100;

  // 根据成绩显示不同的鼓励语
  const getEncouragementText = () => {
    if (accuracy >= 90) return "太棒了！你掌握得非常好！";
    if (accuracy >= 80) return "很不错！继续保持！";
    if (accuracy >= 70) return "做得不错！继续加油！";
    if (accuracy >= 60) return "还需要加强练习哦！";
    return "不要气馁，多练习一定会进步的！";
  };

  // 根据成绩显示不同的图标颜色
  const getScoreGradient = () => {
    if (accuracy >= 90) return "from-yellow-400 to-orange-400";
    if (accuracy >= 80) return "from-green-400 to-emerald-400";
    if (accuracy >= 70) return "from-blue-400 to-cyan-400";
    if (accuracy >= 60) return "from-purple-400 to-pink-400";
    return "from-gray-400 to-slate-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-5">
        {/* 完成标题 - 居中排版 */}
        <Card className="border-2 border-pink-300 shadow-lg bg-gradient-to-r from-yellow-100 via-pink-100 to-purple-100 animate-in fade-in zoom-in duration-500">
          <CardContent className="py-4 px-6">
            <div className="flex items-center justify-center gap-4">
              <div
                className={cn(
                  "flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full shadow-lg",
                  "bg-gradient-to-br",
                  getScoreGradient(),
                  "animate-in zoom-in duration-700 delay-150"
                )}
              >
                <Trophy className="h-8 w-8 text-white drop-shadow-md" />
              </div>
              <div className="text-center">
                <div className="relative inline-block">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    练习完成！
                  </h1>
                  {accuracy >= 90 && (
                    <div className="absolute -top-1 -right-7 animate-bounce">
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-semibold text-purple-700 mt-1">
                  {report.unit_name}
                </p>
                <p className="text-sm text-pink-600 font-medium mt-0.5">
                  {getEncouragementText()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 成绩卡片 - 增强视觉效果 */}
        <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-white to-blue-50/30 animate-in slide-in-from-bottom duration-500 delay-200">
          <CardContent className="pt-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center transform transition-transform hover:scale-105 duration-200">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-2">
                  <Star className="h-7 w-7 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-1">
                  {report.score.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600 font-medium">得分</div>
              </div>
              <div className="text-center transform transition-transform hover:scale-105 duration-200">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-2">
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                </div>
                <div className="text-4xl font-bold text-green-600 mb-1">
                  {report.correct_questions}
                  <span className="text-2xl text-gray-400">
                    /{report.total_questions}
                  </span>
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  正确题数
                </div>
              </div>
              <div className="text-center transform transition-transform hover:scale-105 duration-200">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 mb-2">
                  <TrendingUp className="h-7 w-7 text-purple-600" />
                </div>
                <div className="text-4xl font-bold text-purple-600 mb-1">
                  {accuracy.toFixed(0)}
                  <span className="text-2xl">%</span>
                </div>
                <div className="text-sm text-gray-600 font-medium">正确率</div>
              </div>
              <div className="text-center transform transition-transform hover:scale-105 duration-200">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 mb-2">
                  <Clock className="h-7 w-7 text-orange-600" />
                </div>
                <div className="text-4xl font-bold text-orange-600 mb-1">
                  {Math.floor(report.total_time / 60)}:
                  {(report.total_time % 60).toString().padStart(2, "0")}
                </div>
                <div className="text-sm text-gray-600 font-medium">用时</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 知识点掌握情况 - 卡片式展示 */}
        <div className="animate-in slide-in-from-bottom duration-500 delay-300">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-400">
              <Award className="h-6 w-6 text-white" />
            </div>
            知识点掌握情况
          </h2>
          {Object.keys(report.knowledge_scores).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(report.knowledge_scores).map(
                ([knowledge, score], index) => (
                  <Card
                    key={knowledge}
                    className={cn(
                      "border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
                      score.rate >= 0.8
                        ? "border-green-300 bg-gradient-to-br from-green-50 to-emerald-50"
                        : score.rate >= 0.6
                        ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50"
                        : "border-red-300 bg-gradient-to-br from-red-50 to-rose-50"
                    )}
                    style={{
                      animation: `slideIn 0.5s ease-out ${
                        0.4 + index * 0.1
                      }s backwards`,
                    }}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="text-center space-y-3">
                        {/* 知识点名称 */}
                        <h3 className="font-bold text-base text-gray-800 min-h-[2.5rem] flex items-center justify-center">
                          {knowledge}
                        </h3>

                        {/* 正确率 */}
                        <div
                          className={cn(
                            "text-4xl font-bold",
                            score.rate >= 0.8
                              ? "text-green-600"
                              : score.rate >= 0.6
                              ? "text-yellow-600"
                              : "text-red-600"
                          )}
                        >
                          {(score.rate * 100).toFixed(0)}%
                        </div>

                        {/* 统计信息 */}
                        <div
                          className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold",
                            score.rate >= 0.8
                              ? "bg-green-100 text-green-700"
                              : score.rate >= 0.6
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>
                            {score.correct}/{score.total} 题
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          ) : (
            <Card className="shadow-lg">
              <CardContent className="py-12">
                <div className="text-center text-gray-500">暂无知识点数据</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 操作按钮 - 可爱大方 */}
        <div className="flex gap-4 animate-in slide-in-from-bottom duration-500 delay-400">
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/unit-practice" })}
            className="flex-1 h-14 text-lg font-bold border-3 rounded-2xl bg-gradient-to-br from-white to-purple-50 border-purple-300 text-purple-700 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300"
          >
            <Home className="h-5 w-5 mr-2" />
            返回单元列表
          </Button>
          <Button
            onClick={() => navigate({ to: "/practice-history" })}
            className="flex-1 h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300"
          >
            <History className="h-5 w-5 mr-2" />
            查看练习历史
          </Button>
        </div>
      </div>

      {/* 添加关键帧动画 */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
