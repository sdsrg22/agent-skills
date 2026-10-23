# claude-skills

A collection of personal, reusable [Claude Code](https://docs.claude.com/en/docs/claude-code/skills)
skills. Each skill is a self-contained directory that copies cleanly into any
Claude Code installation.

## Skills

| Skill | What it does | Invoke with |
|-------|--------------|-------------|
| [`git-stage-analyze`](skills/git-stage-analyze/SKILL.md) | Analyzes the staging area and suggests a Conventional Commits message, flagging when staged changes should be split into separate commits. | `/git-stage-analyze` |
| [`git-wt-analyze`](skills/git-wt-analyze/SKILL.md) | The same analysis across the whole working tree, including unstaged and untracked files. | `/git-wt-analyze` |
| [`git-pr-write`](skills/git-pr-write/SKILL.md) | Writes a PR title and description from a commit range, confirming the target branch and filling the repo's PR template when present. | `/git-pr-write` |
| [`jira-client-update`](skills/jira-client-update/SKILL.md) | Rewrites a rough engineer-written Jira comment into a client-ready update without inventing facts. Has an internal mode for teammates. | `/jira-client-update` |
| [`compact-resume`](skills/compact-resume/SKILL.md) | Prepares a safe `/compact`: saves a handoff summary to disk and prints one ready-to-paste resume prompt. **Claude Code only.** | `/compact-resume` |

You can also just describe the task in plain language and Claude can pick the
right skill.

### Git skills

The three git skills generate Conventional Commits messages and pull request
text. They share these rules, embedded in each `SKILL.md` so the folders stay
independent:

1. Never add a `Co-Authored-By` trailer or any other footer to generated commit
   messages or PR text.
2. Conform to the project's enforced commit rules. They check for commit hooks
   (husky, lefthook, pre-commit, `.git/hooks`) and then any commitlint config,
   and honor its allowed types, scopes, and length limits.
3. No em dashes in the output.
4. No emojis in the output.

By default they only produce text. They commit, stage, or open a PR only when you
explicitly ask.

### jira-client-update

Paste a rough Jira comment and get back a comment you can post to a client. The
rewrite keeps the real status of the work and reads calm, confident, and
specific. It is meant to be shared with a team, so its behavior is written down
in [`CONTRACT.md`](skills/jira-client-update/CONTRACT.md).

- **Input:** the rough comment, plus optional hints (`type`, `status`,
  `audience`). The hints are inferred from the comment when you leave them out,
  and they never add facts.
- **Output:** the comment only, in plain text, usually one to three short
  paragraphs, with no preamble or explanation.
- **Client mode (default)** translates engineering shorthand, drops internal
  context, and closes with what is actually happening next.
- **Internal mode** (say the comment is for your team) keeps technical detail and
  only cleans up tone and clarity.
- **It asks one question instead of guessing** when the status is unclear or a
  hint conflicts with the comment.

It never invents causes, fixes, dates, test results, or promised follow-ups. It
can only be as honest as the comment you give it, so read the result before
sending it to a client.

### compact-resume

For long Claude Code sessions you compact by hand. Ask "may I compact" or run
`/compact-resume`, and it:

1. checks git state and, where available, your usage,
2. tells you whether it is a safe moment to compact,
3. updates your project's progress file if it has one,
4. saves a detailed handoff summary next to it as `<prefix>.resume.md`, and
5. prints one short block to paste after you run `/compact`. The block points
   Claude at the saved file by its absolute path and tells it to read it first,
   so the long summary never has to be pasted.

It never runs `/compact` itself and never includes secret values. It **writes
files into your project**, so read [`CONTRACT.md`](skills/compact-resume/CONTRACT.md)
for exactly which ones. It is Claude Code only, so it is not packaged for
Claude.ai chat.

## What is a skill?

A skill is a directory that packages instructions (and optionally scripts and
resources) Claude loads on demand. Each skill lives in its own folder and is
defined by a `SKILL.md` file with YAML frontmatter.

```
skills/
  <skill-name>/
    SKILL.md        # required: frontmatter (name, description) + instructions
    scripts/        # optional: helper scripts the skill can run
    references/     # optional: docs/resources loaded as needed
```

A `SKILL.md` looks like this:

```markdown
---
name: my-skill
description: One-line summary of what the skill does and when to use it.
---

# My Skill

Instructions for Claude go here...
```

Keep the `description` specific, since it is what Claude uses to decide when the
skill is relevant. Avoid a colon followed by a space in the description value:
unquoted, that is parsed as YAML and breaks the frontmatter.

## Installing

Pick the guide for how you use Claude:

| You use | Guide |
|---------|-------|
| Claude Code in VS Code, the Claude Code CLI, or the Code tab in the desktop app | [docs/install-claude-code.md](docs/install-claude-code.md) |
| claude.ai in the browser, or the desktop chat | [docs/install-claude-chat.md](docs/install-claude-chat.md) |

If you use both groups, install in both. They do not share an install.

For Claude Code, the quickest route is the installer. It copies every skill in
`skills/` into `~/.claude/skills/`:

```bash
bash scripts/install.sh
```

On Windows PowerShell, run `powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1`
instead. Pass a skill name to install just that one. Run the installer again
after pulling or editing a skill, since it replaces the installed copy.

Personal skills live in `~/.claude/skills/<skill-name>/`. To scope a skill to a
single project, put it in `.claude/skills/<skill-name>/` inside that project.

## Building the packages

The `.skill` files for Claude.ai are generated, so nobody edits them by hand.
You need [Bun](https://bun.sh). From the repo root:

```bash
bun install            # once, installs the zip library
bun run build          # writes dist/<skill-name>.skill for every skill
bun run build jira-client-update   # or just one
bun run clean          # deletes dist/
```

The build checks each skill's frontmatter first (valid YAML, `name` matches the
folder, `description` present) and stops with a clear error if it is wrong, so a
broken skill never gets packaged. Skills listed in `CLAUDE_CODE_ONLY` in
`scripts/build-skills.ts` (currently `compact-resume`) are validated but not
packaged, because they cannot run in Claude.ai chat. Local `evals/` and `node_modules/` folders are
left out. The output is reproducible: building unchanged skills produces an
identical file.

### Releasing

Two GitHub Actions workflows live in `.github/workflows/`:

- `check.yml` runs the build on every push to `main` and on every pull request,
  so a skill with broken frontmatter fails before anyone installs it.
- `release.yml` runs when you push a tag that starts with `v`. It builds every
  skill and attaches the `.skill` files to a GitHub release.

To publish a new version:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Chat users then download the `.skill` file from the repository's Releases page.
Bump the version in a skill's `CONTRACT.md` when its guarantees change, and tag
a new release when you want people to pick up the change.

## Using with other agents

These skills are packaged for Claude Code, but the instructions themselves are
plain markdown, so they are largely portable. The git skills run ordinary `git`
commands. `jira-client-update` needs no tools at all, since it only rewrites the
text you give it.

What is Claude-specific:

- The `SKILL.md` frontmatter format and how it is discovered and loaded.
- The install paths under `.claude/skills/` and `/skill-name` invocation.
- Description-based auto-triggering, which relies on Claude's skill loader.

To use a skill with another coding agent:

1. Copy the body of the `SKILL.md` (everything below the frontmatter) into that
   tool's instruction mechanism, for example an `AGENTS.md`, Cursor rules, or a
   Copilot instructions file.
2. Invoke it by describing the task, since slash commands and auto-triggering
   will not exist there.
3. For the git skills, make sure the agent can run `git` in your repo. In a
   chat-only tool, paste the output of `git diff --staged`, `git status`, or
   `git log` yourself.

Some other agent tools may support the `SKILL.md` convention directly. Check
their documentation, as these skills have only been tested in Claude Code.
