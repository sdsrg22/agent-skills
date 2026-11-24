# Default rules for phased-plan

The bundled defaults, written for a pnpm monorepo with Postgres, Valkey and Kong. A repo can replace this whole file with `.claude/phased-plan.rules.md`. Step 0 of SKILL.md checks each row below and asks the user about gaps.

## What to detect

| Rule | Detector | If missing |
| --- | --- | --- |
| pnpm only | `pnpm-lock.yaml` | use the repo's own package manager, or ask |
| ESM, explicit return types | `"type": "module"`, tsconfig | drop |
| Migrations idempotent, replayed into a fresh schema | migrations folder, journal file | drop migration phases |
| ADRs | `docs/adr` or `docs/decisions` | drop, or ask whether to start one |
| Contracts first | shared contracts or API schema package | drop |
| Commit style and Refs footer | commitlint config, `git log` | follow `git log` style |
| Gitignored `.scratchpad/` | `git check-ignore .scratchpad` | ask before adding it to `.gitignore` |
| Dev stack (Postgres, Valkey, Kong) | docker or compose files | ask which services matter |
| Review gates | `CODEOWNERS`, DBA or DevOps docs | ask who reviews what |
| Prettier on dirty files | prettier config | use the repo's formatter, or skip |

## Rules (original wording)

Follow the repo rules: CLAUDE.md, .claude/rules, commit conventions (type(scope): subject, Refs: footer), no emojis, no em or en dashes, ESM, explicit return types, idempotent migrations, contracts first, docs kept in sync, new ADR when a decision changes.

Format only dirty files (git ls-files -m -o --exclude-standard into pnpm exec prettier --write).

Resume instructions for the progress file: read this file fully, find the first unchecked phase, the per-phase protocol, never push, no emojis or dashes, edit via Read/Write/Edit, pnpm only, LF only, user runs docker, no unasked infra edits.

Confirm the dev stack is up (Postgres, Valkey, Kong, the services involved). I run docker myself: tell me what to start, never start or edit infra. Confirm test logins for the roles involved; create local throwaway users if missing, never touch a teammate's account.

Resolve open facts by reading the repo: next migration number and journal shape, next ADR number, existing patterns to copy, error classes, naming, shared packages that commit dist, anything the plan assumes.

Flag review gates for the PR notes: contracts need all-team approval, migrations need DBA review (and the grants script after new tables), Dockerfile or compose changes need DevOps review, new dependencies need approval, CODEOWNERS changes need tech-lead approval.

Ask me about anything that depends on another team (DevOps, DBA) before the phase that needs it.

Then the work phases, typically: ADR or docs decision, contracts, migrations and schema (replay every tenant migration into a fresh schema in a rolled-back transaction), backend by service (tests first), frontend or shared packages, docs and handoff, final verification with a report of what was and was not verified.
