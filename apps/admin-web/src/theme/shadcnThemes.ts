export type ShadcnThemeVars = {
  'font-sans': string;
  'font-mono': string;
  'font-serif': string;
  radius: string;
};

export type ShadcnColorVars = {
  background: string;
  foreground: string;
  card: string;
  'card-foreground': string;
  popover: string;
  'popover-foreground': string;
  primary: string;
  'primary-foreground': string;
  secondary: string;
  'secondary-foreground': string;
  muted: string;
  'muted-foreground': string;
  accent: string;
  'accent-foreground': string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  'chart-1': string;
  'chart-2': string;
  'chart-3': string;
  'chart-4': string;
  'chart-5': string;
  sidebar: string;
  'sidebar-foreground': string;
  'sidebar-primary': string;
  'sidebar-primary-foreground': string;
  'sidebar-accent': string;
  'sidebar-accent-foreground': string;
  'sidebar-border': string;
  'sidebar-ring': string;
};

export type ShadcnThemeRegistryStyle = {
  name: string;
  cssVars: {
    theme: ShadcnThemeVars;
    light: ShadcnColorVars & Partial<ShadcnThemeVars>;
    dark: ShadcnColorVars & Partial<ShadcnThemeVars>;
  };
};

// From: https://shadcnthemer.com/r/themes/0fbee39d-34cc-4ab1-ab7d-5ca89a465d62.json
export const TANGIBLE: ShadcnThemeRegistryStyle = {
  name: 'Tangible',
  cssVars: {
    theme: {
      'font-sans':
        "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
      'font-mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      'font-serif': 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      radius: '0.625rem',
    },
    light: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.145 0 0)',
      card: 'oklch(1 0 0)',
      'card-foreground': 'oklch(0.145 0 0)',
      popover: 'oklch(1 0 0)',
      'popover-foreground': 'oklch(0.145 0 0)',
      primary: 'oklch(0.205 0 0)',
      'primary-foreground': 'oklch(0.985 0 0)',
      secondary: 'oklch(0.97 0 0)',
      'secondary-foreground': 'oklch(0.205 0 0)',
      muted: 'oklch(0.97 0 0)',
      'muted-foreground': 'oklch(0.556 0 0)',
      accent: 'oklch(0.97 0 0)',
      'accent-foreground': 'oklch(0.205 0 0)',
      destructive: 'oklch(0.577 0.245 27.325)',
      border: 'oklch(0.922 0 0)',
      input: 'oklch(0.922 0 0)',
      ring: 'oklch(0.708 0 0)',
      'chart-1': 'oklch(0.646 0.222 41.116)',
      'chart-2': 'oklch(0.6 0.118 184.704)',
      'chart-3': 'oklch(0.398 0.07 227.392)',
      'chart-4': 'oklch(0.828 0.189 84.429)',
      'chart-5': 'oklch(0.769 0.188 70.08)',
      sidebar: 'oklch(0.985 0 0)',
      'sidebar-foreground': 'oklch(0.145 0 0)',
      'sidebar-primary': 'oklch(0.205 0 0)',
      'sidebar-primary-foreground': 'oklch(0.985 0 0)',
      'sidebar-accent': 'oklch(0.97 0 0)',
      'sidebar-accent-foreground': 'oklch(0.205 0 0)',
      'sidebar-border': 'oklch(0.922 0 0)',
      'sidebar-ring': 'oklch(0.708 0 0)',
      radius: '0.625rem',
      'font-sans':
        "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
      'font-serif': 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      'font-mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    dark: {
      background: 'oklch(0.882 0.001 0)',
      foreground: 'oklch(0.252 0.001 0)',
      card: 'oklch(0.864 0.001 0)',
      'card-foreground': 'oklch(0.191 0.001 0)',
      popover: 'oklch(0.916 0.001 0)',
      'popover-foreground': 'oklch(0.293 0.001 0)',
      primary: 'oklch(0.723 0.19 50.544)',
      'primary-foreground': 'oklch(1 0.001 0)',
      secondary: 'oklch(0.383 0.089 118.267)',
      'secondary-foreground': 'oklch(0.985 0 0)',
      muted: 'oklch(0.269 0 0)',
      'muted-foreground': 'oklch(0.708 0 0)',
      accent: 'oklch(0.371 0 0)',
      'accent-foreground': 'oklch(0.985 0 0)',
      destructive: 'oklch(0.704 0.191 22.216)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.556 0 0)',
      'chart-1': 'oklch(0.488 0.243 264.376)',
      'chart-2': 'oklch(0.696 0.17 162.48)',
      'chart-3': 'oklch(0.769 0.188 70.08)',
      'chart-4': 'oklch(0.627 0.265 303.9)',
      'chart-5': 'oklch(0.645 0.246 16.439)',
      sidebar: 'oklch(0.205 0 0)',
      'sidebar-foreground': 'oklch(0.985 0 0)',
      'sidebar-primary': 'oklch(0.488 0.243 264.376)',
      'sidebar-primary-foreground': 'oklch(0.985 0 0)',
      'sidebar-accent': 'oklch(0.269 0 0)',
      'sidebar-accent-foreground': 'oklch(0.985 0 0)',
      'sidebar-border': 'oklch(1 0 0 / 10%)',
      'sidebar-ring': 'oklch(0.439 0 0)',
      radius: '0.625rem',
      'font-sans':
        "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
      'font-serif': 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      'font-mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
  },
};

