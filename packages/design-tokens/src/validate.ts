import {
  SCHEMA_VERSION,
  type ColorTokens,
  type DesignSystem,
  type ValidationIssue,
  type ValidationResult,
} from "./types.ts";

export const MAX_IMPORT_BYTES = 256 * 1024;

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
// Font stacks and shadows end up inside CSS, so reject anything that could break out of a declaration.
const FONT_STACK = /^[A-Za-z0-9 ,'"_.-]{1,200}$/;
const SHADOW = /^[A-Za-z0-9 ,.()%#-]{1,200}$/;
const ID = /^[a-z0-9][a-z0-9-]{0,63}$/;

export const COLOR_KEYS: (keyof ColorTokens)[] = [
  "background", "foreground", "primary", "primaryForeground",
  "secondary", "secondaryForeground", "muted", "mutedForeground", "border",
];

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

function num(v: unknown, path: string, min: number, max: number, issues: ValidationIssue[]): number {
  if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max) {
    issues.push({ path, message: `must be a number between ${min} and ${max}` });
    return min;
  }
  return v;
}

function str(v: unknown, path: string, re: RegExp, what: string, issues: ValidationIssue[]): string {
  if (typeof v !== "string" || !re.test(v.trim())) {
    issues.push({ path, message: `must be ${what}` });
    return "";
  }
  return v.trim();
}

export function normalizeHex(hex: string): string {
  const h = hex.trim().toUpperCase();
  return h.length === 4 ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}` : h;
}

export function validateDesignSystem(input: unknown): ValidationResult<DesignSystem> {
  const issues: ValidationIssue[] = [];
  if (!isObj(input)) return { ok: false, errors: [{ path: "", message: "must be an object" }] };

  if (input["schemaVersion"] !== SCHEMA_VERSION) {
    issues.push({ path: "schemaVersion", message: `must be ${SCHEMA_VERSION}` });
  }
  const id = str(input["id"], "id", ID, "a lowercase slug (a-z, 0-9, hyphen; max 64)", issues);
  const nameRaw = input["name"];
  const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
  if (name.length < 1 || name.length > 80) issues.push({ path: "name", message: "must be 1-80 characters" });

  const c = isObj(input["colors"]) ? input["colors"] : (issues.push({ path: "colors", message: "must be an object" }), {});
  const colors = {} as ColorTokens;
  for (const key of COLOR_KEYS) {
    const v = str(c[key], `colors.${key}`, HEX, "a hex color like #1A2B3C", issues);
    colors[key] = v ? normalizeHex(v) : "#000000";
  }

  const t = isObj(input["typography"]) ? input["typography"] : (issues.push({ path: "typography", message: "must be an object" }), {});
  const typography = {
    headingFont: str(t["headingFont"], "typography.headingFont", FONT_STACK, "a safe font-family list", issues),
    bodyFont: str(t["bodyFont"], "typography.bodyFont", FONT_STACK, "a safe font-family list", issues),
    monoFont: str(t["monoFont"], "typography.monoFont", FONT_STACK, "a safe font-family list", issues),
    baseSizePx: num(t["baseSizePx"], "typography.baseSizePx", 12, 24, issues),
    scaleRatio: num(t["scaleRatio"], "typography.scaleRatio", 1.05, 2, issues),
  };

  const s = isObj(input["spacing"]) ? input["spacing"] : (issues.push({ path: "spacing", message: "must be an object" }), {});
  const scaleRaw = s["scale"];
  let scale: number[] = [];
  if (!Array.isArray(scaleRaw) || scaleRaw.length < 2 || scaleRaw.length > 32) {
    issues.push({ path: "spacing.scale", message: "must be an array of 2-32 numbers" });
  } else {
    scale = scaleRaw.map((n, i) => num(n, `spacing.scale[${i}]`, 0, 256, issues));
    if (scale.some((n, i) => i > 0 && n < (scale[i - 1] ?? 0))) {
      issues.push({ path: "spacing.scale", message: "must be in ascending order" });
    }
  }
  const spacing = { baseUnitPx: num(s["baseUnitPx"], "spacing.baseUnitPx", 1, 16, issues), scale };

  const r = isObj(input["radii"]) ? input["radii"] : (issues.push({ path: "radii", message: "must be an object" }), {});
  const radii = {
    sm: num(r["sm"], "radii.sm", 0, 64, issues),
    md: num(r["md"], "radii.md", 0, 64, issues),
    lg: num(r["lg"], "radii.lg", 0, 64, issues),
  };

  const sh = isObj(input["shadows"]) ? input["shadows"] : (issues.push({ path: "shadows", message: "must be an object" }), {});
  const shadows = {
    sm: str(sh["sm"], "shadows.sm", SHADOW, "a plain CSS box-shadow value", issues),
    md: str(sh["md"], "shadows.md", SHADOW, "a plain CSS box-shadow value", issues),
    lg: str(sh["lg"], "shadows.lg", SHADOW, "a plain CSS box-shadow value", issues),
  };

  if (issues.length > 0) return { ok: false, errors: issues };
  return { ok: true, value: { schemaVersion: SCHEMA_VERSION, id, name, colors, typography, spacing, radii, shadows } };
}

/** Parse untrusted JSON text (e.g. an imported file) into a validated design system. Never throws. */
export function parseDesignSystemJson(text: string): ValidationResult<DesignSystem> {
  if (new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) {
    return { ok: false, errors: [{ path: "", message: `file is larger than ${MAX_IMPORT_BYTES / 1024} KB` }] };
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, errors: [{ path: "", message: "is not valid JSON" }] };
  }
  return validateDesignSystem(data);
}
