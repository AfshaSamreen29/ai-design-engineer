import type { DesignSystem } from "./types.ts";
import { SCHEMA_VERSION } from "./types.ts";

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/** Stable, pretty JSON that round-trips through parseDesignSystemJson. */
export function toJson(ds: DesignSystem): string {
  return JSON.stringify(ds, null, 2) + "\n";
}

/** CSS custom properties on :root. Spacing is exported as rem so it respects user font settings. */
export function toCss(ds: DesignSystem): string {
  const lines: string[] = [`/* Design system: ${ds.name.replace(/\*\//g, "")} (schema v${SCHEMA_VERSION}) */`, ":root {"];
  for (const [k, v] of Object.entries(ds.colors)) lines.push(`  --color-${kebab(k)}: ${v};`);
  lines.push(`  --font-heading: ${ds.typography.headingFont};`);
  lines.push(`  --font-body: ${ds.typography.bodyFont};`);
  lines.push(`  --font-mono: ${ds.typography.monoFont};`);
  lines.push(`  --font-size-base: ${ds.typography.baseSizePx}px;`);
  lines.push(`  --type-scale-ratio: ${ds.typography.scaleRatio};`);
  lines.push(`  --space-unit: ${ds.spacing.baseUnitPx}px;`);
  ds.spacing.scale.forEach((n, i) => {
    lines.push(`  --space-${i}: ${(n * ds.spacing.baseUnitPx) / 16}rem;`);
  });
  for (const [k, v] of Object.entries(ds.radii)) lines.push(`  --radius-${k}: ${v}px;`);
  for (const [k, v] of Object.entries(ds.shadows)) lines.push(`  --shadow-${k}: ${v};`);
  lines.push("}", "");
  return lines.join("\n");
}
