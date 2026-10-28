# Design skills

A skill is a folder of instructions an AI coding agent reads before doing a certain kind of work. AI Design Engineer bundles one original skill:

| Skill | Purpose | Location |
| --- | --- | --- |
| `landing-page-design` | Concept, design system, copy, build, accessibility, and screenshot review for landing pages | `packages/skills/landing-page-design/` |

The skill is plain Markdown. It contains no scripts, executes nothing, and needs no dependencies, so it can be copied into any project.

## Contents

```
landing-page-design/
├── SKILL.md          # the workflow (frontmatter: name, description)
├── LICENSE           # MIT, covers the skill content
├── references/       # deeper guidance the workflow links to
│   ├── visual-concepts.md
│   ├── page-structures.md
│   ├── copywriting.md
│   ├── accessibility-and-semantics.md
│   └── verification.md
└── templates/
    ├── design-brief.md
    └── project-instructions.md
```

## Installing manually

Until the CLI's `skill install` command exists (planned for Stage 3), copy the folder yourself. Agents differ, and their conventions change, so confirm against your agent's current documentation.

**Claude Code**

```bash
# project-level
mkdir -p .claude/skills && cp -r path/to/ai-design-engineer/packages/skills/landing-page-design .claude/skills/
```

On Windows Command Prompt:

```cmd
xcopy /E /I path\to\ai-design-engineer\packages\skills\landing-page-design .claude\skills\landing-page-design
```

**Codex and other agents that read `AGENTS.md`**: copy the folder into your repository (for example `docs/skills/landing-page-design/`) and add a line to `AGENTS.md` telling the agent to follow `SKILL.md` for landing pages. A ready-made snippet is in `templates/project-instructions.md`.

**Cursor**: create a rule under `.cursor/rules/` that points at the skill. See the same snippets file.

Do not expect identical behavior across agents. Some load skills automatically from the description; others need an explicit instruction.

## Safety

- Skills are text. Review any skill you install, including this one, before relying on it.
- The importer in this project never executes files from a skill.
- A skill can only influence an agent through its instructions; it cannot grant permissions the agent does not already have.

## Tests

`pnpm test` checks that the skill's frontmatter is valid, every required section exists, all linked reference files exist, no bundled file is orphaned, no executable scripts are shipped, and no work-in-progress markers remain. These tests verify structure, not whether the advice produces good designs. Judge that by using it.

## Contributing to the skill

Keep edits specific and testable. Prefer concrete rules and decision criteria over general advice, and avoid layout prescriptions that would make every site look the same.
