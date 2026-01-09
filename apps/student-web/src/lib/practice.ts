/**
 * 练习相关的辅助函数
 * 根据后端返回的 practice_type 生成前端显示所需的信息
 */

/**
 * 根据 practice_type 获取显示名称
 */
export function getPracticeName(practiceType: string): string {
  const map: Record<string, string> = {
    ability_practice: "能力练习",
    unit_practice: "单元练习",
  };
  return map[practiceType] || practiceType;
}

/**
 * 根据 practice_type 获取路径
 */
export function getPracticePath(practiceType: string): string {
  const map: Record<string, string> = {
    ability_practice: "/practice/ability",
    unit_practice: "/practice/unit",
  };
  return map[practiceType] || "/practice";
}

/**
 * 根据 practice_type 获取图标
 */
export function getPracticeIcon(practiceType: string): string {
  const map: Record<string, string> = {
    ability_practice: "🎯",
    unit_practice: "📚",
  };
  return map[practiceType] || "📝";
}
