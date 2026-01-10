/**
 * 教材单元区域组件
 * 显示某个教材下的所有单元练习卡片
 */
import { UnitPracticeCard } from "../components/UnitPracticeCard";
import { usePageModel } from "../models/page";

export function TextbookUnits() {
  const { units, unitsLoading, unitsError } = usePageModel();

  if (unitsLoading) {
    return <div className="text-center py-8 text-muted-foreground">加载单元中...</div>;
  }

  if (unitsError) {
    return (
      <div className="text-center py-8 text-red-600">
        <p className="text-lg font-semibold">加载失败</p>
        <p className="text-sm mt-2">{unitsError.message || "请稍后重试"}</p>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">暂无匹配的教材</p>
        <p className="text-sm mt-2">请先设置您的年级、学科和学期</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {units.map((unit) => (
        <UnitPracticeCard key={unit.id} unit={unit} />
      ))}
    </div>
  );
}
