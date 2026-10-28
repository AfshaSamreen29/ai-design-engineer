import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseDesignSystemJson, createDefaultDesignSystem, toJson } from "@ai-design-engineer/design-tokens";
import { cli, tempDir } from "./helpers.test-util.ts";

const read = (dir: string, rel: string) => readFileSync(path.join(dir, ...rel.split("/")), "utf8");
const has = (dir: string, rel: string) => existsSync(path.join(dir, ...rel.split("/")));

function withTemp(fn: (dir: string) => void) {
  const { dir, cleanup } = tempDir();
  try {
    fn(dir);
  } finally {
    cleanup();
  }
}

// ------------------------------------------------------------ general
test("help, version, and unknown commands", () => {
  withTemp((dir) => {
    const help = cli(dir, "--help");
    assert.equal(help.code, 0);
    for (const word of ["init", "design", "tokens export", "skill install", "review"]) assert.match(help.out, new RegExp(word));
    assert.equal(cli(dir).code, 0);
    assert.match(cli(dir, "--version").out, /^\d+\.\d+\.\d+$/);
    const bad = cli(dir, "frobnicate");
    assert.equal(bad.code, 2);
    assert.match(bad.err, /Unknown command: frobnicate/);
    assert.match(cli(dir, "tokens", "export", "--help").out, /--format/);
  });
});

test("usage errors exit with code 2 and write nothing", () => {
  withTemp((dir) => {
    assert.equal(cli(dir, "init", "--bogus").code, 2);
    assert.equal(cli(dir, "init", "extra").code, 2);
    assert.equal(cli(dir, "tokens", "export", "--format", "xml").code, 2);
    assert.equal(cli(dir, "skill", "install", "--target", "nope").code, 2);
    assert.equal(cli(dir, "design", "--name", "a".repeat(200)).code, 2);
    assert.deepEqual(readdirSync(dir), []);
  });
});

test("missing project directory is a clear error", () => {
  withTemp((dir) => {
    const r = cli(dir, "init", "--dir", "does-not-exist");
    assert.equal(r.code, 1);
    assert.match(r.err, /Project directory not found/);
  });
});

// --------------------------------------------------------------- init
test("init creates config, a valid design system, and instructions", () => {
  withTemp((dir) => {
    const r = cli(dir, "init", "--name", "Acme");
    assert.equal(r.code, 0, r.err);
    const config = JSON.parse(read(dir, "ai-design-engineer.config.json"));
    assert.equal(config.project.name, "Acme");
    const ds = parseDesignSystemJson(read(dir, "design/design-system.json"));
    assert.ok(ds.ok);
    assert.equal(ds.ok && ds.value.id, "acme");
    assert.match(read(dir, "design/AGENT_INSTRUCTIONS.md"), /Never invent testimonials|invent testimonials/);
  });
});

test("init --dry-run writes nothing", () => {
  withTemp((dir) => {
    const r = cli(dir, "init", "--dry-run");
    assert.equal(r.code, 0);
    assert.match(r.out, /Dry run/);
    assert.match(r.out, /create\s+design\/design-system\.json/);
    assert.deepEqual(readdirSync(dir), []);
  });
});

test("init is idempotent, refuses to overwrite edits, and --force overwrites", () => {
  withTemp((dir) => {
    assert.equal(cli(dir, "init", "--name", "Acme").code, 0);
    assert.equal(cli(dir, "init", "--name", "Acme").code, 0); // identical rerun is fine

    writeFileSync(path.join(dir, "design", "AGENT_INSTRUCTIONS.md"), "my own notes");
    writeFileSync(path.join(dir, "design", "design-system.json"), "{}");
    const blocked = cli(dir, "init", "--name", "Acme");
    assert.equal(blocked.code, 1);
    assert.match(blocked.err, /Nothing was written/);
    assert.equal(read(dir, "design/AGENT_INSTRUCTIONS.md"), "my own notes");
    assert.equal(read(dir, "design/design-system.json"), "{}");

    assert.equal(cli(dir, "init", "--name", "Acme", "--force").code, 0);
    assert.notEqual(read(dir, "design/AGENT_INSTRUCTIONS.md"), "my own notes");
  });
});

