type Oklch = {
  l: number; // 0..1
  c: number;
  h: number; // degrees
  alpha: number; // 0..1
};

function clamp01(x: number) {
  if (Number.isNaN(x)) return 0;
  return Math.min(1, Math.max(0, x));
}

function roundByte(x: number) {
  return Math.round(clamp01(x) * 255);
}

function srgbEncode(u: number) {
  const x = clamp01(u);
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}

function parseNumberOrPercent(raw: string) {
  const v = raw.trim();
  if (v.endsWith('%')) {
    const n = Number(v.slice(0, -1));
    return Number.isFinite(n) ? n / 100 : 0;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function parseOklch(input: string): Oklch | null {
  const s = input.trim();
  const m = /^oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+%?))?\s*\)$/i.exec(s);
  if (!m) return null;

  const l = parseNumberOrPercent(m[1]);
  const c = parseFloat(m[2]);
  const h = parseFloat(m[3]);
  const alpha = m[4] ? parseNumberOrPercent(m[4]) : 1;

  if (!Number.isFinite(c) || !Number.isFinite(h)) return null;

  return {
    l: clamp01(l),
    c: c < 0 ? 0 : c,
    h,
    alpha: clamp01(alpha),
  };
}

export function oklchToRgbChannels(oklch: Oklch): { r: number; g: number; b: number } {
  const a = oklch.c * Math.cos((oklch.h * Math.PI) / 180);
  const b = oklch.c * Math.sin((oklch.h * Math.PI) / 180);

  // OKLab -> LMS (non-linear)
  const l_ = oklch.l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = oklch.l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = oklch.l - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  // Linear sRGB
  const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  // Gamma encode
  const r = srgbEncode(rLin);
  const g = srgbEncode(gLin);
  const bb = srgbEncode(bLin);

  return { r: clamp01(r), g: clamp01(g), b: clamp01(bb) };
}

function toHex2(n: number) {
  return n.toString(16).padStart(2, '0');
}

export function oklchToHex(input: string): string | null {
  const parsed = parseOklch(input);
  if (!parsed) return null;
  const { r, g, b } = oklchToRgbChannels(parsed);
  return `#${toHex2(roundByte(r))}${toHex2(roundByte(g))}${toHex2(roundByte(b))}`;
}

export function oklchToRgbaString(input: string): string | null {
  const parsed = parseOklch(input);
  if (!parsed) return null;
  const { r, g, b } = oklchToRgbChannels(parsed);
  const rr = roundByte(r);
  const gg = roundByte(g);
  const bb = roundByte(b);
  const a = clamp01(parsed.alpha);
  return `rgba(${rr}, ${gg}, ${bb}, ${a})`;
}

export function normalizeColorToCss(input: string): string {
  const parsed = parseOklch(input);
  if (!parsed) return input;
  if (parsed.alpha < 1) return oklchToRgbaString(input) ?? input;
  return oklchToHex(input) ?? input;
}


