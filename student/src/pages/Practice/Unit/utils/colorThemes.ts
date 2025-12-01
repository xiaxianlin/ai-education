/**
 * 单元卡片颜色主题工具
 * 为每个单元分配不同的按钮颜色
 * 采用与整体 UI 一致的主题色体系（primary / secondary / accent 等），
 * 保持淡雅、简洁、可爱的风格。
 */

export interface ColorTheme {
  button: string; // 按钮颜色
}

// 使用 Tailwind 主题色，避免硬编码 HEX，便于全局主题统一调整
export const colorThemes: ColorTheme[] = [
  { button: "bg-primary hover:bg-primary/90" },
  { button: "bg-primary/90 hover:bg-primary" },
  { button: "bg-accent hover:bg-accent/90 text-accent-foreground" },
  { button: "bg-emerald-500 hover:bg-emerald-600" },
  { button: "bg-sky-500 hover:bg-sky-600" },
  { button: "bg-rose-400 hover:bg-rose-500" },
  { button: "bg-violet-500 hover:bg-violet-600" },
  { button: "bg-amber-400 hover:bg-amber-500" },
  { button: "bg-teal-500 hover:bg-teal-600" },
  { button: "bg-indigo-500 hover:bg-indigo-600" },
  { button: "bg-pink-400 hover:bg-pink-500" },
  { button: "bg-lime-500 hover:bg-lime-600" },
  { button: "bg-cyan-500 hover:bg-cyan-600" },
  { button: "bg-orange-500 hover:bg-orange-600" },
  { button: "bg-fuchsia-500 hover:bg-fuchsia-600" },
  { button: "bg-sky-400 hover:bg-sky-500" },
];

/**
 * 根据索引获取颜色主题
 */
export function getColorTheme(index: number): ColorTheme {
  return colorThemes[index % colorThemes.length];
}

