---
name: compact-resume
description: Prepares a safe context compaction and resume for long multi-chunk work in any project. Use when the user asks "may I compact", "compact now", "summarize for handoff", "give me the resume prompt", or when the context window or the usage window is nearly full. Checks git state and usage when available, updates the project's progress notes, saves a detailed handoff summary to disk, and prints a short ready-to-paste resume prompt that points at the saved file. It cannot run /compact itself.
---

# compact-resume

The user compacts manually: they run `/compact`, then paste a short resume prompt that tells Claude to read the saved summary file. This skill writes the summary, saves it to disk, and prints that resume prompt. It never runs `/compact`.

## Steps

1. Find the working notes. Run `git branch --show-current` and note any ticket or topic token in it. Look for a progress file in this order: `.scratchpad/` (a file whose name starts with the ticket token and contains `progress`), any other `.scratchpad/*.md`, then `HANDOFF.md`, `PROGRESS.md`, `TODO.md` at the repo root. If none exists, use `.handoff/<branch>.resume.md` as the only output file, and tell the user to gitignore `.handoff/`. If no git repo exists, use the current directory and `.handoff/resume.md`.
2. Check readiness. Run `git status --short` and `git log --oneline -5`. If the session usage tool is available (`mcp__ccd_session_mgmt__get_usage`, load it with ToolSearch if it is deferred), call it and report the context percent and the usage window percent with its reset time; if it is not available, skip it. Answer "may I compact now?" first, in one or two sentences:
   - Yes at a chunk boundary: the last chunk is committed, tests are green, the tree is clean or only holds work recorded as partial.
   - Not yet if there is uncommitted partial work: say what to finish or commit first. Still prepare the handoff if the user insists.
3. Update the progress file if one exists: tick finished items, rewrite "Up next", record the last commit sha and the usage reading, add new decisions or blockers. Do not create a progress file in a project that does not use one.
4. Write the summary using the Summarization prompt below. Ground it in the progress file and git, not memory. Add a "Pointers" section with the progress file path, any plan file path from this session, the branch, the last commit sha, and the usage numbers. Save it next to the progress file as `<same prefix>.resume.md` (for example `.scratchpad/ABC-123.resume.md`), replacing any older copy. Work out the absolute path of the saved file, and after writing it confirm that it exists and is not empty.
5. Print exactly one fenced block: the Resume prompt below, with `<path>` replaced by the absolute path of the saved file. Use the absolute path because the resumed session may start in a different folder. Do not print the summary in the chat, because it lives in the file. If the file could not be written or confirmed, say so and use the fallback in the Resume prompt section instead. Then one line: "Saved to <path>. Run /compact, then paste the block above." Add nothing else after that line.

## Rules

- Never include secret values, only env variable names.
- Never invent state. If unsure whether something is done, read the file or the git log.
- Follow the project's own writing and style rules (its CLAUDE.md), not a fixed set.
- Keep the summary exhaustive on points 3 to 7 and short elsewhere.

## Summarization prompt

Summarize this session for handoff. Preserve:

1. Goal: the exact task and the success criteria I stated.
2. Decisions made, the reasons for them, and options rejected with their reasons.
3. Current state: every file touched (full path), what changed in each, what is complete, what is partial.
4. Code: exact function, class, route, and table names with signatures. Keep verbatim any snippet whose exact text matters.
5. Errors: exact error messages, root causes, fixes that worked, and attempts that failed.
6. Open questions and blockers.
7. Next steps, in order.
8. Constraints and preferences I stated (stack, formatting, style rules, no comments, early returns, etc.).
9. Environment: versions, commands run, test results, and env variable names (never values).

Drop small talk and superseded attempts. Use section headers. Be exhaustive on points 3 to 7.

## Resume prompt

Resume from the handoff summary saved at <path>. Before taking any action:

1. Read that file in full.
2. Restate the goal and the next step in two sentences.
3. Re-read every file listed in the summary and confirm its current state. Do not trust the summary blindly.
4. Ask me only if a blocker or ambiguity changes the next step.

Then carry out step 1 of the next steps.

### Fallback

Use this only when the summary file could not be written or confirmed. Print the prompt above with "saved at <path>" changed to "below" and item 1 removed, then paste the full summary after it. Use a fence longer than any backtick run inside, such as four backticks.
