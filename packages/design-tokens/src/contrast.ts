import { normalizeHex } from "./validate.ts";
import type { ColorTokens } from "./types.ts";

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const h = normalizeHex(hex);
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2.x contrast ratio between two hex colors (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export interface ContrastNote {
  pair: string;
  ratio: number;
  passesAA: boolean;
}

/**
 * Checks the text/background pairs the tokens define. This is a token-level hint
 * about normal text (4.5:1); it does not certify that a rendered page is WCAG compliant.
 */
export function checkTokenContrast(colors: ColorTokens): ContrastNote[] {
  const pairs: [string, string, string][] = [
    ["foreground / background", colors.foreground, colors.background],
    ["primaryForeground / primary", colors.primaryForeground, colors.primary],
    ["secondaryForeground / secondary", colors.secondaryForeground, colors.secondary],
    ["mutedForeground / muted", colors.mutedForeground, colors.muted],
    ["mutedForeground / background", colors.mutedForeground, colors.background],
  ];
  return pairs.map(([pair, fg, bg]) => {
    const ratio = Math.round(contrastRatio(fg, bg) * 100) / 100;
    return { pair, ratio, passesAA: ratio >= 4.5 };
  });
}
