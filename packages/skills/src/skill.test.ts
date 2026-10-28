import { test } from "node:test";
import assert from "node:assert/strict";
import { SKILL_NAME, parseFrontmatter, listSkillFiles, readSkillFile } from "./skill.ts";

const skill = readSkillFile("SKILL.md");
const parsed = parseFrontmatter(skill);

test("SKILL.md has valid frontmatter", () => {
  assert.ok(parsed, "frontmatter block is missing");
  assert.equal(parsed.data.name, SKILL_NAME);
  const d = parsed.data.description ?? "";
  assert.ok(d.length >= 80 && d.length <= 1024, `description length ${d.length}`);
  assert.match(d, /Use when/i, "description should say when to use the skill");
});

test("SKILL.md contains every required section", () => {
  const body = parsed?.body ?? "";
  const required = [
    "## When to use this skill",
    "## Core principles",
    "## Workflow",
    "### Phase 0: Inspect before deciding",
    "### Phase 1: Gather requirements efficiently",
    "### Phase 2: Define a visual concept",
    "### Phase 3: Establish the design system first",
    "### Phase 4: Plan structure and hierarchy",
    "### Phase 5: Write the copy",
    "### Phase 7: Implement",
    "### Phase 8: Accessibility pass",
    "### Phase 9: Verify visually and iterate",
    "### Phase 10: Report",
    "## Decision criteria",
    "## Anti-patterns",
    "## Acceptance criteria",
    "## Examples",
    "## Final self-review checklist",
  ];
  for (const heading of required) assert.ok(body.includes(heading), `missing: ${heading}`);
});

test("every file referenced from SKILL.md exists", () => {
  const files = new Set(listSkillFiles());
  const refs = [...skill.matchAll(/`((?:references|templates)\/[\w./-]+\.md)`/g)].map((m) => m[1] as string);
  assert.ok(refs.length >= 7, `expected at least 7 references, found ${refs.length}`);
  for (const ref of refs) assert.ok(files.has(ref), `referenced file not found: ${ref}`);
});

test("every bundled reference and template is mentioned in SKILL.md", () => {
  const mentioned = new Set([...skill.matchAll(/`((?:references|templates)\/[\w./-]+\.md)`/g)].map((m) => m[1]));
  for (const f of listSkillFiles().filter((p) => /^(references|templates)\//.test(p))) {
    assert.ok(mentioned.has(f), `orphan file not linked from SKILL.md: ${f}`);
  }
});

test("skill is self-contained and ships a license", () => {
  const files = listSkillFiles();
  assert.ok(files.includes("LICENSE"));
  assert.ok(files.includes("SKILL.md"));
  assert.ok(!files.some((f) => f.endsWith(".ts") || f.endsWith(".js") || f.endsWith(".sh")), "skill must not ship executable scripts");
});

test("no leftover work-in-progress markers in skill content", () => {
  for (const f of listSkillFiles().filter((p) => p.endsWith(".md"))) {
    // Inline code is ignored so the skill can document its own `TODO(content)` convention.
    const text = readSkillFile(f).replace(/`[^`]*`/g, "");
    assert.ok(!/\b(FIXME|XXX|TBD)\b|\bTODO\b/.test(text), `unfinished marker in ${f}`);
  }
});

test("skill states honesty rules about proof and conformance", () => {
  assert.match(skill, /Never invent testimonials/i);
  assert.match(skill, /Never claim WCAG conformance/i);
  assert.match(skill, /prefers-reduced-motion/);
});
