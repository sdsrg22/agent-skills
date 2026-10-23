# jira-client-update contract

The input/output contract for the `jira-client-update` skill. This file is for
people deciding whether to trust and adopt the skill. Claude does not need it to
run the skill; the behavior lives in `SKILL.md`. If the two ever disagree,
`SKILL.md` is what actually runs, so update this file when that changes.

Contract version: 1.1

Changes in 1.1: added guarantees 7 to 10 (strength and detail preserved, closing
matches the actual state, no references to earlier requests, stage wording
matches the input's tense).

## Input

| Field | Required | Values | Notes |
|-------|----------|--------|-------|
| comment | yes | free text | A rough, engineer-written Jira comment. |
| type | no | bug, feature, task, investigation | Inferred from the comment if absent. |
| status | no | investigating, in-progress, blocked-on-client, ready-for-qa, fixed, deployed | Inferred from the comment if absent. |
| audience | no | client (default), internal | internal keeps technical detail. |

Hints steer tone and structure only. They never add facts.

## Output

- One of two things, never both: a rewritten comment, or a single clarifying
  question (see Edge cases).
- The rewritten comment is plain text, usually one to three short paragraphs,
  ready to paste into Jira.
- No preamble, no explanation of changes, and no alternatives unless the user
  asks for them.

## Guarantees

1. **No new facts.** No invented causes, fixes, completion, dates, test results,
   guarantees, or promised follow-ups.
2. **Uncertainty is preserved.** It may be reworded and softened, never removed
   or upgraded to certainty.
3. **Status is not advanced.** Ready for QA is not reported as fixed, and fixed
   is not reported as deployed.
4. **Client mode removes internal context.** People, team structure, internal
   disagreements or frustration, internal deadlines, and internal tooling.
5. **Project terms are kept as written.** Module, feature, product, and ticket
   names are not renamed.
6. **Hints never override the comment.**
7. **Strength and detail are preserved.** A definite statement is not softened
   and an uncertain one is not strengthened. No circumstantial detail is added,
   such as when or where something was observed.
8. **The closing matches the actual state.** Ongoing-work wording is not used
   when the input says a patch is applied and only validation remains, and it is
   used when work on a fix is genuinely ongoing.
9. **No references to earlier requests.** Client-facing text does not mention
   earlier reminders or follow-ups, since that implies the client was slow.
10. **Stage wording matches the input's tense.** Testing that has not started is
    described as pending, not as underway.

## Edge cases

| Situation | Behavior |
|-----------|----------|
| Status of the work cannot be determined | Ask one specific question, no rewrite. |
| A hint conflicts with the comment | Ask one specific question, no rewrite. |
| Comment is already client-ready | Return it with minimal or no changes. |
| User asks for an explanation or alternatives | Provide them, after the comment. |

## Non-goals

- Does not post to Jira or read ticket data. It rewrites the text you give it.
- Does not verify that the engineering claims are true.
- Does not decide whether a comment should be sent to the client at all.
- Does not translate between human languages.

## Known limits

- It can only be as honest as the input. If the rough comment overstates the
  work, the rewrite will too. Read the result before sending it to a client.
