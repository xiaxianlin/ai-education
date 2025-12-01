/**
 * 单元卡片颜色主题工具
 * 为每个单元分配不同的按钮颜色
 * 淡雅、简单、可爱的配色方案，适合小学生
 */

export interface ColorTheme {
  button: string; // 按钮颜色
}

// 16+ 种淡雅可爱的颜色主题，适合小学生
export const colorThemes: ColorTheme[] = [
  { button: 'bg-[#FF69B4] hover:bg-[#FF1493]' }, // 粉红色
  { button: 'bg-[#FFA07A] hover:bg-[#FF8C69]' }, // 浅鲑鱼色
  { button: 'bg-[#BA55D3] hover:bg-[#9932CC]' }, // 中兰花紫
  { button: 'bg-[#66CDAA] hover:bg-[#48D1CC]' }, // 中绿松石色
  { button: 'bg-[#6495ED] hover:bg-[#4169E1]' }, // 矢车菊蓝
  { button: 'bg-[#FF6B9D] hover:bg-[#FF1493]' }, // 樱花粉
  { button: 'bg-[#FFB347] hover:bg-[#FF9933]' }, // 桃色
  { button: 'bg-[#DA70D6] hover:bg-[#BA55D3]' }, // 兰花紫
  { button: 'bg-[#5FA8D3] hover:bg-[#4682B4]' }, // 钢蓝色
  { button: 'bg-[#FFD700] hover:bg-[#FFC700]' }, // 金黄色
  { button: 'bg-[#FF85C0] hover:bg-[#FF69B4]' }, // 玫瑰粉
  { button: 'bg-[#9370DB] hover:bg-[#8A2BE2]' }, // 中紫色
  { button: 'bg-[#48D1CC] hover:bg-[#00CED1]' }, // 中绿松石
  { button: 'bg-[#F4A460] hover:bg-[#D2691E]' }, // 沙褐色
  { button: 'bg-[#FF7F7F] hover:bg-[#FF6347]' }, // 珊瑚红
  { button: 'bg-[#77DD77] hover:bg-[#90EE90]' }, // 柔和绿
  { button: 'bg-[#CD853F] hover:bg-[#D2691E]' }, // 秘鲁色
  { button: 'bg-[#9966CC] hover:bg-[#8A2BE2]' }, // 紫水晶
  { button: 'bg-[#5FD3BC] hover:bg-[#20B2AA]' }, // 浅海绿
  { button: 'bg-[#FFAA5A] hover:bg-[#FF8C00]' }, // 深橙色
];

/**
 * 根据索引获取颜色主题
 */
export function getColorTheme(index: number): ColorTheme {
  return colorThemes[index % colorThemes.length];
}

