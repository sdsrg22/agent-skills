# Install the Jira skill in Claude chat

Use this guide if you work in the claude.ai website or the Claude desktop chat.
If you use Claude Code (VS Code, the CLI, or the desktop Code tab), follow
[install-claude-code.md](install-claude-code.md) instead. If you use both, do
both. They do not share an install.

> **Status of these steps:** they come from Anthropic's published documentation.
> We have not yet run them end to end ourselves. If a menu or label differs, tell
> the skill's owner so this page can be corrected.

## Before you start

- Custom skills need a Pro, Max, Team, or Enterprise plan.
- Only `jira-client-update` is meant for chat. The other skills in this repo,
  including `compact-resume`, need Claude Code, so use the
  [Claude Code guide](install-claude-code.md) for those.
- You need the file `jira-client-update.skill`. Download it from the
  repository's **Releases** page (open the newest release and look under
  **Assets**). You need access to the repository to see it. The file is a zip
  with the skill folder inside.

## Install

1. Open claude.ai in your browser, or open the Claude desktop app.
2. Go to **Customize**, then **Skills**.
3. Upload `jira-client-update.skill`.
4. If the upload rejects the file because of its extension, rename it to
   `jira-client-update.zip` and upload that. The contents are the same.
5. Make sure the skill is switched on.

A skill uploaded on the website is saved to your account, so it should also
appear in the desktop chat app.

## Use it

Describe the task and name the skill the first few times, so Claude is sure to use it:

```
Use the jira-client-update skill to rewrite this for the client:

couldn't repro locally, only fails with unicode names in prod logs, trying a different lib
```

Claude can also pick the skill up on its own when you ask for a Jira comment to
be rewritten for a client, but naming it is more reliable. Say "for the team"
if the comment is for colleagues and not a client. You get back only the comment,
ready to paste into Jira.

Read the result before you post it. The skill never invents facts, but it can
only be as accurate as what you give it. Do not paste passwords, tokens, or
customer data you are not allowed to share with Claude.

## Update

When a new version is shared, remove the old skill under **Customize**, then
**Skills**, and upload the new file. Check the version in `CONTRACT.md` if you are
unsure which one you have.

## For admins (Team and Enterprise)

The documentation says an organization Owner can publish a skill to everyone in
the organization, so people do not each upload it. The path is **Customize**,
then **Skills**, then **Share**, then **Publish to org**. Check whether this
needs each person to switch the skill on, and how updates reach people, before
you rely on it.
