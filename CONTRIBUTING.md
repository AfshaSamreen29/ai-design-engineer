# Contributing

1. Fork and clone, then `pnpm install`.
2. Make a focused change with tests. Tests must be deterministic and must not need credentials or network access.
3. Run `pnpm typecheck && pnpm test` before opening a pull request.
4. Do not claim a feature works in docs unless it is implemented and tested.
5. Never commit `.env` files or secrets.

Commit messages follow Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
