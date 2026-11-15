---
name: phased-plan
description: "Plans a piece of work in approved phases, with a per-phase protocol (progress file, filtered checks, commit message, context check, stop and wait). Manual only. Use by typing /phased-plan followed by the task. First checks which conventions the repo has, then explores read-only, asks about design decisions, and ends with ExitPlanMode."
disable-model-invocation: true
---

# phased-plan

The task is whatever the user wrote after the skill name: $ARGUMENTS

If that is empty, ask the user what the task is (ticket id, branch, constraints, anything already decided) before doing anything else.

Plan this work in phases. Do not write any code or change any file yet except the plan file. First explore with read-only tools, ask me questions where my decision changes the plan, then give me the plan for approval.

## Step 0: repo readiness check

Read-only. Before exploring the task, detect which conventions this repo actually has, so the plan follows the repo and not an assumption.

Check, and print one table with found or missing per row:

- Rules: `CLAUDE.md`, `.claude/rules/`, a repo-local `.claude/phased-plan.rules.md`, commitlint or commit hooks, the commit footer style seen in `git log`.
- Tooling: package manager (from the lockfile), formatter and linter config, test script, type-check script.
- Structure: migrations folder, ADR folder (`docs/adr` or similar), `CODEOWNERS`, shared packages that commit build output.
- Workflow: `.scratchpad/` present and gitignored (`git check-ignore`), a ticket id on the branch, integration branch and `origin/main` reachable, docker or compose files, the `compact-resume` skill installed.

Choose the rules file: `.claude/phased-plan.rules.md` if the repo has one, otherwise [references/default-rules.md](references/default-rules.md). It lists, for each rule, what to detect.

For every gap, ask once (AskUserQuestion): skip that rule, or use the bundled default. Recommend one in a line. A rule whose files are absent is dropped from the plan unless the user picks the default. Record every answer under Decisions in the plan.

## The task

TASK: as given above.

## HOW TO PLAN

1. Explore first. Use Explore subagents for broad searches; read the key files yourself. Reuse existing utilities and patterns, name them with file paths. Do not propose new code where something suitable exists.
2. Ask me (AskUserQuestion) about every decision that changes the design: dependencies, scope, rollout, naming, where things live. Recommend an option and say why in one line. Do not ask about things you can verify in the repo.
3. Write the plan to the plan file with these sections: Context (why, what prompted it, intended outcome), Decisions (mine, confirmed), Design, Execution phases, Critical files, Verification. Keep it scannable. Only the recommended approach, no alternatives.
4. Follow the repo rules: CLAUDE.md, .claude/rules, and the rules file chosen in Step 0 (commit conventions, language and style rules, and the rest of what it lists).

## EXECUTION PHASES (use this skeleton; add and remove phases to fit)

Phase 0 runs only after the plan is approved. It creates the progress file, which is why the "no file changes" rule above applies to the planning step only.

Protocol that applies to every phase:
- Before and after each phase, update the scratchpad progress file (tick the checklist, log decisions and findings, record commit hashes).
- After each phase: run only the filtered tests, type-check and lint for touched packages; format only dirty files using the formatter from the rules file; give me the commit message and a one-line git add; commit only when I say so; never push, never --no-verify.
- Then check the context window usage (and the usage windows if available) and tell me explicitly whether to run the compact-resume skill before the next phase. Suggest it from about half the context, and always before a heavy phase. If context nears three quarters, finish or revert the in-flight edit, update the progress file and ask for compact-resume. If the compact-resume skill is not installed, say so, update the progress file, and give me a short manual summary to paste after /compact.
- Then stop and wait for me before the next phase.

Phase 0, preflight (no code changes):
- Create the gitignored scratchpad progress file FIRST: .scratchpad/<ticket>.progress.md at the repo root (verify with git check-ignore). Layout: title and branch; link to the approved plan file (it may not survive, this file is the source of truth after compaction); Resume instructions (read this file fully, find the first unchecked phase, the per-phase protocol, never push, plus the resume rules from the rules file); Decisions (user confirmed); Findings (do not re-explore); Baseline test results; phase checklist with [ ] lines (tick with [x], date, one-line outcome, commit hashes); dated decisions log. If there is no ticket id on the branch, ask me, and use a temporary name until I answer.
- Confirm branch and clean tree. git fetch and report distance from origin/<integration branch> and origin/main; ask before merging or rebasing.
- Record baseline test failures for every package or service the work touches, plus the known pre-existing failures listed in earlier scratchpad notes, so new failures stand out.
- Confirm the dev stack is up, using the services the rules file names. I run docker myself: tell me what to start, never start or edit infra. Confirm test logins for the roles involved; create local throwaway users if missing, never touch a teammate's account.
- Resolve open facts by reading the repo: next migration number and journal shape, next ADR number (when those exist), existing patterns to copy, error classes, naming, shared packages that commit dist, anything the plan assumes.
- List the existing tests that will need edits and the docs that will go stale.
- Flag review gates for the PR notes, using the gates the rules file lists.
- Ask me about anything that depends on another team before the phase that needs it.

Then the work phases, fitted to the repo and the rules file (it lists the typical order). End with final verification and a report of what was and was not verified.

## PLAN QUALITY BAR

- Every phase says what changes, which files, which tests prove it, and its commit message.
- Performance, security and failure behaviour are stated where they matter.
- Open questions that can wait are listed under "Open points" instead of blocking the plan.
- End with ExitPlanMode for my approval, not a text question.
