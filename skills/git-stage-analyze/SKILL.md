---
name: git-stage-analyze
description: Analyze the files in the git staging area and produce a ready-to-use commit message in Conventional Commits format, honoring any commitlint or commit-hook rules in the project. Use this whenever the user has staged changes and wants a commit message, for example when they say "analyze staged files", "write a commit for what's staged", "suggest a commit message", mention they are "about to commit" staged work, or run /git-stage-analyze. Prefer this skill over composing a commit message freehand so the project's conventions are respected.
---

# git-stage-analyze

Turn the contents of the staging area into a single, well-formed commit message
(or a split proposal when the staged changes cover unrelated concerns). The goal
is a message you can paste straight into `git commit` that will pass the
project's own checks.

## Workflow

### 1. Read what is staged

Run these to see the staged changes (and nothing else):

```
git diff --staged --stat      # overview of files and churn
git diff --staged             # the actual changes
```

If nothing is staged, say so and stop. Do not fall back to the working tree
here. That is what `git-wt-analyze` is for.

For staged-but-binary or very large diffs, lean on `--stat` and the file paths
rather than dumping the whole diff.

### 2. Detect the project's commit conventions

Do this before writing anything, because the project's rules override the
defaults below. See "Universal output rules" for exactly what to look for. The
short version: check for commit hooks, then read any commitlint config.

### 3. Decide: one commit or several

Group the staged changes by intent. Most of the time it is one cohesive change
and you write one message. But if the staged files clearly serve unrelated
purposes (for example a bug fix plus an unrelated dependency bump plus a typo in
docs), the honest thing is to flag it: a single commit would bundle unrelated
work and make history harder to read or revert.

When that happens, propose a split: list each suggested commit with the files
that belong to it and a message for each. Mention the `git restore --staged`
/ `git add` commands the user would run to stage each group, but do not run them
unless asked (see "Acting vs. suggesting").

### 4. Write the message

Follow the project's config if present; otherwise use the Conventional Commits
defaults below. Base the subject and body on what actually changed and *why*,
which you infer from the diff. A good body explains intent and consequences, not
a line-by-line restatement of the diff.

### 5. Present the result

Show the final message in a fenced block so it is easy to copy. If you proposed
a split, show one block per commit. Do not commit unless explicitly asked.

## Conventional Commits (default when the project has no stricter config)

Header: `<type>(<optional scope>): <subject>`

- **type**: one of `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
  `build`, `ci`, `chore`, `revert`.
- **scope**: optional, lowercase, the area changed (module, directory, or
  feature name). Omit it rather than inventing a vague one.
- **subject**: imperative mood ("add", not "added"/"adds"), starts lowercase, no
  trailing period, aim for 50 characters or fewer (or the commitlint limit).
- **body**: optional, separated from the header by a blank line, wrapped near 72
  columns. Include it when the change is non-trivial and explains the what and
  why. Skip it for genuinely trivial changes.
- **breaking changes**: signal with `!` after the type/scope (e.g.
  `feat(api)!: ...`) and describe the break in the body.

**Example:**
Input: staged changes add JWT verification middleware and wire it into the login route
Output:
```
feat(auth): add JWT verification middleware

Validate bearer tokens on protected routes and reject expired or
malformed tokens before they reach the handler. Login now issues a
signed token on success.
```

## Acting vs. suggesting

By default this skill only produces text. Do not run `git commit`, `git add`, or
`git restore` on your own. If the user explicitly asks you to commit or to stage
a particular split, then go ahead and run the commands, still respecting every
universal rule (for instance, pass the message with `-m` and never add a
co-author trailer).

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
