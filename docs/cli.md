# CLI reference

The CLI has no dependency on the web app, an account, or any AI service. It reads and writes plain files in a project directory.

## Running it

From the repository root (Node 22.18+ and `pnpm install` done):

```bash
node packages/cli/src/bin.ts <command> [options]
# shorthand
pnpm cli <command> [options]
```

Examples below write `ai-design-engineer` for brevity; use one of the forms above. A published, installable binary is not set up yet.

## Commands

| Command | What it does |
| --- | --- |
| `init` | Creates `ai-design-engineer.config.json`, `design/design-system.json` (default tokens), and `design/AGENT_INSTRUCTIONS.md` |
| `design` | Creates `design/DESIGN_BRIEF.md` from your options plus defaults. Each field is labelled *(provided)* or *(suggested)* |
| `tokens export` | Validates a design system and writes `tokens.json` and `tokens.css` |
| `skill install` | Copies the bundled `landing-page-design` skill into the project |
| `review` | **Not implemented yet.** Prints a message and exits with code 2 |

Run `ai-design-engineer <command> --help` for the full option list.

### Common options

| Option | Meaning |
| --- | --- |
| `--dir <path>` | Project directory (default: current directory). Must exist |
| `--dry-run` | Print the plan; write nothing |
| `--force` | Overwrite existing files whose content differs |
| `--help`, `-h` | Show help |

### Examples

```bash
ai-design-engineer init --name "Acme"
ai-design-engineer design --name Acme --type "SaaS landing page" \
  --audience "Solo founders" --goal "Start a free trial"
ai-design-engineer tokens export --format css --out public/tokens
ai-design-engineer skill install --target claude --dry-run
ai-design-engineer skill install --target agents        # docs/skills/...
ai-design-engineer skill install --dest tools/design-skill
```

Skill targets: `claude` writes to `.claude/skills/landing-page-design`; `agents` (alias `codex`) writes to `docs/skills/landing-page-design` and prints a line to add to `AGENTS.md`. The CLI does not edit `AGENTS.md` or any other existing instruction file for you.

## Safety model

- **No silent overwrites.** Each file is classified as create, unchanged (identical content), overwrite, or conflict. If any file would conflict, nothing is written, and the command exits with code 1. Use `--force` to overwrite deliberately, or `--dry-run` to preview.
- **Idempotent.** Re-running a command whose output already exists unchanged succeeds and writes nothing.
- **Inside the project only.** Every output and input path is resolved against `--dir`. Paths using `..`, absolute paths outside the project, and symlinks that point outside are rejected.
- **Validated input.** Design system files are checked against the shared schema before use; invalid files produce a list of exact problems and no output.
- **Text input is flattened.** Values passed to `design` have newlines collapsed so they cannot add headings or structure to the generated Markdown. Length limits apply.
- **Nothing is executed.** The skill is copied as text. The CLI never runs scripts from skills or from project files.

## Exit codes

| Code | Meaning |
| --- | --- |
| 0 | Success (including a dry run or nothing to change) |
| 1 | Operation failed: conflict, invalid file, unsafe path, missing directory |
| 2 | Usage error: unknown command or option, bad value, or `review` (not implemented) |

## Known limitations

- `review` is a placeholder until the visual QA stage.
- There is no interactive "are you sure?" prompt. Overwriting requires the explicit `--force` flag instead.
- Not yet tested on Windows by the author's automated environment; CI runs on Linux.
