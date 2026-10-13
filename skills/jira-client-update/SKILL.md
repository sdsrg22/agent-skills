---
name: jira-client-update
description: Rewrite a rough engineer-written Jira comment into a clear, professional, client-ready update that keeps the real status of the work and never invents facts. Use this whenever the user pastes a draft Jira comment, status note, or investigation summary and wants it polished, rephrased, made client-friendly, or sent to a client or stakeholder, even if they do not say "rewrite". Also handles an internal mode for teammates, where technical detail is kept and only tone and clarity are cleaned up. Prefer this skill over freehand rewriting so the tone, honesty rules, and structure stay consistent across the team.
---

# jira-client-update

Turn a rough engineering update into a Jira comment a client can read with
confidence. The reader is usually non-technical: a client, project manager, or
business stakeholder. The comment should show that the team is methodical and
owns the problem, while saying only what is actually true.

The single most important property is honesty. A client acts on what the comment
says, so a rewrite that sounds better but claims more than the engineer knew is
worse than the rough original. Everything below serves that.

## Inputs

- **Required:** the rough comment.
- **Optional hints**, which you should infer from the comment when they are not
  given, and which the user can override:
  - `type`: bug, feature, task, or investigation
  - `status`: investigating, in-progress, blocked-on-client, ready-for-qa,
    fixed, or deployed
  - `audience`: client (default) or internal

Hints steer tone and structure only. They never add facts. If a hint says
`fixed` but the comment does not say anything was fixed, the comment wins, and
because that is a conflict you ask (see "When to ask a question").

## Output

Return only the rewritten comment, ready to paste into Jira. No preamble such as
"Here is the polished version", no explanation of what you changed, no
alternatives, unless the user explicitly asks for them. Write plain paragraphs,
usually one to three short ones, because Jira renders markdown differently
depending on the editor and plain text is safe everywhere. Use a list only when
the input itself lists distinct items. Do not turn a two-sentence update into a
report.

## Honesty rules (client and internal modes)

Never introduce a fact that is not in the input. That includes causes, fixes,
completion, deployment dates, test results, guarantees, and promises of a
follow-up update or timeline. If the input does not promise a further update,
do not promise one.

Preserve real uncertainty by rewording it, never by removing it or upgrading it.
Useful phrasing: "potential cause", "potential gap", "initial findings",
"our investigation indicates", "currently validating", "working toward a
reliable resolution". Do not write "resolved", "root cause identified", "fix is
ready", or "this will resolve the issue" unless the input establishes it.

When softening, match the strength of the original. "High hopes" becomes
"optimistic about this direction", not "initial findings are encouraging",
because the second one claims results that were never stated.

Match the strength in both directions and add no circumstantial detail. If the
input says the flaky tests "are unrelated", write that they are unrelated, not
that they "appear" unrelated, and do not add that they "showed up in that run"
or "during testing" when the input never said when or where. A reader treats
every extra detail as something the engineer told you, so a harmless-sounding
addition is still an invented fact. This applies in internal mode too.

## Client mode (default)

### Translate, do not delete, technical meaning

Convert engineering shorthand into what it means for the client, and keep a
technical term when removing it would make the statement inaccurate.

| Rough | Client-ready |
|-------|--------------|
| couldn't reproduce | We attempted to reproduce the issue in our environment but were unable to observe the same behavior. |
| had a hypothesis | we identified a possible cause |
| found a limitation in the current implementation | we identified a potential gap in the current approach |
| doing R&D | we are evaluating a new approach |
| running tests | we are validating the approach |
| probably caused by X | our investigation indicates X may be contributing to the issue |

Keep project-specific names as written (modules, features, product terms,
ticket names). If the input says "Extensions project", the output says
"Extensions project".

### Frame the work as progress without hiding the state

When something is not yet reproduced or resolved, do not make the team sound
stuck, and do not hide that it is unresolved. Where it fits, follow this order,
skipping steps the input gives nothing for:

Investigation, then Finding, then Direction, then Validation or next step.

If the input shows a lead, say so: "we don't know what's causing this, but it
only happens with Unicode names" becomes a comment that leads with that finding.
If the team truly has no direction yet, say plainly that the investigation is
ongoing, what has been checked, and that a cause has not yet been identified.
Stop there. Do not add that the team is narrowing it down, getting closer, or
examining further, because none of that was said. A calm statement of exactly
where things stand reads as more trustworthy than an invented direction.

### Closing, by ticket type and status

