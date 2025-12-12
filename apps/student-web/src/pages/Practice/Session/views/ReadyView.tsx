/**
 * 开始练习面板
 * 直接从 store 读取数据并派发动作
 * 根据年级展示不同风格的开始界面，并展示当前步骤提示
 */
import { memo } from "react";
import { useProfileModel } from "@/models/ProfileModel";
import { usePageModel } from "../models/PageModel";
import { LowerGradePanel } from "../components/ready/LowerGradePanel";
import { UpperGradePanel } from "../components/ready/UpperGradePanel";

export const ReadyView = memo(() => {
  const { student } = useProfileModel();
  const { title, questions, begin } = usePageModel();

  const isLowerGrade = (student?.grade || 3) < 2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50">
      {/* 根据年级切换不同风格面板 */}
      {isLowerGrade ? (
        <LowerGradePanel title={title} total={questions.length} onBegin={begin} />
      ) : (
        <UpperGradePanel title={title} total={questions.length} onBegin={begin} />
      )}
    </div>
  );
});
