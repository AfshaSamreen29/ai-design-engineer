export const SCHEMA_VERSION = 1 as const;

export interface ColorTokens {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
}

export interface TypographyTokens {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  baseSizePx: number;
  scaleRatio: number;
}

export interface SpacingTokens {
  baseUnitPx: number;
  scale: number[];
}

export interface RadiiTokens {
  sm: number;
  md: number;
  lg: number;
}

export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
}

export interface DesignSystem {
  schemaVersion: typeof SCHEMA_VERSION;
  id: string;
  name: string;
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  radii: RadiiTokens;
  shadows: ShadowTokens;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: ValidationIssue[] };