Close with what the input says is happening next, not with a stock sentence.
The ownership line below is for work that is genuinely ongoing; reusing it when
the input describes a different state makes the comment inaccurate. The reverse
matters just as much: when the team really is working on a fix or trying a new
approach, do close with the ownership line. Ending a bug update on "we do not
yet know whether it will work" leaves the client with only the uncertainty and
none of the commitment, and the commitment is true.

- **Bug, fix still being worked on:** close with ownership, for example "We are
  actively working on the fix and validating the approach to ensure we have a
  reliable resolution for the reported issue." Avoid a bare "we will continue
  investigating" when a direction exists.
- **Bug, patch already applied and only validation remains:** do not say the
  team is working on the fix. Say the change has been applied and name the
  validation that is still pending, for example "The remaining step is to
  validate the change under load before we treat the issue as resolved."
- **Bug, fixed / ready-for-qa / deployed:** state exactly the stage the input
  gives and nothing beyond it. Ready for QA is not fixed, and fixed is not
  deployed.
- **Feature or task:** say what is done and what remains. Mention a next
  milestone only if the input gives one.
- **Investigation:** lead with findings and direction.
- **Blocked on client:** state clearly and politely what is needed from the
  client, and why, using only what the input says. Make the ask the focus.

### Tone and what to leave out

Professional, clear, calm, confident, transparent, ownership-oriented. Avoid
defensive wording, unnecessary apologies, blame, overly corporate or marketing
language, excessive reassurance, developer slang, and needless jargon.

Leave out internal context the client does not need: team structure, individual
developers, internal disagreements or frustration, internal deadlines, internal
processes, and internal tooling.

Describe a stage by what is happening, not by which internal team does it. Write
"ready for testing" or "pending validation", not "QA, who still need to test
it" or "the dev team is...". Match the tense to the input: if testing has not
started, say it is pending or awaiting validation, and say "undergoing
validation" only when the input says testing is underway. Likewise say "not yet
in production" rather than naming internal environments such as dev or staging,
unless the client uses those terms.

Do not refer to earlier requests, reminders, or follow-ups, such as "we reached
out previously", "as requested before", or "still waiting". Even when true, they
tell the client they have been slow or silent, which is blame the client did not
earn from this comment. Make the ask as if for the first time, politely and
specifically, and leave the history out. Mention earlier contact only if the
user's comment explicitly asks you to.

## Internal mode

Use when the user says the comment is for teammates or the team, or sets
`audience: internal`. The reader is technical and wants the detail.

Keep names, tooling, technical findings, and implementation details. Clean up
only tone, structure, and clarity: remove frustration and blame, fix fragments,
lead with the status. The honesty rules still apply in full. Do not translate
engineering terms into client language.

## When to ask a question

Ask exactly one short clarifying question, and write no rewrite yet, when:

- you cannot tell the status of the work and any rewrite would have to guess, or
- a hint conflicts with the comment (for example `fixed` against a comment that
  describes work still in progress).

Make the question specific so the user can answer in a few words, for example
"Is the fix already deployed, or only ready for QA?". Do not ask about things you
can reasonably infer, and do not ask more than one question.

## Examples

**Client mode, bug in progress**

Input:
> We tried replicating this in our environment but couldn't reproduce this issue. However, in our environment we found that this issue is happening in the extensions project. We had a hypothesis, ran some tests and found a potential limitation in our current implementation. We have started working on a new approach (currently researching it; means R&D) and have high hopes on that.

Output:
> We attempted to reproduce the issue in our environment but were unable to observe the same behavior. During our investigation, we did find that the issue occurs in the Extensions project, which gives us a useful lead.
>
> We tested a possible cause and identified a potential gap in our current approach. We have started evaluating a new approach to address it and are optimistic about this direction. We are actively working on the fix and validating the approach to ensure we have a reliable resolution for the reported issue.

Note what is absent: no promised follow-up, no claim of "encouraging results",
no mention of R&D.

**Client mode, blocked on client**

Input:
> cant go further on the export bug till they send the sample file that fails, asked twice already

Output:
> To continue investigating the export issue, we need a sample of the file that fails during export. Could you please share it when convenient? Once we have it, we can reproduce the behavior and move toward a resolution.

The input did not say a reproduction would lead to a fix, so the output does not
promise one. "Asked twice already" is internal frustration and is dropped.

**Needs a question**

Input (hint `status: fixed`):
> still seeing the timeout on staging, looking at the query plan

Output:
> This comment describes the timeout as still occurring, but the status hint says fixed. Which is current: is the issue fixed, or still under investigation?
