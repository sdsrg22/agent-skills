# claude-skills

A collection of [Claude Code](https://docs.claude.com/en/docs/claude-code/skills) skills.

## What is a skill?

A skill is a self-contained directory that packages instructions (and optionally
scripts and resources) Claude can load on demand. Each skill lives in its own
folder and is defined by a `SKILL.md` file with YAML frontmatter.

## Layout

```
skills/
  <skill-name>/
    SKILL.md        # required: frontmatter (name, description) + instructions
    scripts/        # optional: helper scripts the skill can run
    references/     # optional: docs/resources loaded as needed
```

## Authoring a skill

A `SKILL.md` looks like this:

```markdown
---
name: my-skill
description: One-line summary of what the skill does and when to use it.
---

# My Skill

Instructions for Claude go here...
```

Keep the `description` specific — it's what Claude uses to decide when the skill
is relevant.

## Installing

Copy a skill directory into one of:

- Project skills: `.claude/skills/<skill-name>/`
- Personal skills: `~/.claude/skills/<skill-name>/`
