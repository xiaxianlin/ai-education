/**
 * 单元卡片颜色主题工具
 * 为每个单元分配不同的颜色主题
 */

export interface ColorTheme {
  bg: string;
  border: string;
  icon: string;
  button: string;
  shadow: string;
}

export const colorThemes: ColorTheme[] = [
  { bg: 'from-blue-50/80 to-cyan-50/80', border: 'border-blue-100', icon: 'text-blue-400', button: 'bg-blue-400 hover:bg-blue-500', shadow: 'shadow-blue-50' },
  { bg: 'from-pink-50/80 to-rose-50/80', border: 'border-pink-100', icon: 'text-pink-400', button: 'bg-pink-400 hover:bg-pink-500', shadow: 'shadow-pink-50' },
  { bg: 'from-green-50/80 to-emerald-50/80', border: 'border-green-100', icon: 'text-green-400', button: 'bg-green-400 hover:bg-green-500', shadow: 'shadow-green-50' },
  { bg: 'from-yellow-50/80 to-amber-50/80', border: 'border-yellow-100', icon: 'text-yellow-400', button: 'bg-yellow-400 hover:bg-yellow-500', shadow: 'shadow-yellow-50' },
  { bg: 'from-purple-50/80 to-violet-50/80', border: 'border-purple-100', icon: 'text-purple-400', button: 'bg-purple-400 hover:bg-purple-500', shadow: 'shadow-purple-50' },
  { bg: 'from-orange-50/80 to-red-50/80', border: 'border-orange-100', icon: 'text-orange-400', button: 'bg-orange-400 hover:bg-orange-500', shadow: 'shadow-orange-50' },
];

/**
 * 根据索引获取颜色主题
 */
export function getColorTheme(index: number): ColorTheme {
  return colorThemes[index % colorThemes.length];
}

