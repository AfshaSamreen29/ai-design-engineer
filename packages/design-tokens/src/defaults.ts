import { SCHEMA_VERSION, type DesignSystem } from "./types.ts";

/** Warm off-white + deep ink + restrained cobalt. Fonts have system fallbacks so nothing needs a network. */
export function createDefaultDesignSystem(overrides: Partial<Pick<DesignSystem, "id" | "name">> = {}): DesignSystem {
  return {
    schemaVersion: SCHEMA_VERSION,
    id: overrides.id ?? "default",
    name: overrides.name ?? "Ink & Cobalt",
    colors: {
      background: "#FAF7F2",
      foreground: "#14131A",
      primary: "#2F3FD8",
      primaryForeground: "#FFFFFF",
      secondary: "#ECE6DB",
      secondaryForeground: "#14131A",
      muted: "#F1ECE3",
      mutedForeground: "#5C5A66",
      border: "#DDD5C7",
    },
    typography: {
      headingFont: "Georgia, 'Times New Roman', serif",
      bodyFont: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      monoFont: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      baseSizePx: 16,
      scaleRatio: 1.25,
    },
    spacing: { baseUnitPx: 4, scale: [0, 1, 2, 3, 4, 6, 8, 12, 16, 24] },
    radii: { sm: 4, md: 8, lg: 14 },
    shadows: {
      sm: "0 1px 2px rgba(20, 19, 26, 0.06)",
      md: "0 4px 12px rgba(20, 19, 26, 0.08)",
      lg: "0 12px 32px rgba(20, 19, 26, 0.12)",
    },
  };
}
