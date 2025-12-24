/**
 * 已完成状态的练习卡片
 */
import { Button } from "@/components/ui";
import { useBoolean } from "ahooks";
import { FileText, Lightbulb, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePageModel } from "../models/page";
import { useUnitPracticeModel } from "../models/unit_practice";
import { PracticeCardProps } from "../types";
import { ConfirmModal } from "./ConfirmModal";

export function CompleteCard({ practice, unit }: PracticeCardProps) {
  const navigate = useNavigate();
  const { setUnit } = usePageModel();
  const { creating, createPractice } = useUnitPracticeModel();
  const [visible, { setTrue, setFalse }] = useBoolean(false);
  const { id, question_count, answer_count, correct_count } = practice || {};

  return (
    <>
      <div className="relative overflow-hidden bg-card rounded-3xl shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all min-h-[280px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative p-8 flex flex-col h-full">
          {/* 内容区域 */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex items-center justify-center gap-2">
              <div className="text-4xl">🎉</div>
              <h3 className="text-2xl font-bold text-foreground">{unit.name}</h3>
            </div>

            <div className="text-center space-y-2">
              <p className="text-base text-muted-foreground">本单元练习已完成，查看报告或重新生成新练习。</p>
              <p className="text-base text-muted-foreground font-medium">
                ✨ 已完成 {answer_count}/{question_count} 题 · 正确 {correct_count} 题
              </p>
            </div>
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
              variant="outline"
              onClick={setTrue}
              className="flex-1 h-14 rounded-2xl text-base font-semibold transition-all"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              创建练习
            </Button>
            <Button
              size="lg"
              onClick={() => navigate(`/practice/session/${id}`)}
              className="flex-1 h-14 rounded-2xl text-base font-semibold transition-all text-primary-foreground bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl"
            >
              <FileText className="h-5 w-5 mr-2" />
              查看报告
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

