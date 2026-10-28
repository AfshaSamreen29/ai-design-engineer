import { checkTokenContrast, type DesignSystem } from "@ai-design-engineer/design-tokens";

export interface BriefInput {
  name?: string;
  type?: string;
  audience?: string;
  goal?: string;
  description?: string;
}

const DEFAULTS = {
  name: "Untitled project",
  type: "Product landing page",
  audience: "Prospective users who are comparing options and need to understand the product quickly",
  goal: "Start using the product through one primary call to action",
  description: "Describe the product in one or two plain sentences before building.",
};

/** Collapses whitespace and newlines so user text cannot add structure to the Markdown document. */
export function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function slugify(text: string): string {
  const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64).replace(/-+$/g, "");
  return slug || "default";
}

function field(label: string, value: string | undefined, fallback: string): string {
  return value && value.trim()
    ? `- **${label}:** ${clean(value)} *(provided)*`
    : `- **${label}:** ${fallback} *(suggested, please edit)*`;
}

function radiusWord(md: number): string {
  return md <= 4 ? "sharp" : md <= 10 ? "moderate" : "soft";
}

/** Deterministic template. No model is called; the same inputs always give the same document. */
export function generateBrief(input: BriefInput, ds: DesignSystem, usingDefaultTokens: boolean): string {
  const name = input.name?.trim() ? clean(input.name) : DEFAULTS.name;
  const c = ds.colors;
  const t = ds.typography;
  const contrast = checkTokenContrast(c);
  const rem = (px: number) => `${Math.round(((px * ds.spacing.baseUnitPx) / 16) * 1000) / 1000}rem`;

  const lines: string[] = [
    `# Design brief: ${name}`,
    "",
    "> Generated from a deterministic template by `ai-design-engineer design`. No AI model was used.",
    "> Items marked *(provided)* came from you. Items marked *(suggested)* are defaults to review and edit.",
    "",
    "## Project summary",
    field("Name", input.name, DEFAULTS.name),
    field("Page type", input.type, DEFAULTS.type),
    field("Description", input.description, DEFAULTS.description),
    "",
    "## Audience and goals",
    field("Primary audience", input.audience, DEFAULTS.audience),
    field("Primary conversion goal", input.goal, DEFAULTS.goal),
    "- **Rule:** one dominant call to action per viewport; secondary actions look secondary. *(suggested)*",
    "",
    "## Information hierarchy *(suggested)*",
    "1. First screen: who it is for, what it does, and the next step, without scrolling.",
    "2. How it works or what it looks like, shown with real content.",
    "3. Evidence the claims are true. Use only proof that exists; do not invent testimonials, logos, or statistics.",
    "4. Details that answer likely doubts (pricing, limits, data handling, support).",
    "5. A closing call to action that repeats the primary goal.",
    "",
    "## Visual direction *(suggested)*",
    `- Design system: **${ds.name}** ${usingDefaultTokens ? "(default tokens; no design system file was found)" : "(loaded from your design-system file)"}.`,
    `- Mood from tokens: ${radiusWord(ds.radii.md)} corners (${ds.radii.md}px), primary accent ${c.primary} on ${c.background}.`,
    "- Write a three-word feeling, a reference world, and one signature device before coding (see the landing-page-design skill).",
    "",
    "## Typography",
    `- Headings: \`${t.headingFont}\``,
    `- Body: \`${t.bodyFont}\``,
    `- Code: \`${t.monoFont}\``,
    `- Base size ${t.baseSizePx}px, scale ratio ${t.scaleRatio}. Body line height 1.5 to 1.7; line length 55 to 75 characters.`,
    "",
    "## Color system",
    "| Token | Value |",
    "| --- | --- |",
    ...Object.entries(c).map(([k, v]) => `| ${k} | ${v} |`),
    "",
    "Contrast of the token pairs (WCAG 2.x ratio; 4.5 is the usual minimum for normal text):",
    "",
    "| Pair | Ratio | Meets 4.5 |",
    "| --- | --- | --- |",
    ...contrast.map((n) => `| ${n.pair} | ${n.ratio} | ${n.passesAA ? "yes" : "no"} |`),
    "",
    "This checks the tokens only. It does not establish that a rendered page is accessible.",
    "",
    "## Spacing and component rules",
    `- Spacing base unit ${ds.spacing.baseUnitPx}px. Scale steps: ${ds.spacing.scale.map((n) => `${n} (${rem(n)})`).join(", ")}.`,
    `- Radii: sm ${ds.radii.sm}px, md ${ds.radii.md}px, lg ${ds.radii.lg}px.`,
    "- Use only token values for color, spacing, radius, and shadow.",
    "- Every interactive element needs hover, focus-visible, active, and disabled states.",
    "- Touch targets at least 44 by 44 px.",
    "",
    "## Responsive behavior",
    "- Build mobile first; verify at 375, 768, 1024, and 1440 px wide.",
    "- No horizontal scrolling at any width; wide content scrolls inside its own container.",
    "",
    "## Accessibility considerations",
    "- Semantic landmarks, one h1, ordered headings, labelled form controls.",
    "- Visible keyboard focus; operable by keyboard alone; layout holds at 200 percent zoom.",
    "- Respect prefers-reduced-motion. Meaningful alt text for informative images.",
    "",
    "## Implementation checklist",
    "- [ ] Visual concept written down",
    "- [ ] Tokens defined once and used everywhere",
    "- [ ] Real copy, no placeholder or invented proof",
    "- [ ] Responsive layouts verified at the widths above",
    "- [ ] Keyboard and focus checked by hand",
    "- [ ] No console errors; every link and button has a real destination",
    "- [ ] Assumptions and limitations listed in the final summary",
    "",
  ];
  return lines.join("\n");
}
