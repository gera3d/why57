---
name: call-decision-system
description: Turn owner-authorized customer-call recordings or transcripts into a reviewable decision brief and compact evidence map. Use when preparing for a renewal conversation, scoping a discovery-call next step, or finding recurring objections across an owner-approved transcript set, without treating a transcript as complete, inferring agreement, updating a CRM, sending a recap, or taking follow-up action.
---

# Call Decision System

Turn a deliberately selected call into a brief the owner can verify. This is a method, not preloaded customer data or an autonomous agent.

## 1. Set the review boundary first

Get four things before reading any call material:

- **Goal:** renewal preparation, a scoped next-step brief, or an objection pattern review.
- **Authorized input:** the specific recording or transcript, the owner who authorized it, and any needed call date or speaker labels.
- **Output user:** the person who will review and decide.
- **Stop line:** no CRM change, task creation, message, recap, calendar event, or external record unless the owner separately approves it.

Stop if authority to use the recording or transcript is unclear. Do not ask for credentials, a broad call library, recordings outside the stated goal, private details that do not affect the decision, or information about unrelated participants.

Ask the owner to remove or withhold passwords, access codes, payment data, health information, protected identifiers, and unnecessary sensitive quotations. Treat the transcript as one imperfect source, not a complete record of the relationship or agreement.

## 2. Work from evidence lanes

Keep these categories separate in every output:

| Lane | Include | Do not do |
| --- | --- | --- |
| **Direct statement** | Speaker, source marker, concise paraphrase or a short necessary quote, and the topic. | Upgrade a wish, question, or conditional statement into a decision. |
| **Transcript uncertainty** | Missing context, unclear speaker, inaudible wording, contradiction, or ambiguity. | Hide uncertainty to make the brief sound clean. |
| **AI inference** | A labeled interpretation or pattern that may help the owner investigate. | Present an inference as something a participant said or agreed to. |
| **Owner decision** | Approval, correction, removal, or a chosen next action. | Assume silence equals approval. |

Use a time marker, page/line reference, or transcript label for every material direct statement. Prefer paraphrase. Copy a sensitive quote only when its exact wording changes the owner's decision.

## 3. Produce the reviewable brief

Create a **Call Decision Brief** with these sections:

1. **Purpose and input boundary** — the decision the owner needs, selected source, and known limits.
2. **Confirmed direct statements** — only evidence-supported decisions, requests, commitments, and objections; identify the speaker and source marker.
3. **Unresolved questions** — what the call did not settle, including contradictions or missing context.
4. **Labeled inferences** — proposed interpretations, with the evidence that suggests them and what would confirm or disprove them.
5. **Commitment and follow-up review queue** — every possible commitment, follow-up, or external record marked `approve`, `correct`, `decline`, or `needs confirmation`. Do not turn the queue into work.
6. **Small evidence map** — one row per material item:

| Item | Classification | Speaker / source marker | Concise evidence | Confidence / uncertainty | Owner check |
| --- | --- | --- | --- | --- | --- |

Keep the brief selective. A long retelling is not a decision system.

## 4. Use the right branch

### Renewal conversation

Surface stated value, stated risks, requested proof, dates or conditions, and objections. Keep any renewal likelihood as an inference unless a participant said it directly. Give the owner a short review queue for what to verify before the renewal conversation.

### Discovery call to scoped next step

Separate the buyer's stated problem, constraints, stakeholders, success criteria, and requested materials from the AI's proposed scope. Do not invent action items or a next meeting. The owner chooses what, if anything, gets drafted after review.

### Recurring-objection review

Use only an owner-approved transcript set and name the set's limits: date range, count, source selection, and missing calls. Group direct objections by wording or theme, keep examples traceable, and label frequency as a count within this selected set—not a market finding or proof of priority.

## 5. Hold at the owner gate

Present the brief and ask the owner to mark each potential commitment, follow-up, and external record:

- **approve** — permits a later, separate draft or record update;
- **correct** — replace or clarify the evidence;
- **decline** — do nothing; or
- **needs confirmation** — obtain more evidence before any draft.

Only after a specific approval may you draft one recap, task, CRM update, or follow-up. Keep that draft unsent and unrecorded until the owner takes the consequential action.

## Red flags and stop conditions

Stop and ask for owner direction when the workflow would:

- treat a transcript as the complete record;
- infer agreement from silence;
- invent action items, commitments, or next steps;
- flatten ambiguity, conflicting accounts, or an uncertain transcript into certainty;
- copy sensitive quotes when a brief paraphrase is enough;
- process a recording without authority;
- include credentials, private information unnecessary to the goal, or unrelated participant information; or
- auto-update a CRM, create an external record, send a recap, or trigger follow-up.

## Reusable prompt

Use this prompt after the owner has supplied authorized, bounded material:

```text
Goal: Turn the authorized call material below into a reviewable Call Decision Brief for [renewal preparation / scoped discovery next step / recurring objection review].

Authorized inputs: [specific transcript or recording-derived transcript, date, speaker labels, and any owner-provided context]. Exclude recordings without authority, credentials, unnecessary sensitive data, and unrelated participant information.

Build a selective brief, not a full recap. Separate every material item into: (1) direct statement with speaker and source marker, (2) transcript uncertainty, (3) AI inference clearly labeled as not a fact, or (4) owner decision needed. Do not infer agreement from silence, invent action items, or treat this transcript as complete.

Return: purpose and input boundary; confirmed direct statements; unresolved questions; labeled inferences; a commitment and follow-up review queue; and a small evidence map with source markers. Paraphrase by default; use a short quote only when exact wording changes the decision.

Stop after the reviewable brief. Ask me to approve, correct, decline, or mark needs-confirmation for every possible commitment, follow-up, and external record before drafting or doing any consequential work. Do not update a CRM, create tasks, send a recap, schedule anything, or contact anyone.
```
