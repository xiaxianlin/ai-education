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
  const { id, answer_count = 0, correct_count = 0 } = practice || {};

  return (
    <>
      <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all">
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎉</div>
              <h3 className="text-xl font-bold text-foreground truncate">{unit.name}</h3>
            </div>
            <div className="px-3 py-1 bg-green-100 rounded-lg text-[10px] font-black text-green-600 uppercase tracking-wider">
              已完成
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">本单元练习已完成，快来看看你的学习成果吧！</p>
            <div className="p-3 bg-secondary/30 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">正确率</span>
              <span className="text-xs font-black text-foreground">
                {answer_count > 0 ? Math.round((correct_count / answer_count) * 100) : 0}% ({correct_count}/
                {answer_count})
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              size="sm"
              onClick={() => navigate(`/practice/result/${id}`)}
              className="w-full h-11 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 shadow-sm transition-all"
            >
              <FileText className="h-4 w-4 mr-2" />
              查看报告
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUnit(unit)}
                className="flex-1 h-11 rounded-xl text-xs font-bold border-2 border-primary/5 hover:bg-primary/5 transition-all text-muted-foreground"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                知识点
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={setTrue}
                className="flex-1 h-11 rounded-xl text-xs font-bold border-2 border-primary/5 hover:bg-primary/5 transition-all text-muted-foreground"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                重新挑战
              </Button>
            </div>
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