test("init conflict is all-or-nothing", () => {
  withTemp((dir) => {
    mkdirSync(path.join(dir, "design"));
    writeFileSync(path.join(dir, "design", "design-system.json"), "{}");
    assert.equal(cli(dir, "init").code, 1);
    assert.equal(has(dir, "ai-design-engineer.config.json"), false);
    assert.equal(has(dir, "design/AGENT_INSTRUCTIONS.md"), false);
  });
});

// ------------------------------------------------------------- design
test("design generates a brief that separates provided from suggested content", () => {
  withTemp((dir) => {
    const r = cli(dir, "design", "--name", "Acme", "--goal", "Start a free trial");
    assert.equal(r.code, 0, r.err);
    const brief = read(dir, "design/DESIGN_BRIEF.md");
    assert.match(brief, /# Design brief: Acme/);
    assert.match(brief, /Primary conversion goal:\*\* Start a free trial \*\(provided\)\*/);
    assert.match(brief, /Primary audience:\*\* .* \*\(suggested, please edit\)\*/);
    assert.match(brief, /No AI model was used/);
    for (const h of ["Project summary", "Audience and goals", "Information hierarchy", "Visual direction", "Typography", "Color system", "Spacing and component rules", "Responsive behavior", "Accessibility considerations", "Implementation checklist"]) {
      assert.match(brief, new RegExp(`## ${h}`));
    }
    assert.match(brief, /default tokens; no design system file was found/);
  });
});

test("design uses the project's design system file and rejects an invalid one", () => {
  withTemp((dir) => {
    cli(dir, "init", "--name", "Acme");
    const ds = createDefaultDesignSystem({ id: "acme", name: "Acme Custom" });
    ds.colors.primary = "#E11D48";
    writeFileSync(path.join(dir, "design", "design-system.json"), toJson(ds));
    assert.equal(cli(dir, "design", "--name", "Acme").code, 0);
    const brief = read(dir, "design/DESIGN_BRIEF.md");
    assert.match(brief, /Acme Custom/);
    assert.match(brief, /#E11D48/);

    writeFileSync(path.join(dir, "design", "design-system.json"), "{not json");
    const bad = cli(dir, "design", "--force");
    assert.equal(bad.code, 1);
    assert.match(bad.err, /Invalid design system/);
  });
});

test("design keeps user text from adding Markdown structure", () => {
  withTemp((dir) => {
    cli(dir, "design", "--description", "Line one\n\n## Injected heading");
    const brief = read(dir, "design/DESIGN_BRIEF.md");
    assert.ok(!/^## Injected heading/m.test(brief));
  });
});

test("design refuses output paths outside the project", () => {
  withTemp((dir) => {
    const r = cli(dir, "design", "--out", "../escape.md");
    assert.equal(r.code, 1);
    assert.match(r.err, /outside the project/);
  });
});

// ------------------------------------------------------ tokens export
test("tokens export writes valid JSON and consumable CSS", () => {
  withTemp((dir) => {
    cli(dir, "init", "--name", "Acme");
    const r = cli(dir, "tokens", "export");
    assert.equal(r.code, 0, r.err);
    const json = parseDesignSystemJson(read(dir, "design/tokens/tokens.json"));
    assert.ok(json.ok);
    const css = read(dir, "design/tokens/tokens.css");
    assert.match(css, /:root \{/);
    assert.match(css, /--color-primary: #2F3FD8;/);
  });
});

test("tokens export honors --format and --out", () => {
  withTemp((dir) => {
    cli(dir, "init");
    assert.equal(cli(dir, "tokens", "export", "--format", "css", "--out", "public/t").code, 0);
    assert.ok(has(dir, "public/t/tokens.css"));
    assert.ok(!has(dir, "public/t/tokens.json"));
  });
});

test("tokens export validates input and rejects escapes", () => {
  withTemp((dir) => {
    assert.match(cli(dir, "tokens", "export", "--input", "nope.json").err, /not found/);
    mkdirSync(path.join(dir, "design"));
    const ds = createDefaultDesignSystem();
    ds.colors.primary = "red";
    ds.typography.bodyFont = "Arial; } body { display:none";
    writeFileSync(path.join(dir, "design", "design-system.json"), toJson(ds));
    const bad = cli(dir, "tokens", "export");
    assert.equal(bad.code, 1);
    assert.match(bad.err, /colors\.primary/);
    assert.match(bad.err, /typography\.bodyFont/);
    assert.ok(!has(dir, "design/tokens/tokens.css"));
    assert.equal(cli(dir, "tokens", "export", "--input", "../x.json").code, 1);
    assert.equal(cli(dir, "tokens", "export", "--out", "../outside").code, 1);
  });
});

test("tokens export refuses to overwrite a changed file without --force", () => {
  withTemp((dir) => {
    cli(dir, "init");
    cli(dir, "tokens", "export");
    writeFileSync(path.join(dir, "design", "tokens", "tokens.css"), "/* hand edited */");
    assert.equal(cli(dir, "tokens", "export").code, 1);
    assert.equal(read(dir, "design/tokens/tokens.css"), "/* hand edited */");
    assert.equal(cli(dir, "tokens", "export", "--force").code, 0);
  });
});

// ------------------------------------------------------ skill install
test("skill install copies the full skill for the claude target", () => {
  withTemp((dir) => {
    const r = cli(dir, "skill", "install");
    assert.equal(r.code, 0, r.err);
    const base = ".claude/skills/landing-page-design";
    assert.match(read(dir, `${base}/SKILL.md`), /^---\r?\nname: landing-page-design/);
    assert.ok(has(dir, `${base}/references/verification.md`));
    assert.ok(has(dir, `${base}/templates/design-brief.md`));
    assert.ok(has(dir, `${base}/LICENSE`));
  });
});

test("skill install supports agents target and prints the AGENTS.md hint", () => {
  withTemp((dir) => {
    const r = cli(dir, "skill", "install", "--target", "agents");
    assert.equal(r.code, 0, r.err);
    assert.ok(has(dir, "docs/skills/landing-page-design/SKILL.md"));
    assert.match(r.out, /AGENTS\.md/);
  });
});

test("skill install protects local edits, supports --force and --dry-run", () => {
  withTemp((dir) => {
    cli(dir, "skill", "install");
    const skillPath = ".claude/skills/landing-page-design/SKILL.md";
    writeFileSync(path.join(dir, ...skillPath.split("/")), "my customised skill");
    const blocked = cli(dir, "skill", "install");
    assert.equal(blocked.code, 1);
    assert.match(blocked.out, /CONFLICT\s+\.claude\/skills\/landing-page-design\/SKILL\.md/);
    assert.equal(read(dir, skillPath), "my customised skill");

    const dry = cli(dir, "skill", "install", "--force", "--dry-run");
    assert.equal(dry.code, 0);
    assert.match(dry.out, /overwrite/);
    assert.equal(read(dir, skillPath), "my customised skill");

    assert.equal(cli(dir, "skill", "install", "--force").code, 0);
    assert.match(read(dir, skillPath), /^---\r?\nname: landing-page-design/);
  });
});

test("skill install --dest stays inside the project", () => {
  withTemp((dir) => {
    assert.equal(cli(dir, "skill", "install", "--dest", "tools/skill").code, 0);
    assert.ok(has(dir, "tools/skill/SKILL.md"));
    const r = cli(dir, "skill", "install", "--dest", "../outside");
    assert.equal(r.code, 1);
    assert.match(r.err, /outside the project/);
  });
});

test("skill install --dry-run on an empty project writes nothing", () => {
  withTemp((dir) => {
    const r = cli(dir, "skill", "install", "--dry-run");
    assert.equal(r.code, 0);
    assert.match(r.out, /Would write \d+ file/);
    assert.deepEqual(readdirSync(dir), []);
  });
});

// ------------------------------------------------------------- review
test("review is honest that it is not implemented", () => {
  withTemp((dir) => {
    const r = cli(dir, "review", "--url", "http://localhost:3000");
    assert.equal(r.code, 2);
    assert.match(r.err, /not implemented yet/);
  });
});
