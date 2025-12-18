import { theme as antdTheme } from 'antd';
import type { ThemeConfig } from 'antd';
import type { ResolvedThemeMode } from './useThemeMode';
import { getAppShadcnVars } from './shadcnThemes';
import { normalizeColorToCss } from './color';

function getBorderRadiusPx(radius: string): number | undefined {
  // shadcn gives e.g. "0.625rem"
  const m = /^([0-9.]+)\s*rem$/i.exec(radius.trim());
  if (!m) return undefined;
  const rem = Number(m[1]);
  if (!Number.isFinite(rem)) return undefined;
  // default 1rem = 16px
  return rem * 16;
}

export function getAntdTheme(mode: ResolvedThemeMode): ThemeConfig {
  const { theme, colors } = getAppShadcnVars(mode);

  const token = {
    colorPrimary: normalizeColorToCss(colors.primary),
    colorBgBase: normalizeColorToCss(colors.background),
    colorBgLayout: normalizeColorToCss(colors.background),
    colorBgContainer: normalizeColorToCss(colors.card),
    colorBgElevated: normalizeColorToCss(colors.popover),
    colorTextBase: normalizeColorToCss(colors.foreground),
    colorBorder: normalizeColorToCss(colors.border),
    colorError: normalizeColorToCss(colors.destructive),
    borderRadius: getBorderRadiusPx(theme.radius),
    fontFamily: theme['font-sans'],
    fontFamilyCode: theme['font-mono'],
  } as const;

  return {
    algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token,
    // Keep component overrides light; use token mapping as primary driver.
    // ProLayout will pick up many tokens through AntD context.
    components: {
      Layout: {
        // Helps ProLayout header/sider feel aligned with our shadcn vars
        // Header: surface (card) to stand out from layout background
        headerBg: normalizeColorToCss(colors.card),
        siderBg: normalizeColorToCss(colors.sidebar),
        bodyBg: normalizeColorToCss(colors.background),
      },
      Menu: {
        itemBg: normalizeColorToCss(colors.sidebar),
        subMenuItemBg: normalizeColorToCss(colors.sidebar),
        itemColor: normalizeColorToCss(colors['sidebar-foreground']),
        itemSelectedColor: normalizeColorToCss(colors['sidebar-primary-foreground']),
        itemSelectedBg: normalizeColorToCss(colors['sidebar-primary']),
        itemHoverColor: normalizeColorToCss(colors['sidebar-primary']),
        activeBarBorderWidth: 0,
      },
      Card: {
        colorBgContainer: normalizeColorToCss(colors.card),
      },
      Drawer: {
        colorBgElevated: normalizeColorToCss(colors.card),
      },
    },
  };
}


