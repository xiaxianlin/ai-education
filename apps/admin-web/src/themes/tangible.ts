import type { ThemeConfig } from 'antd';
import { AliasToken } from 'antd/lib/theme/interface';

type Oklch = {
  /** Lightness in [0..1] */
  L: number;
  /** Chroma (unbounded, but typical UI values are small) */
  C: number;
  /** Hue in degrees */
  H: number;
};

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

function linearToSrgb(x: number) {
  const v = clamp01(x);
  return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

function toHexByte01(x: number) {
  const n = Math.round(clamp01(x) * 255);
  return n.toString(16).padStart(2, '0');
}

/**
 * OKLCH -> #RRGGBB
 *
 * Notes:
 * - antd token derivations are more reliable with hex/rgb than with modern CSS colors like `oklch(...)`.
 * - values are clamped to sRGB gamut.
 */
function oklchToHex({ L, C, H }: Oklch) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  // OKLab -> LMS (nonlinear)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  // cube
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // linear sRGB
  const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const r = linearToSrgb(rLin);
  const g = linearToSrgb(gLin);
  const bb = linearToSrgb(bLin);

  return `#${toHexByte01(r)}${toHexByte01(g)}${toHexByte01(bb)}`;
}

export const tangibleThemeTokens = {
  background: { L: 1, C: 0, H: 0 } satisfies Oklch,
  foreground: { L: 0.145, C: 0, H: 0 } satisfies Oklch,
  card: { L: 1, C: 0, H: 0 } satisfies Oklch,
  border: { L: 0.922, C: 0, H: 0 } satisfies Oklch,
  primary: { L: 0.205, C: 0, H: 0 } satisfies Oklch,
  destructive: { L: 0.577, C: 0.245, H: 27.325 } satisfies Oklch,

  fontSans:
    "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
  // 0.625rem @ 16px root font-size
  radiusPx: 4,
} as const;

/**
 * Tangible theme (Ant Design ThemeConfig)
 */
export const tangibleTheme: Partial<AliasToken> = {
  fontFamily: tangibleThemeTokens.fontSans,
  borderRadius: tangibleThemeTokens.radiusPx,

  colorPrimary: oklchToHex(tangibleThemeTokens.primary),
  colorInfo: oklchToHex(tangibleThemeTokens.primary),
  colorError: oklchToHex(tangibleThemeTokens.destructive),

  colorBgBase: oklchToHex(tangibleThemeTokens.background),
  colorBgContainer: oklchToHex(tangibleThemeTokens.card),
  colorTextBase: oklchToHex(tangibleThemeTokens.foreground),
  colorBorder: oklchToHex(tangibleThemeTokens.border),
};
