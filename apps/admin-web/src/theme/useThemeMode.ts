import { useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'admin-web:theme-mode';

function readStoredMode(): ThemeMode {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    // ignore
  }
  return 'system';
}

function writeStoredMode(mode: ThemeMode) {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // ignore
  }
}

function resolveSystemMode(): ResolvedThemeMode {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useThemeMode() {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    return readStoredMode();
  });

  const [systemMode, setSystemMode] = useState<ResolvedThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    return resolveSystemMode();
  });

  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mql) return;

    const onChange = () => setSystemMode(resolveSystemMode());

    // Safari compatibility
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (mql.addEventListener) mql.addEventListener('change', onChange);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    else mql.addListener(onChange);

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (mql.removeEventListener) mql.removeEventListener('change', onChange);
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      else mql.removeListener(onChange);
    };
  }, []);

  const resolvedMode = useMemo<ResolvedThemeMode>(() => {
    return mode === 'system' ? systemMode : mode;
  }, [mode, systemMode]);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    if (typeof window !== 'undefined') writeStoredMode(next);
  };

  const toggle = () => {
    const next: ThemeMode = resolvedMode === 'dark' ? 'light' : 'dark';
    setMode(next);
  };

  return { mode, resolvedMode, setMode, toggle };
}
