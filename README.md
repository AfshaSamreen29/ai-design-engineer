# AI Design Engineer

An independent, open-source toolkit for better AI-generated websites: reusable design systems, portable design skills for coding agents, and browser-based visual quality checks.

> **Status: early build (Stage 3 of 5).** Only the items marked ✅ below are implemented and verified. Everything else is planned and is **not** available yet.

## Build status

| Area | Status |
| --- | --- |
| Monorepo scaffold (pnpm workspaces, strict TypeScript) | ✅ |
| `@ai-design-engineer/design-tokens`: schema, validation, defaults, JSON/CSS export, contrast hints | ✅ 12 unit tests passing |
| Original landing-page design skill (`SKILL.md`, 5 references, 2 templates) | ✅ 7 structural tests passing |
| CLI: `init`, `design`, `tokens export`, `skill install` (dry-run, overwrite protection, path-traversal guards) | ✅ 33 tests passing |
| CLI: `review` | ⏳ Stage 4 (placeholder; exits with code 2) |
| Visual QA engine (Playwright screenshots + report) | ⏳ Stage 4 |
| Web app: marketing site, dashboard, design-system editor | ⏳ Stage 5 |
| Supabase persistence, billing | Deferred (local-first by default) |

## Prerequisites

- Node.js **22.18 or newer** (runs TypeScript directly; used by the test runner)
- pnpm 9+ (`corepack enable` or `npm i -g pnpm`)
- Git

No API keys, accounts, or network services are required.

## Install and test

```bash
pnpm install
pnpm test          # runs every package's tests
pnpm typecheck     # strict TypeScript
```

Or run a single package without pnpm:

```bash
cd packages/design-tokens   # or packages/skills, packages/cli
node --test "src/**/*.test.ts"
```

## CLI

```bash
pnpm install
node packages/cli/src/bin.ts init --name "My Project"
node packages/cli/src/bin.ts design --name "My Project" --goal "Start a free trial"
node packages/cli/src/bin.ts tokens export
node packages/cli/src/bin.ts skill install --dry-run
```

`pnpm cli <command>` is a shorthand for the first form. Every file-changing command supports `--dry-run` and refuses to overwrite files that differ unless you pass `--force`. Full reference: [docs/cli.md](docs/cli.md). The `review` command is not implemented yet.

## Landing-page design skill

A portable, dependency-free skill for coding agents lives in `packages/skills/landing-page-design/`. See [docs/design-skills.md](docs/design-skills.md) for contents and manual installation. Install it with `skill install` (see below). The tests check the skill's structure, not whether it produces good designs.

## Design tokens package

```ts
import { createDefaultDesignSystem, validateDesignSystem, parseDesignSystemJson, toCss, toJson } from "@ai-design-engineer/design-tokens";

const ds = createDefaultDesignSystem({ id: "my-brand", name: "My Brand" });
ds.colors.primary = "#1F5AFF";

const result = validateDesignSystem(ds);
if (result.ok) {
  console.log(toCss(result.value)); // :root { --color-primary: #1F5AFF; ... }
  console.log(toJson(result.value)); // re-importable via parseDesignSystemJson()
}
```

Validation rules worth knowing:

- Colors must be 3- or 6-digit hex and are normalized to uppercase 6-digit.
- Font stacks and shadows are restricted to a safe character set, so values cannot break out of a CSS declaration.
- Imported JSON is size-limited (256 KB) and never throws; malformed input returns a list of `{ path, message }` issues.
- `checkTokenContrast()` reports WCAG 2.x contrast ratios for the text/background pairs the tokens define. It is a hint about the tokens, **not** a WCAG compliance guarantee for a rendered page.

## Environment

Copy `.env.example` to `.env.local` if needed. All values are optional and currently unused.

## Known limitations

- No lockfile is committed yet (the first `pnpm install` was not run in the authoring environment). Commit `pnpm-lock.yaml` after your first install.
- Validation is hand-written and dependency-free for now; migrating to Zod is a possible later step once dependencies can be installed.
- CI (`.github/workflows/ci.yml`) has not yet run on GitHub.

## License

MIT, see [LICENSE](LICENSE). Scope: all original code and documentation in this repository. Third-party dependencies keep their own licenses.
