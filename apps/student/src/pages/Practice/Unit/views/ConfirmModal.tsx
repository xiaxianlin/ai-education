import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getColorTheme } from "../utils/colorThemes";
import { cn } from "@/lib/utils";
import { useUnitPracticeStore } from "../stores/unit-practice-store";

export const ConfirmModal = () => {
  const { confirmModal, closeConfirmModal, createPractice } =
    useUnitPracticeStore();
  const { open, unitId, unitName, textbookId } = confirmModal;
  const theme = getColorTheme(unitId);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden border border-border">
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">开始练习</h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground rounded-full w-9 h-9"
              onClick={closeConfirmModal}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="px-6 py-6 space-y-4">
          <div className="text-center space-y-3">
            <div className="text-5xl mb-2">📚</div>
            <p className="text-base text-foreground">
              将为 <span className="font-bold text-primary">{unitName}</span>{" "}
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
            onClick={closeConfirmModal}
            className="flex-1 h-12 text-base rounded-xl"
          >
            取消
          </Button>
          <Button
            onClick={() => createPractice(textbookId, unitId)}
            className={cn(
              "flex-1 h-12 text-base font-semibold rounded-xl text-white",
              theme.button
            )}
          >
            开始 🚀
          </Button>
        </div>
      </div>
    </div>
  );
};