// From: https://shadcnthemer.com/r/themes/7375c185-ffca-4333-bae6-3fff46bcf575.json
export const SUNRIZE_TWEAKCN: ShadcnThemeRegistryStyle = {
  name: 'Sunrize (tweakcn)',
  cssVars: {
    theme: {
      'font-sans':
        "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
      'font-mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      'font-serif': 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      radius: '0.625rem',
    },
    light: {
      background: 'oklch(1.0000 0 0)',
      foreground: 'oklch(0.2101 0.0318 264.6645)',
      card: 'oklch(1.0000 0 0)',
      'card-foreground': 'oklch(0.2101 0.0318 264.6645)',
      popover: 'oklch(1.0000 0 0)',
      'popover-foreground': 'oklch(0.2101 0.0318 264.6645)',
      primary: 'oklch(0.665 0.151 52.278)',
      'primary-foreground': 'oklch(1.0000 0 0)',
      secondary: 'oklch(0.562 0.064 192.72)',
      'secondary-foreground': 'oklch(1.0000 0 0)',
      muted: 'oklch(0.9670 0.0029 264.5419)',
      'muted-foreground': 'oklch(0.5510 0.0234 264.3637)',
      accent: 'oklch(0.9491 0 0)',
      'accent-foreground': 'oklch(0.2101 0.0318 264.6645)',
      destructive: 'oklch(0.581 0.222 27.81)',
      border: 'oklch(0.9276 0.0058 264.5313)',
      input: 'oklch(0.9276 0.0058 264.5313)',
      ring: 'oklch(0.6716 0.1368 48.5130)',
      'chart-1': 'oklch(0.671 0.076 207.843)',
      'chart-2': 'oklch(0.703 0.149 48.293)',
      'chart-3': 'oklch(0.833 0.111 83.442)',
      'chart-4': 'oklch(0.69 0.095 132.379)',
      'chart-5': 'oklch(0.577 0.079 299.223)',
      sidebar: 'oklch(0.9670 0.0029 264.5419)',
      'sidebar-foreground': 'oklch(0.2101 0.0318 264.6645)',
      'sidebar-primary': 'oklch(0.6716 0.1368 48.5130)',
      'sidebar-primary-foreground': 'oklch(1.0000 0 0)',
      'sidebar-accent': 'oklch(1.0000 0 0)',
      'sidebar-accent-foreground': 'oklch(0.2101 0.0318 264.6645)',
      'sidebar-border': 'oklch(0.9276 0.0058 264.5313)',
      'sidebar-ring': 'oklch(0.6716 0.1368 48.5130)',
      radius: '0.625rem',
      'font-sans':
        "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
      'font-serif': 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      'font-mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    dark: {
      background: 'oklch(0.1797 0.0043 308.1928)',
      foreground: 'oklch(0.8109 0 0)',
      card: 'oklch(0.1822 0 0)',
      'card-foreground': 'oklch(0.8109 0 0)',
      popover: 'oklch(0.1797 0.0043 308.1928)',
      'popover-foreground': 'oklch(0.8109 0 0)',
      primary: 'oklch(0.651 0.139 48.621)',
      'primary-foreground': 'oklch(0.1797 0.0043 308.1928)',
      secondary: 'oklch(0.586 0.058 195.676)',
      'secondary-foreground': 'oklch(0.1797 0.0043 308.1928)',
      muted: 'oklch(0.2520 0 0)',
      'muted-foreground': 'oklch(0.6268 0 0)',
      accent: 'oklch(0.3211 0 0)',
      'accent-foreground': 'oklch(0.8109 0 0)',
      destructive: 'oklch(0.595 0.188 24.933)',
      border: 'oklch(0.2520 0 0)',
      input: 'oklch(0.2520 0 0)',
      ring: 'oklch(0.7214 0.1337 49.9802)',
      'chart-1': 'oklch(0.5940 0.0443 196.0233)',
      'chart-2': 'oklch(0.7214 0.1337 49.9802)',
      'chart-3': 'oklch(0.8721 0.0864 68.5474)',
      'chart-4': 'oklch(0.6268 0 0)',
      'chart-5': 'oklch(0.6830 0 0)',
      sidebar: 'oklch(0.1822 0 0)',
      'sidebar-foreground': 'oklch(0.8109 0 0)',
      'sidebar-primary': 'oklch(0.7214 0.1337 49.9802)',
      'sidebar-primary-foreground': 'oklch(0.1797 0.0043 308.1928)',
      'sidebar-accent': 'oklch(0.3211 0 0)',
      'sidebar-accent-foreground': 'oklch(0.8109 0 0)',
      'sidebar-border': 'oklch(0.2520 0 0)',
      'sidebar-ring': 'oklch(0.7214 0.1337 49.9802)',
      radius: '0.625rem',
      'font-sans':
        "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
      'font-serif': 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      'font-mono': 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
  },
};

export type AppResolvedThemeMode = 'light' | 'dark';

export function getAppShadcnVars(mode: AppResolvedThemeMode): {
  theme: ShadcnThemeVars;
  colors: ShadcnColorVars;
} {
  // NOTE:
  // The registry themes below come from shadcn theme exporters, but our admin UI
  // wants a slightly sharper and more layered look:
  // - smaller radius
  // - clearer contrast between layout background, header/sidebar, and cards
  const radiusOverride = '0.25rem';

  const lightColorOverrides: Partial<ShadcnColorVars> = {
    // Slightly darker layout background so cards can "pop"
    background: 'oklch(0.97 0 0)',
    // Keep cards crisp white for contrast
    card: 'oklch(1 0 0)',
    popover: 'oklch(1 0 0)',
    // Sidebar/header surfaces should feel distinct from the content background
    sidebar: 'oklch(0.985 0 0)',
    // Make borders a bit more visible
    border: 'oklch(0.88 0 0)',
    input: 'oklch(0.90 0 0)',
  };

  const darkColorOverrides: Partial<ShadcnColorVars> = {
    // Deeper base so card surfaces are clearly elevated
    background: 'oklch(0.14 0 0)',
    card: 'oklch(0.18 0 0)',
    popover: 'oklch(0.20 0 0)',
    sidebar: 'oklch(0.16 0 0)',
    border: 'oklch(0.30 0 0)',
    input: 'oklch(0.26 0 0)',
  };

  const baseTheme = mode === 'light' ? TANGIBLE.cssVars.theme : SUNRIZE_TWEAKCN.cssVars.theme;
  const baseColors = mode === 'light' ? TANGIBLE.cssVars.light : SUNRIZE_TWEAKCN.cssVars.dark;

  return {
    theme: {
      ...baseTheme,
      radius: radiusOverride,
    },
    colors: {
      ...baseColors,
      ...(mode === 'light' ? lightColorOverrides : darkColorOverrides),
    },
  };
}
