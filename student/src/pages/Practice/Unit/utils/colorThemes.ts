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
  { 
    bg: 'from-primary/5 to-primary/10', 
    border: 'border-primary/20', 
    icon: 'text-primary', 
    button: 'bg-primary hover:bg-primary/90', 
    shadow: 'shadow-primary/10' 
  },
  { 
    bg: 'from-secondary/5 to-secondary/10', 
    border: 'border-secondary-foreground/20', 
    icon: 'text-secondary-foreground', 
    button: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground', 
    shadow: 'shadow-secondary/10' 
  },
  { 
    bg: 'from-accent/5 to-accent/10', 
    border: 'border-accent/30', 
    icon: 'text-accent', 
    button: 'bg-accent hover:bg-accent/90 text-accent-foreground', 
    shadow: 'shadow-accent/10' 
  },
  { 
    bg: 'from-destructive/5 to-destructive/10', 
    border: 'border-destructive/50', 
    icon: 'text-destructive', 
    button: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground', 
    shadow: 'shadow-destructive/10' 
  },
  { 
    bg: 'from-primary/5 to-accent/5', 
    border: 'border-primary/30', 
    icon: 'text-primary', 
    button: 'bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground', 
    shadow: 'shadow-primary/10' 
  },
  { 
    bg: 'from-secondary/5 to-destructive/5', 
    border: 'border-secondary-foreground/20', 
    icon: 'text-secondary-foreground', 
    button: 'bg-gradient-to-r from-secondary to-destructive hover:opacity-90 text-white', 
    shadow: 'shadow-secondary/10' 
  },
];

/**
 * 根据索引获取颜色主题
 */
export function getColorTheme(index: number): ColorTheme {
  return colorThemes[index % colorThemes.length];
}

