---
name: git-wt-analyze
description: Analyze all changes in the git working tree (staged, unstaged, and untracked files) and produce a ready-to-use Conventional Commits message, suggesting how to split unrelated changes into separate commits. Honors any commitlint or commit-hook rules in the project. Use whenever the user wants a commit message covering everything they have changed and not just what is staged, for example when they say "analyze my changes", "what should I commit", "write a commit for all my work", or run /git-wt-analyze. Prefer this over composing a message freehand so the project's conventions are respected.
---

# git-wt-analyze

Look at the entire working tree (staged, unstaged, and untracked) and turn it
into a commit message you can use right away, or a split proposal when the
changes cover unrelated concerns. This is the broader sibling of
`git-stage-analyze`, which looks only at the staging area.

## Workflow

### 1. Read the full working-tree state

```
git status --porcelain        # everything: staged, unstaged, untracked
git diff --staged             # staged changes
git diff                      # unstaged changes to tracked files
```

Untracked files do not show up in `git diff`. Get them from the `??` entries in
`git status --porcelain`, then read the new files directly (skip generated
output, build artifacts, lockfiles, and anything matched by `.gitignore`). For
binary or very large changes, rely on the status and stat output rather than the
full diff.

If the working tree is clean, say so and stop.

### 2. Detect the project's commit conventions

Do this before writing, because the project's rules override the defaults below.
See "Universal output rules" for what to look for: check for commit hooks, then
read any commitlint config.

### 3. Decide: one commit or several

Because the working tree often accumulates several unrelated edits at once,
splitting is common here. Group the changes by intent. If they serve one
cohesive purpose, write one message. If they clearly do not (a feature, an
unrelated fix, and a stray formatting change), propose a split: list each
suggested commit with the files that belong to it and a message for each, and
note the `git add <paths>` commands to stage each group. Do not run them unless
asked (see "Acting vs. suggesting").

### 4. Write the message

Follow the project's config if present; otherwise use the Conventional Commits
defaults below. Base the subject and body on what actually changed and *why*,
inferred from the diff and any new files. A good body explains intent and
consequences, not a line-by-line restatement.

### 5. Present the result

Show the final message in a fenced block so it is easy to copy. For a split,
show one block per commit, each with the files it covers. Do not commit unless
explicitly asked.

## Conventional Commits (default when the project has no stricter config)

Header: `<type>(<optional scope>): <subject>`

- **type**: one of `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
  `build`, `ci`, `chore`, `revert`.
- **scope**: optional, lowercase, the area changed. Omit rather than invent a
  vague one.
- **subject**: imperative mood ("add", not "added"/"adds"), starts lowercase, no
  trailing period, aim for 50 characters or fewer (or the commitlint limit).
- **body**: optional, separated by a blank line, wrapped near 72 columns.
  Include it when the change is non-trivial; skip it for trivial ones.
- **breaking changes**: signal with `!` after the type/scope and describe the
  break in the body.

**Example:**
Input: working tree has a new retry helper, its unit test, and an unrelated README typo fix
Output (split proposed):
```
feat(http): add exponential-backoff retry helper

Retry idempotent requests on 5xx and network errors with jittered
backoff, capped at five attempts.
```
```
docs: fix broken link in README quickstart
```

## Acting vs. suggesting

By default this skill only produces text. Do not run `git add`, `git commit`, or
`git restore` on your own. If the user explicitly asks you to stage a proposed
split or to commit, then run the commands, still respecting every universal rule
(pass the message with `-m`, never add a co-author trailer).

## Universal output rules

These apply to every message this skill produces, because the output goes
straight into git history where it should match project conventions and stay
clean.

1. **No co-author trailer and no footers.** Never add `Co-Authored-By:` or any
   other trailer/footnote.
2. **Conform to the project's enforced commit rules.** Detect them in this
   order, because a hook is what actually blocks a bad commit, and it usually
   delegates to a linter whose config spells out the rules:
   - **Commit hooks**: look for `.husky/` (especially `commit-msg`/`pre-commit`),
     `.git/hooks/commit-msg`, `.git/hooks/pre-commit`, `.pre-commit-config.yaml`,
     `lefthook.yml`/`lefthook.yaml`, or a `husky`/`simple-git-hooks` entry in
     `package.json`. These tell you what validation runs on commit.
   - **Commitlint config**: `commitlint.config.{js,cjs,mjs,ts}`, `.commitlintrc`,
     `.commitlintrc.{json,yaml,yml,js,cjs}`, or a `commitlint` key in
     `package.json`. If found, read it and honor its rules: allowed `type`s,
     `scope` requirements, header/body/line length limits, and case rules. The
     project config wins over the defaults in this file.
3. **No em dashes** anywhere in the output. Use a regular hyphen, a comma, or
   rephrase.
4. **No emojis** anywhere in the output.
