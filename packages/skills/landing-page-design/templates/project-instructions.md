# Project instruction snippets

Paste the relevant snippet into your project's agent instruction file. Edit the paths to match where you installed the skill. Agents differ in how they load instructions, so check your agent's current documentation and do not assume identical behavior.

## Claude Code

Install the skill folder at `.claude/skills/landing-page-design/` (project) or `~/.claude/skills/landing-page-design/` (personal). Optionally add to `CLAUDE.md`:

```markdown
## Design
When building or redesigning landing pages or marketing sites, follow the
`landing-page-design` skill. Define tokens before components, write real copy,
verify at 375, 768 and 1440 px, and report assumptions and limits.
Design tokens live in `design/tokens.css`.
```

## Codex and other agents that read AGENTS.md

Copy the skill folder to a path in your repository, for example `docs/skills/landing-page-design/`, then add to `AGENTS.md`:

```markdown
## Design
For landing pages and marketing sites, read and follow
`docs/skills/landing-page-design/SKILL.md` before writing code.
Use the tokens in `design/tokens.css`. Do not invent testimonials, logos or
statistics. Verify at 375, 768 and 1440 px and summarise what you checked.
```

## Cursor

Create `.cursor/rules/landing-page-design.mdc` that points to the skill, or paste the contents of `SKILL.md` into a rule that applies to your front-end files. Keep the `references/` folder in the repository so the rule can link to it.

## Any other agent

Place the folder somewhere in the repository and add one line to whatever instruction file the agent reads: "For landing pages, follow `path/to/SKILL.md`."

## Project-specific additions

Add short, factual project rules below the snippet, for example:

```markdown
- Styling: Tailwind CSS with tokens mapped in `tailwind.config.ts`.
- Fonts: self-hosted in `public/fonts`.
- Brand voice: plain, dry, no exclamation marks.
```
