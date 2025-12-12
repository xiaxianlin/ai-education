import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Lightbulb, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageModel } from "../../models/PageModel";

interface WaitCardProps {
  unit: Unit;
  onCreate: (unit: Unit) => void;
}

export const WaitCard = ({ unit, onCreate }: WaitCardProps) => {
  const { openKnowledgeModal } = usePageModel();

  return (
    <Card className="relative overflow-hidden border-2 border-border transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:bg-primary/5 rounded-2xl bg-card">
      <CardContent className="relative z-10 p-5 flex flex-col h-full">
        {/* 单元标题 */}
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2.5 rounded-xl shadow-sm flex-shrink-0 bg-secondary text-secondary-foreground">
            <BookOpen className="h-8 w-8" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <h3 className="text-xl font-bold text-foreground leading-tight">{unit.name}</h3>
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
            className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all bg-accent/50 text-accent-foreground border-transparent"
            onClick={() => openKnowledgeModal(unit)}
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            查看知识点
          </Button>

          <Button
            onClick={() => onCreate(unit)}
            className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all text-white shadow-sm"
          >
            <Play className="h-5 w-5 mr-2" fill="currentColor" />
            开始练习
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
