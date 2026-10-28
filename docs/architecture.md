# Architecture

Monorepo managed by pnpm workspaces. Each package has one job and real code.

- `packages/design-tokens`: the single source of truth for the design-system data model. Validation, defaults, JSON/CSS export. Zero runtime dependencies. The web app, CLI, and skill templates will all import from here, so nothing re-implements validation.

- `packages/skills`: the bundled `landing-page-design` skill (Markdown only) plus a small helper that parses and lists it. Tests guard its structure.

Planned (not yet built): `packages/cli`, `packages/visual-qa`, `apps/web`.

## Principles

- Local-first: everything works with no account, API key, or network.
- Untrusted input (imports, CLI args) is validated before use. Validators return result objects instead of throwing.
- Values that end up in CSS are restricted to safe character sets.
