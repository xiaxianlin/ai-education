/**
 * 等待生成状态的练习卡片
 */
import { Button } from "@/components/ui";
import { useBoolean } from "ahooks";
import { Lightbulb, Loader2, Sparkles } from "lucide-react";
import { usePageModel } from "../models/page";
import { useUnitPracticeModel } from "../models/unit_practice";
import { PracticeCardProps } from "../types";
import { ConfirmModal } from "./ConfirmModal";

export function WaitCard({ unit }: PracticeCardProps) {
  const { setUnit } = usePageModel();
  const { creating, createPractice } = useUnitPracticeModel();
  const [visible, { setTrue, setFalse }] = useBoolean(false);

  return (
    <>
      <div className="relative overflow-hidden bg-card rounded-3xl shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all min-h-[280px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative p-8 flex flex-col h-full">
          {/* 内容区域 */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center justify-center gap-2">
              <div className="text-4xl">✨</div>
              <h3 className="text-2xl font-bold text-foreground">{unit.name}</h3>
            </div>
            <p className="text-base text-muted-foreground text-center">
              {unit.content || "本单元包含多个重点知识点，快来挑战吧！"}
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setUnit(unit)}
              className="flex-1 h-14 rounded-2xl text-base font-semibold transition-all"
            >
              <Lightbulb className="h-5 w-5 mr-2" />
              查看知识点
            </Button>
            <Button
              size="lg"
              disabled={creating}
              onClick={setTrue}
              className="flex-1 h-14 rounded-2xl text-base font-semibold transition-all text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl"
            >
              {creating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" fill="currentColor" />
                  创建练习
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      <ConfirmModal
        unit={unit}
        loading={creating}
        visible={visible}
        onCancel={setFalse}
        onConfirm={() => createPractice(unit.id)}
      />
    </>
  );
}

