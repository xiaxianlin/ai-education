/**
 * 教材单元区域组件
 * 显示某个教材下的所有单元练习卡片
 */
import { studentApi } from "@/common/api";
import { useRequest } from "ahooks";
import { PracticeCard } from "./PracticeCard";

interface TextbookUnitsSectionProps {
  textbook: Textbook;
}

export function TextbookUnits({ textbook }: TextbookUnitsSectionProps) {
  const { data: units = [], loading } = useRequest(() => studentApi.getTextbookUnits(textbook.id), {
    refreshDeps: [textbook.id],
  });

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">加载单元中...</div>;
  }

  if (units.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">该教材暂无单元</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {units.map((unit) => (
        <PracticeCard key={unit.id} unit={unit} textbook={textbook} />
      ))}
    </div>
  );
}
