/**
 * 等待生成状态的练习卡片
 */
import { Button } from "@/components/ui";
import { useBoolean } from "ahooks";
import { Lightbulb, Loader2, Sparkles } from "lucide-react";
import { usePageModel } from "../models/page";
import { PracticeCardProps } from "../types";
import { ConfirmModal } from "./ConfirmModal";

interface WaitCardProps extends PracticeCardProps {
  createPractice?: () => void;
  creating?: boolean;
  canCreate?: boolean;
}

export function WaitCard({ unit, textbook, createPractice, creating = false, canCreate = true }: WaitCardProps) {
  const { setUnit } = usePageModel();
  const [visible, { setTrue, setFalse }] = useBoolean(false);

  const handleCreate = () => {
    if (createPractice) {
      createPractice();
    } else {
      setTrue();
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all">
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="text-3xl">✨</div>
            <h3 className="text-xl font-bold text-foreground truncate">{unit.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {unit.content || "本单元包含多个重点知识点，快来挑战吧！"}
          </p>

          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUnit(unit)}
              className="flex-1 h-11 rounded-xl text-xs font-bold border-2 border-primary/5 hover:bg-primary/5 transition-all"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              知识点
            </Button>
            <Button
              size="sm"
              disabled={creating || !canCreate}
              onClick={handleCreate}
              className="flex-1 h-11 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 shadow-sm transition-all"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  创建中
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" fill="currentColor" />
                  开始挑战
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      {!createPractice && (
        <ConfirmModal
          unit={unit}
          loading={creating}
          visible={visible}
          onCancel={setFalse}
          onConfirm={() => {
            // 如果没有传入 createPractice，这里需要从 model 获取
            // 但为了保持一致性，建议总是传入 createPractice
            setFalse();
          }}
        />
      )}
    </>
  );
}
