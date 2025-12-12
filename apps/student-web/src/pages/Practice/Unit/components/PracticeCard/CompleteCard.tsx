import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Lightbulb, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePageModel } from "../../models/PageModel";

interface CompleteCardProps {
  unit: Unit;
  practice: PracticeSession;
  onCreate: () => void;
}

export const CompleteCard = ({ unit, practice, onCreate }: CompleteCardProps) => {
  const navigate = useNavigate();
  const { openKnowledgeModal } = usePageModel();

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg rounded-2xl bg-card">
      <CardContent className="relative z-10 p-5 flex flex-col h-full">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2.5 rounded-xl shadow-sm flex-shrink-0 bg-secondary text-secondary-foreground">
            <BookOpen className="h-8 w-8" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="text-xl font-bold text-foreground leading-tight">{unit.name}</h3>
            <p className="text-sm text-muted-foreground font-medium">🎉 本单元练习已完成，查看报告或重新生成新练习。</p>
            <p className="text-sm text-muted-foreground font-medium">
              ✨ 已完成 {practice.answer_count}/{practice.question_count} 题 · 正确 {practice.correct_count} 题
            </p>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all bg-accent/50 text-accent-foreground border-transparent"
            onClick={() => openKnowledgeModal(unit)}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            查看知识点
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all"
            onClick={onCreate}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            生成练习
          </Button>

          <Button
            size="sm"
            onClick={() => navigate(`/practice/session/${practice.id}`)}
            className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all text-white shadow-sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            查看报告
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
