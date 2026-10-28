import { test } from "node:test";
import assert from "node:assert/strict";
import { createDefaultDesignSystem } from "@ai-design-engineer/design-tokens";
import { generateBrief, slugify, clean } from "./brief.ts";

test("brief is deterministic", () => {
  const ds = createDefaultDesignSystem();
  assert.equal(generateBrief({ name: "A" }, ds, true), generateBrief({ name: "A" }, ds, true));
});

test("slugify produces valid design-system ids", () => {
  assert.equal(slugify("Acme Co."), "acme-co");
  assert.equal(slugify("  --  "), "default");
  assert.equal(slugify("Ünïcode ✨"), "n-code");
  assert.ok(slugify("x".repeat(200)).length <= 64);
});

test("clean flattens whitespace and newlines", () => {
  assert.equal(clean("a\n\n  b\tc "), "a b c");
});
