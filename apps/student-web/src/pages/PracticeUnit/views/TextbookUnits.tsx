/**
 * 教材单元区域组件
 * 显示某个教材下的所有单元练习卡片
 */
import { UnitPracticeCard } from "../components/UnitPracticeCard";
import { useUnitPracticeModel } from "../models/unit_practice";

export function TextbookUnits() {
  const { loading, units } = useUnitPracticeModel();

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">加载单元中...</div>;
  }

  if (units.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">该教材暂无单元</div>;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {units.map((unit) => (
        <UnitPracticeCard key={unit.id} unit={unit} />
      ))}
    </div>
  );
}
