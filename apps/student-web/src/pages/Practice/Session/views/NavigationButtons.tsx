import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Send, Trophy } from "lucide-react";

interface NavigationButtonsProps {
  canGoPrevious: boolean;
  hasAnswered: boolean;
  hasAnswer: boolean;
  submitting: boolean;
  isLastQuestion: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onComplete: () => void;
}

export const NavigationButtons = memo(function NavigationButtons({
  canGoPrevious,
  hasAnswered,
  hasAnswer,
  submitting,
  isLastQuestion,
  onPrevious,
  onNext,
  onSubmit,
  onComplete,
}: NavigationButtonsProps) {
  return (
    <div className="flex gap-4 pt-6 border-t-2 border-input">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="flex-1 h-16 text-lg font-bold rounded-2xl border-2"
      >
        <ChevronLeft className="h-6 w-6 mr-2" />
        上一题
      </Button>
      {!hasAnswered ? (
        <Button
          onClick={onSubmit}
          disabled={!hasAnswer || submitting}
          className="flex-1 h-16 text-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-2xl shadow-lg"
        >
          <Send className="h-6 w-6 mr-2" />
          {submitting ? "提交中..." : "提交答案 ✓"}
        </Button>
      ) : isLastQuestion ? (
        <Button
          onClick={onComplete}
          disabled={submitting}
          className="flex-1 h-16 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-2xl shadow-lg"
        >
          <Trophy className="h-6 w-6 mr-2" />
          {submitting ? "完成中..." : "完成练习 🎉"}
        </Button>
      ) : (
        <Button
          onClick={onNext}
          className="flex-1 h-16 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-2xl shadow-lg"
        >
          下一题
          <ChevronRight className="h-6 w-6 ml-2" />
        </Button>
      )}
    </div>
  );
});
