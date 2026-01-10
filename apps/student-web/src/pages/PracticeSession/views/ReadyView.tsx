/**
 * 开始练习面板
 * 直接从 store 读取数据并派发动作
 * 根据年级展示不同风格的开始界面，并展示当前步骤提示
 */
import { useProfileModel } from "@/common/models/ProfileModel";
import { memo } from "react";
import { LowerGradeReadyPanel } from "../components/LowerGradeReadyPanel";
import { UpperGradeReadyPanel } from "../components/UpperGradeReadyPanel";
import { usePracticeSessionModel } from "../models/page";

export const ReadyView = memo(() => {
  const { profile } = useProfileModel();
  const { title, questions, begin } = usePracticeSessionModel();

  // 调试日志
  console.log("[ReadyView] State:", {
    title,
    questionsCount: questions?.length,
    profileGrade: profile?.grade,
    hasBegin: !!begin,
  });

  const isLowerGrade = (profile?.grade || 3) < 2;
  
  // 确保有数据再渲染
  if (!questions || questions.length === 0) {
    console.warn("[ReadyView] No questions available");
    return (
      <div className="bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-screen">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="w-full max-w-2xl mx-auto space-y-6 animate-springy">
        {/* 根据年级切换不同风格面板 */}
        {isLowerGrade ? (
          <LowerGradeReadyPanel title={title || ""} total={questions.length} onBegin={begin} />
        ) : (
          <UpperGradeReadyPanel title={title || ""} total={questions.length} onBegin={begin} />
        )}
      </div>
    </div>
  );
});
