---
name: git-pr-write
description: Write a pull request title and description from a range of commits. Analyzes the commit messages (falling back to the diff when the messages are unclear) and fills the repository's PR template if one exists, otherwise a default Summary/Changes/Testing structure. Honors commitlint or commit-hook rules for the title. Use whenever the user is about to open a PR and wants the title and body written, for example when they say "write a PR description", "draft my pull request", "PR title and body for these commits", or run /git-pr-write. Prefer this over composing PR text freehand so the repo's template and conventions are respected.
---

# git-pr-write

Produce a clear pull request title and description for a change the user is
about to open. The description is grounded in the commits on the branch, or in
the diff when the commit messages do not say enough.

## Workflow

### 1. Establish the target branch, then the commit range

A PR is defined by what it merges *into*, and the base branch determines both
the commit range and the entire diff the description is built from. Guessing it
wrong produces a confident but misleading PR, so settle the target branch first.

- If the user already named the target branch (or gave a commit range or an
  explicit set of commits), use it.
- Otherwise, detect the most likely base and ask the user to confirm it. Do not
  silently pick one:

  ```
  git symbolic-ref --short refs/remotes/origin/HEAD   # e.g. origin/main -> default base
  git branch --show-current                           # current branch
  ```

  If `origin/HEAD` is not set, the likely base is `main`, then `master`,
  whichever exists. Offer it and wait for confirmation, for example: "I'll base
  this on `main` unless the PR targets a different branch. Is that the target?"

Once the target branch is settled, the commit range is `<base>..HEAD`: the
commits on the current branch that are not yet on the base.

### 2. Read the commits

```
git log <base>..HEAD --format='%H%n%s%n%b%n----'    # subjects + bodies
git diff <base>...HEAD --stat                        # files touched (note the three dots)
```

Judge the quality of the commit messages. If they are descriptive and
conventional, let them drive the PR text: the subjects become the backbone of
the change list, and the bodies supply the rationale.

If the messages are unclear (terse like "wip", "fix", "stuff", "update", or
they contradict the diff), do not trust them. Read the actual changes instead:

```
git diff <base>...HEAD
```

and base the PR on what the code does. It is fine to mix: trust the good
messages, and supplement from the diff where they fall short.

### 3. Detect the PR template

Look for a template, in this order, and use the first that exists:

- `.github/pull_request_template.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `PULL_REQUEST_TEMPLATE.md` (repo root or `docs/`)
- any file under `.github/PULL_REQUEST_TEMPLATE/` (multiple templates; if there
  is more than one, ask which to use)

If a template exists, fill out its sections faithfully and keep its headings,
checklists, and HTML comments structure (replace placeholder comments with real
content; leave checklist items unchecked unless you can tell they are satisfied).
If no template exists, use the default structure below.

### 4. Write the title

Make the title a concise, self-contained summary of the whole change. By default
use Conventional Commits style for the title (`type(scope): subject`), since
that is what most squash-merge and release-automation setups expect, and honor
any commitlint config the same way the commit skills do. If the repo clearly
uses a different title convention (visible in recent merged PR titles or the
template), match that instead.

### 5. Present the result

Output the title on its own, then the description in a fenced block so it is easy
to copy. Do not create the PR unless explicitly asked (see "Acting vs.
suggesting").

## Default description structure (when there is no repo template)

```
## Summary

One short paragraph: what this PR changes and why it matters.

## Changes

- Bullet per meaningful change, grouped logically (not one bullet per commit
  unless that maps cleanly).

## Testing

- How the change was verified: tests added or run, manual steps, or "not yet
  tested" if that is the truth.
```

Adapt sensibly: drop "Testing" if there is genuinely nothing to say, add a
"Breaking changes" or "Migration" section when the diff warrants it. Keep it
honest. Do not claim tests were run if you cannot see evidence of it.

## Acting vs. suggesting

By default this skill only produces text. Do not run `gh pr create` or push on
your own. If the user explicitly asks you to open the PR and `gh` is available,
you may create it with the generated title and body; if `gh` is not installed,
say so and hand back the text instead.

## Universal output rules

These apply to all PR text this skill produces, because it lands in the
repository's PR history where it should match conventions and stay clean.

1. **No co-author trailer and no footers.** Never add `Co-Authored-By:` or any
   other trailer/footnote to the title or body.
2. **Conform to the project's enforced commit rules** for the title. Detect them
   in this order, because a hook is what actually blocks a bad title, and it
   usually delegates to a linter whose config spells out the rules:
   - **Commit hooks**: look for `.husky/`, `.git/hooks/commit-msg`,
     `.pre-commit-config.yaml`, `lefthook.yml`/`lefthook.yaml`, or a
     `husky`/`simple-git-hooks` entry in `package.json`.
   - **Commitlint config**: `commitlint.config.{js,cjs,mjs,ts}`, `.commitlintrc`,
     `.commitlintrc.{json,yaml,yml,js,cjs}`, or a `commitlint` key in
     `package.json`. If found, honor its allowed `type`s, `scope` rules, and
     header length limits for the title.
3. **No em dashes** anywhere in the output. Use a regular hyphen, a comma, or
   rephrase.
4. **No emojis** anywhere in the output.
