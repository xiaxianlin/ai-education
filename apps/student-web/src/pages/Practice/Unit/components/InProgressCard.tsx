import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getColorTheme } from "../utils/colorThemes";
import { BookOpen, Lightbulb, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface InProgressCardProps {
  unit: Unit;
  practice: PracticeSession;
  onShowKnowledge: (unit: Unit) => void;
}
export const InProgressCard = ({
  unit,
  practice,
  onShowKnowledge,
}: InProgressCardProps) => {
  const navigate = useNavigate();
  const theme = getColorTheme(unit.id);

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:bg-primary/5 rounded-2xl bg-card",
        "border-primary shadow-lg ring-2 ring-primary/20 bg-primary/5"
      )}
    >
      <CardContent className="relative z-10 p-5 flex flex-col h-full">
        {/* 单元标题 */}
        <div className="flex items-start gap-3 flex-1">
          <div
            className={cn(
              "p-2.5 rounded-xl shadow-sm flex-shrink-0",
              theme.button
            )}
          >
            <BookOpen className="h-8 w-8" />
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
            {practice.status === 2 ? "查看结果" : "继续练习"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
