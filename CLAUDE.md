# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Commits

- **Do not run `git commit` (or any committing command).** The user makes all
  commits themselves. Stage changes only if asked.
- When a commit is appropriate, **propose a commit message** for the user to use
  rather than committing.
- Commit messages must follow **Conventional Commits** with **only a header and
  body** — no footers. In particular, **no `Co-Authored-By` trailer** or any
  other footnote.

  ```
  <type>(<optional scope>): <header>

  <body explaining what and why>
  ```
