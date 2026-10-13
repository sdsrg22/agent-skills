# compact-resume contract

The input/output contract for the `compact-resume` skill. This file is for
people deciding whether to trust and adopt the skill. Claude does not need it to
run the skill; the behavior lives in `SKILL.md`. If the two ever disagree,
`SKILL.md` is what actually runs, so update this file when that changes.

Contract version: 1.0

> **Status:** this contract was written from `SKILL.md`. The behavior below has
> not yet been confirmed by test runs. Remove this note once it has been.

## Purpose

You compact a long Claude Code session by hand: run `/compact`, then paste a
resume prompt. This skill prepares that resume prompt. It writes a detailed
handoff summary, saves it to disk, and prints one short ready-to-paste block
that tells Claude to read that file. It never runs `/compact` itself.

Claude Code only. It depends on `/compact`, local files, and git, so it is not
packaged for Claude.ai chat.

## Input

| Input | Required | Notes |
|-------|----------|-------|
| A request to compact or hand off | yes | For example "may I compact", "compact now", "summarize for handoff", or "give me the resume prompt". It can also be used when the context or usage window is nearly full. |
| A git repository | no | Used for the branch, `git status`, and recent commits. Without one, the skill works in the current directory. |
| A progress file | no | Looked for in this order: a `.scratchpad/` file named after the branch's ticket token and containing `progress`, any other `.scratchpad/*.md`, then `HANDOFF.md`, `PROGRESS.md`, `TODO.md` at the repo root. |
| The session usage tool | no | `mcp__ccd_session_mgmt__get_usage`, available only in the Claude desktop app. If it is missing, the usage step is skipped. |

## Output

In this order:

1. A one or two sentence answer to "may I compact now?". When the usage tool is
   available, the context and usage-window percentages are reported too.
2. One short fenced block: the resume prompt, which names the absolute path of
   the saved summary file and tells Claude to read it in full first, restate the
   goal and next step, re-read every file the summary lists, and then continue.
3. One closing line: `Saved to <path>. Run /compact, then paste the block above.`
   Nothing follows it.

The summary itself is not printed in the chat. It lives in the saved file. If
the file cannot be written or confirmed, the skill says so and prints the resume
prompt with the full summary pasted in instead (the fallback).

## Files read and written

| File | Action | When |
|------|--------|------|
| Progress file (`.scratchpad/*`, `HANDOFF.md`, and so on) | Read, then updated | Only if the project already has one. Finished items are ticked, "Up next" is rewritten, and the last commit, usage reading, decisions, and blockers are recorded. |
| `<same prefix>.resume.md`, next to the progress file | Written | Every run. Replaces any older copy. |
| `.handoff/<branch>.resume.md` | Written | Fallback when no progress file exists. |
| `.handoff/resume.md` | Written | Fallback when there is no git repository. |

Nothing else is written.

## Guarantees

1. **It never runs `/compact`.** You run it yourself.
2. **No secret values.** Only environment variable names appear in the summary.
3. **No invented state.** Status comes from the progress file and git, not from
   memory. If it is unsure whether something is done, it reads the file or the log.
4. **No new progress file.** In a project that does not use one, it does not
   create one. It uses the `.handoff/` fallback instead.
5. **A candid readiness answer.** It says "not yet" when there is uncommitted
   partial work, and says what to finish or commit first. It still prepares the
   handoff if you insist.
6. **One block, nothing trailing.** Exactly one fenced block and the closing
   line, with nothing after it.
7. **The pointer is real.** The path in the prompt is absolute, so it works even
   if the next session starts in another folder, and the skill checks that the
   file exists and is not empty before printing it.
8. **The project's own style rules apply.** It follows the project's `CLAUDE.md`
   for writing and style.

## Edge cases

| Situation | Behavior |
|-----------|----------|
| No progress file | Writes `.handoff/<branch>.resume.md` and tells you to gitignore `.handoff/`. |
| No git repository | Works in the current directory and writes `.handoff/resume.md`. |
| Uncommitted partial work | Answers "not yet" and says what to finish or commit first. |
| Usage tool unavailable | Skips the usage reading. |
| An older `.resume.md` exists | Replaces it. |
| The summary file cannot be written or confirmed | Says so and prints the resume prompt with the full summary pasted in. |

## Non-goals

- It does not run `/compact` or resume the session for you.
- It does not commit anything.
- It does not run your tests. When it judges readiness, it relies on what the
  progress file and git show.
- It does not work in Claude.ai chat.

## Known limits

- The summary is only as good as the session and the progress notes it can read.
  Read it before you rely on it.
- It writes files into your project. `.handoff/` is only reminded about, not
  ignored for you, and `.scratchpad/` or `HANDOFF.md` may already be tracked by
  git. A summary can hold sensitive detail, so check before you commit one.
- The usage reading needs a tool that appears to exist only in the Claude desktop
  app. Where the tool is missing, the reading is skipped.
