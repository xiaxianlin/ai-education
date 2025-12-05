import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getColorTheme } from "../utils/colorThemes";
import { BookOpen, Loader2 } from "lucide-react";

interface GeneratingCardProps {
  unit: Unit;
}

export const GeneratingCard = ({ unit }: GeneratingCardProps) => {
  const theme = getColorTheme(unit.id);
  return (
    <Card className="relative overflow-hidden border-2 border-border transition-all hover:border-primary/40 hover:shadow-lg hover:bg-primary/5 rounded-2xl bg-card">
      <CardContent className="relative z-10 p-5 flex flex-col h-full">
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
            <p className="text-sm leading-relaxed text-muted-foreground">
              AI 正在为你精心准备练习题目，请稍候片刻～
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium text-primary">正在生成练习</span>
        </div>
      </CardContent>
    </Card>
  );
};
