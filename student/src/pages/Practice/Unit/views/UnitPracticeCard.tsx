/**
 * 单元练习卡片
 * 参考 Daily/views/PracticeCard.tsx 结构
 */
import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Play, Loader2, Lightbulb, X } from "lucide-react";
import { useRequest } from "ahooks";
import { practiceService } from "@/services/practice";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getColorTheme } from "../utils/colorThemes";

interface UnitPracticeCardProps {
  unit: Unit;
  textbook: Textbook;
  practice?: PracticeSession;
  onShowKnowledge: (unit: Unit) => void;
}

export const UnitPracticeCard = memo(function UnitPracticeCard({
  unit,
  textbook,
  practice,
  onShowKnowledge,
}: UnitPracticeCardProps) {
  const navigate = useNavigate();
  const theme = getColorTheme(unit.id);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { loading, run: createPractice } = useRequest(
    () => practiceService.createPractice("unit_practice", textbook.id, unit.id),
    { manual: true }
  );

  const handleStartPractice = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmStart = async () => {
    setShowConfirmModal(false);
    await createPractice();
  };

  const generating = loading || practice?.generate_status === 0;
  const isCompleted = practice?.status === 2;
  const isInProgress = practice?.status === 1 && !isCompleted; // 进行中但未完成

  // 无练习状态：显示创建按钮
  if (!practice) {
    return (
      <>
        <Card className="relative overflow-hidden border-2 border-border transition-all duration-300 hover:shadow-lg hover:bg-muted/30 rounded-2xl bg-card">
          <CardContent className="relative z-10 p-5 flex flex-col h-full">
            {/* 单元标题 */}
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2.5 rounded-xl bg-muted/40 shadow-sm flex-shrink-0">
                <BookOpen className="h-8 w-8 text-foreground/70" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <h3 className="text-xl font-bold text-foreground leading-tight">
                  {unit.name}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                  {unit.content || "本单元包含多个重点知识点，快来挑战吧！"}
                </p>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="pt-4 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all bg-muted/60 hover:bg-muted hover:text-foreground border-transparent"
                onClick={() => onShowKnowledge(unit)}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                查看知识点
              </Button>

              <Button
                onClick={handleStartPractice}
                className={cn(
                  "flex-1 h-11 rounded-xl text-sm font-semibold transition-all text-white shadow-sm",
                  theme.button
                )}
              >
                <Play className="h-5 w-5 mr-2" fill="currentColor" />
                开始练习
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 确认弹窗 */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="relative w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden border border-border">
              <div className="px-6 py-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">
                    开始练习
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground rounded-full w-9 h-9"
                    onClick={() => setShowConfirmModal(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div className="text-center space-y-3">
                  <div className="text-5xl mb-2">📚</div>
                  <p className="text-base text-foreground">
                    将为{" "}
                    <span className="font-bold text-primary">{unit.name}</span>{" "}
                    生成练习题目
                  </p>
                  <p className="text-sm text-muted-foreground">
                    AI 会根据你的学习情况自动调整题目难度
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border bg-muted/20 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 h-12 text-base rounded-xl"
                >
                  取消
                </Button>
                <Button
                  onClick={handleConfirmStart}
                  disabled={loading}
                  className={cn(
                    "flex-1 h-12 text-base font-semibold rounded-xl text-white",
                    theme.button
                  )}
                >
                  {loading ? "准备中..." : "开始 🚀"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 生成中状态
  if (generating) {
    return (
      <Card className="relative overflow-hidden border-2 border-border transition-all hover:shadow-lg hover:bg-muted/30 rounded-2xl bg-card">
        <CardContent className="relative z-10 p-5 flex flex-col h-full">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2.5 rounded-xl bg-muted/40 shadow-sm flex-shrink-0">
              <BookOpen className="h-8 w-8 text-foreground/70" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="text-xl font-bold text-foreground leading-tight">
                {unit.name}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                AI 正在为你精心准备练习题目，请稍候片刻～
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-primary">
              正在生成练习
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 已完成或进行中状态
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:bg-muted/30 rounded-2xl bg-card",
        isInProgress
          ? "border-primary shadow-lg ring-2 ring-primary/20"
          : "border-border"
      )}
    >
      <CardContent className="relative z-10 p-5 flex flex-col h-full ">
        {/* 继续练习标识 */}
        {isInProgress && (
          <div className="absolute top-3 right-3 z-20">
            <div className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg flex items-center gap-1 animate-pulse">
              <span>⏸️</span>
              <span>继续练习</span>
            </div>
          </div>
        )}

        {/* 单元标题 */}
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2.5 rounded-xl bg-muted/40 shadow-sm flex-shrink-0">
            <BookOpen className="h-8 w-8 text-foreground/70" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="text-xl font-bold text-foreground leading-tight">
              {unit.name}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              ✨ 已完成 {practice.answer_count}/{practice.question_count} 题 ·
              正确 {practice.correct_count} 题
            </p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="pt-4 flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all bg-muted/60 hover:bg-muted hover:text-foreground border-transparent"
            onClick={() => onShowKnowledge(unit)}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            查看知识点
          </Button>

          <Button
            onClick={() => navigate(`/practice/session/${practice.id}`)}
            className={cn(
              "flex-1 h-11 rounded-xl text-sm font-semibold transition-all text-white shadow-sm",
              theme.button
            )}
          >
            <Play className="h-5 w-5 mr-2" fill="currentColor" />
            {isCompleted ? "查看结果" : "继续练习"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
