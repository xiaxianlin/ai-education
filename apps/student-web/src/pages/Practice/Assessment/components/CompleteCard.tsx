/**
 * 已完成状态的评估卡片
 */
import { Button } from "@/components/ui";
import { Loader2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePageModel } from "../models/page";
import { PracticeCardProps } from "../types";

export function CompleteCard({ practice, textbook, shouldCreate }: PracticeCardProps & { shouldCreate: boolean }) {
  const navigate = useNavigate();
  const { loading, createPractice } = usePageModel();
  const { id, answer_count = 0, correct_count = 0 } = practice || {};

  return (
    <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all">
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎉</div>
            <h3 className="text-xl font-bold text-foreground">{textbook.semester}</h3>
          </div>
          <div className="px-3 py-1 bg-green-100 rounded-lg text-[10px] font-black text-green-600 uppercase tracking-wider">
            已完成
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">综合评估已完成，快来看看你的学习成果吧！</p>
          <div className="p-3 bg-secondary/30 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">正确率</span>
            <span className="text-xs font-black text-foreground">
              {Math.round((correct_count / answer_count) * 100)}% ({correct_count}/{answer_count})
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            onClick={() => navigate(`/practice/result/${id}`)}
            className="w-full h-12 rounded-xl font-bold shadow-sm transition-all text-sm bg-primary hover:bg-primary/90"
          >
            <Play className="h-4 w-4 mr-2" fill="currentColor" />
            查看结果
          </Button>
          {shouldCreate && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => createPractice(textbook.id)}
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold transition-all text-sm border-2 border-primary/10 hover:bg-primary/5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" fill="currentColor" />
                  重新创建评估
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
