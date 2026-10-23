# Install the skills in Claude Code

Use this guide if you work in any of these:

- the Claude Code extension in VS Code
- the Claude Code CLI in a terminal
- the Code tab in the Claude desktop app

All three read the same personal skills folder, `~/.claude/skills/`, so one
install covers all of them. If you use the claude.ai website or the desktop
chat instead, follow [install-claude-chat.md](install-claude-chat.md). If you
use both, do both. They do not share an install.

## Install

1. Get the repo.

   ```bash
   git clone https://github.com/sdsrg22/agent-skills.git
   cd agent-skills
   ```

2. Run the installer for your system. It copies every skill in `skills/` into
   `~/.claude/skills/`.

   **macOS, Linux, or Git Bash on Windows**

   ```bash
   bash scripts/install.sh
   ```

   **Windows PowerShell**

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
   ```

   To install a single skill, add its name at the end, for example
   `bash scripts/install.sh jira-client-update`.

3. Check that it worked. In Claude Code, type `/` and look for the skill names,
   or run `/jira-client-update` with a rough Jira comment.

New skills are normally picked up live. If a session that was already running
does not see them, start a new session or try `/reload-skills`.

### Without the script

Copy the folder yourself. Each skill is a folder under `skills/` that contains a
`SKILL.md`. Put it at `~/.claude/skills/<skill-name>/`, for example
`~/.claude/skills/jira-client-update/SKILL.md`.

## Use the Jira skill

Type `/jira-client-update` and paste your rough comment. Add hints if you like:

```
/jira-client-update ticket is a bug, status in-progress

couldn't repro locally, only fails with unicode names in prod logs, trying a different lib
```

Say "for the team" if the comment is for colleagues and not a client. You get
back only the comment, ready to paste into Jira.

Read the result before you post it. The skill never invents facts, but it can
only be as accurate as what you give it. Do not paste passwords, tokens, or
customer data you are not allowed to share with Claude.

## Use compact-resume

When a long session is getting full, type `/compact-resume` (or ask "may I
compact now?"). It tells you whether this is a safe moment, saves a handoff
summary to a file in your project, and prints one short block that points at it.
Run `/compact`, then paste that block. Claude reads the saved file and continues
where you left off.

It writes files into your project, usually next to your progress notes, or in a
`.handoff/` folder if you have none. Add `.handoff/` to your `.gitignore`, and
check any summary before you commit it. See
[the contract](../skills/compact-resume/CONTRACT.md) for the full list.

## Update

Pull the latest version and run the installer again. It replaces the installed
copy, so do not keep local edits inside `~/.claude/skills/`.

```bash
git pull
bash scripts/install.sh
```

## Remove

Delete the folder, for example `~/.claude/skills/jira-client-update`.

## Troubleshooting

- **Skill not listed:** start a new session or try `/reload-skills`. Confirm
  that `~/.claude/skills/<skill-name>/SKILL.md` exists.
- **PowerShell refuses to run the script:** use the `-ExecutionPolicy Bypass`
  command above.
- **The skill does something unexpected:** note the exact comment you gave it
  and what it returned, and send both to the skill's owner.
