# claude-skills

A collection of personal, reusable [Claude Code](https://docs.claude.com/en/docs/claude-code/skills)
skills. Each skill is a self-contained directory that copies cleanly into any
Claude Code installation.

## Skills

Three git workflow skills that generate Conventional Commits messages and pull
request text:

| Skill | What it does | Invoke with |
|-------|--------------|-------------|
| [`git-stage-analyze`](skills/git-stage-analyze/SKILL.md) | Analyzes the staging area and suggests a Conventional Commits message, flagging when staged changes should be split into separate commits. | `/git-stage-analyze` |
| [`git-wt-analyze`](skills/git-wt-analyze/SKILL.md) | The same analysis across the whole working tree, including unstaged and untracked files. | `/git-wt-analyze` |
| [`git-pr-write`](skills/git-pr-write/SKILL.md) | Writes a PR title and description from a commit range, confirming the target branch and filling the repo's PR template when present. | `/git-pr-write` |

You can also just describe the task in plain language and Claude can pick the
right skill.

### Shared rules

All three skills follow the same conventions, embedded in each `SKILL.md` so the
folders stay independent:

1. Never add a `Co-Authored-By` trailer or any other footer to generated commit
   messages or PR text.
2. Conform to the project's enforced commit rules. They check for commit hooks
   (husky, lefthook, pre-commit, `.git/hooks`) and then any commitlint config,
   and honor its allowed types, scopes, and length limits.
3. No em dashes in the output.
4. No emojis in the output.

By default the skills only produce text. They commit, stage, or open a PR only
when you explicitly ask.

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

Copy a skill directory into one of:

- Personal skills (available in every project): `~/.claude/skills/<skill-name>/`
- Project skills (this repo only): `.claude/skills/<skill-name>/`

To install all three personally:

```bash
cp -r skills/git-stage-analyze skills/git-wt-analyze skills/git-pr-write ~/.claude/skills/
```

Newly added skills are picked up on a fresh session, so restart Claude Code if
they do not appear right away. Re-run the copy after editing a skill here to
push the update into `~/.claude/skills`.
