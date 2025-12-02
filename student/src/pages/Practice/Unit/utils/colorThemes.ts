/**
 * 单元卡片颜色主题工具
 *
 * 适配效果图的三种主要色系：
 * 1. 蓝色系 (School, Numbers) -> Primary (主色)
 * 2. 橙色系 (Face, Colours) -> Accent (强调色)
 * 3. 米色/柔和系 (Animals, Fruit) -> Secondary (辅助色)
 *
 * 同时也支持“开始练习”(Solid) 和 “继续练习”(Outline) 的样式变体。
 */

export interface ColorTheme {
  type: "primary" | "accent" | "secondary";
  // 图标背景容器
  iconBg: string;
  iconColor: string;
  // 默认按钮 (实心 - 开始练习)
  button: string;
  // 描边按钮 (空心 - 继续练习)
  buttonOutline: string;
  // 卡片激活时的边框色
  activeBorder: string;
}

export const colorThemes: ColorTheme[] = [
  // 1. Primary Theme (蓝色系/主色)
  // 对应效果图: Unit 1 School, Unit 4 Numbers
  {
    type: "primary",
    iconBg: "bg-primary",
    iconColor: "text-primary-foreground",
    button: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    buttonOutline:
      "bg-background border-2 border-primary text-primary hover:bg-primary/5",
    activeBorder: "border-primary ring-1 ring-primary",
  },

  // 2. Accent Theme (橙色系/强调色)
  // 对应效果图: Unit 2 Face, Unit 5 Colours
  {
    type: "accent",
    iconBg: "bg-accent",
    iconColor: "text-accent-foreground",
    button: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm",
    buttonOutline:
      "bg-background border-2 border-accent text-accent hover:bg-accent/5",
    activeBorder: "border-accent ring-1 ring-accent",
  },

  // 3. Secondary Theme (米色系/柔和色)
  // 对应效果图: Unit 3 Animals, Unit 6 Fruit
  // 特点：背景色浅，文字色深
  {
    type: "secondary",
    iconBg: "bg-secondary border border-muted/20", // 增加微弱边框防止在白底上看不清
    iconColor: "text-secondary-foreground",
    button:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent shadow-sm",
    buttonOutline:
      "bg-background border-2 border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary/10",
    activeBorder:
      "border-secondary-foreground/30 ring-1 ring-secondary-foreground/30",
  },
];

/**
 * 根据索引获取颜色主题
 */
export function getColorTheme(index: number): ColorTheme {
  return colorThemes[index % colorThemes.length];
}
