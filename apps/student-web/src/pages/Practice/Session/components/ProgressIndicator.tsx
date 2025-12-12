/**
 * 进度指示器组件 - 显示上一题 x/x 下一题
 */
import { Button } from "@/components/ui/button";
import { usePageModel } from "../models/PageModel";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProgressIndicator() {
  const { questions, step, canPrev, prev, next, isLast } = usePageModel();

  if (!questions?.length) return null;

  const total = questions.length;
  const current = step + 1;
  const canNext = !isLast;

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={prev}
        disabled={!canPrev}
        className="rounded-xl border-2 hover:bg-muted/50 transition-all"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        上一题
      </Button>
      
      <div className="text-base font-semibold text-foreground">
        <span className="text-primary">{current}</span> / {total}
      </div>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={next}
        disabled={!canNext}
        className="rounded-xl border-2 hover:bg-muted/50 transition-all"
      >
        下一题
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
