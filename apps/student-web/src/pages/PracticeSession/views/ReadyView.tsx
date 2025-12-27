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
  const { student } = useProfileModel();
  const { title, questions, begin } = usePracticeSessionModel();

  const isLowerGrade = (student?.grade || 3) < 2;

  return (
    <div className="bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div
        className="w-full max-w-2xl mx-auto space-y-6"
        style={{
          animation: "fadeIn 0.5s ease-out 0.1s forwards, slideUp 0.5s ease-out 0.1s forwards",
          opacity: 0,
        }}
      >
        {/* 根据年级切换不同风格面板 */}
        {isLowerGrade ? (
          <LowerGradeReadyPanel title={title} total={questions.length} onBegin={begin} />
        ) : (
          <UpperGradeReadyPanel title={title} total={questions.length} onBegin={begin} />
        )}
      </div>
    </div>
  );
});
