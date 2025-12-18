import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { App, ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';
import { useThemeMode, type ResolvedThemeMode, type ThemeMode } from './useThemeMode';
import { getAntdTheme } from './antdTheme';
import { AntdAppBridge } from '@/lib/AntdAppBridge';
import { getAppShadcnVars } from './shadcnThemes';

type ThemeContextValue = {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within AppThemeProvider');
  return ctx;
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode, resolvedMode, setMode, toggle } = useThemeMode();

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedMode);

    // Keep CSS variables (used by global.less / tailwind utilities) aligned with
    // the same source of truth as AntD tokens.
    const { theme, colors } = getAppShadcnVars(resolvedMode);
    const vars: Record<string, string> = {
      ...colors,
      ...theme,
    };
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [resolvedMode]);

  const theme = useMemo<ThemeConfig>(() => {
    return getAntdTheme(resolvedMode);
  }, [resolvedMode]);

  const value = useMemo<ThemeContextValue>(() => {
    return { mode, resolvedMode, setMode, toggle };
  }, [mode, resolvedMode]);

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={theme}>
        <App>
          <AntdAppBridge />
          {children}
        </App>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}
