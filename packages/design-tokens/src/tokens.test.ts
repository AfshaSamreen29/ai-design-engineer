import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createDefaultDesignSystem, validateDesignSystem, parseDesignSystemJson,
  toJson, toCss, contrastRatio, checkTokenContrast, MAX_IMPORT_BYTES,
} from "./index.ts";

test("default design system is valid", () => {
  const r = validateDesignSystem(createDefaultDesignSystem());
  assert.equal(r.ok, true);
});

test("default palette passes AA for all defined text pairs", () => {
  const notes = checkTokenContrast(createDefaultDesignSystem().colors);
  for (const n of notes) assert.ok(n.passesAA, `${n.pair} was ${n.ratio}`);
});

test("contrast ratio: black on white is 21, identical colors is 1", () => {
  assert.equal(Math.round(contrastRatio("#000000", "#FFFFFF")), 21);
  assert.equal(contrastRatio("#123456", "#123456"), 1);
});

test("rejects bad hex colors with a precise path", () => {
  const ds = createDefaultDesignSystem();
  (ds.colors as unknown as Record<string, string>)["primary"] = "blue";
  const r = validateDesignSystem(ds);
  assert.equal(r.ok, false);
  if (!r.ok) assert.ok(r.errors.some((e) => e.path === "colors.primary"));
});

test("normalizes 3-digit hex to uppercase 6-digit", () => {
  const ds = createDefaultDesignSystem();
  ds.colors.border = "#abc";
  const r = validateDesignSystem(ds);
  assert.ok(r.ok && r.value.colors.border === "#AABBCC");
});

test("rejects CSS injection in fonts and shadows", () => {
  const ds = createDefaultDesignSystem();
  ds.typography.bodyFont = "Arial; } body { display:none";
  ds.shadows.sm = "0 0 0 red; background:url(x)";
  const r = validateDesignSystem(ds);
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.ok(r.errors.some((e) => e.path === "typography.bodyFont"));
    assert.ok(r.errors.some((e) => e.path === "shadows.sm"));
  }
});

test("rejects out-of-range numbers and unsorted spacing scale", () => {
  const ds = createDefaultDesignSystem();
  ds.typography.baseSizePx = 99;
  ds.spacing.scale = [0, 8, 4];
  const r = validateDesignSystem(ds);
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.ok(r.errors.some((e) => e.path === "typography.baseSizePx"));
    assert.ok(r.errors.some((e) => e.path === "spacing.scale"));
  }
});

test("rejects non-objects, wrong schema version, and bad ids", () => {
  assert.equal(validateDesignSystem(null).ok, false);
  assert.equal(validateDesignSystem([]).ok, false);
  const ds = { ...createDefaultDesignSystem(), schemaVersion: 2, id: "Bad Id!" };
  const r = validateDesignSystem(ds);
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.ok(r.errors.some((e) => e.path === "schemaVersion"));
    assert.ok(r.errors.some((e) => e.path === "id"));
  }
});

test("JSON export round-trips through import", () => {
  const ds = createDefaultDesignSystem({ id: "my-brand", name: "My Brand" });
  const r = parseDesignSystemJson(toJson(ds));
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(r.value, ds);
});

test("import handles malformed and oversized input without throwing", () => {
  const bad = parseDesignSystemJson("{not json");
  assert.equal(bad.ok, false);
  const big = parseDesignSystemJson(" ".repeat(MAX_IMPORT_BYTES + 1));
  assert.equal(big.ok, false);
});

test("CSS export contains expected custom properties", () => {
  const css = toCss(createDefaultDesignSystem());
  assert.match(css, /^\/\* Design system: Ink & Cobalt/);
  assert.match(css, /--color-primary: #2F3FD8;/);
  assert.match(css, /--color-primary-foreground: #FFFFFF;/);
  assert.match(css, /--font-heading: Georgia/);
  assert.match(css, /--space-4: 1rem;/); // 4 * 4px / 16
  assert.match(css, /--radius-md: 8px;/);
  assert.match(css, /--shadow-lg: 0 12px 32px/);
  assert.match(css, /:root \{[\s\S]*\}\n$/);
});

test("CSS export is deterministic", () => {
  const ds = createDefaultDesignSystem();
  assert.equal(toCss(ds), toCss(structuredClone(ds)));
});
