---
name: feedback-prioritization
description: Turn a bounded, authorized set of customer interview notes, support themes, review text, or survey responses into a reviewable Feedback Map before an owner decides what to build next. Use when choosing a small product improvement, preparing a roadmap discussion, or investigating a recurring onboarding issue without inventing demand, exposing unnecessary identity, or creating roadmap tickets.
---

# Feedback Prioritization

Build evidence the owner can inspect. This skill maps problems; it does not make the product decision or change the product.

## 1. Set the decision and the boundary

Ask for:

- one decision to inform: next small improvement, roadmap discussion, or onboarding investigation;
- a bounded, authorized input set and its date range;
- source labels, user segment when needed, and whether each item is a separate person or a duplicate contact;
- the owner who will review the map; and
- product constraints that can make a request out of scope.

Accept only approved interview notes, support themes, review text, or survey responses. Exclude private messages without authority, credentials, health, legal, or HR details, and customer identity unless it is necessary for the decision. Replace names with a neutral source label before analysis where possible.

Do not infer authority. If the source, scope, or consent is unclear, stop and ask for a smaller approved set.

## 2. Separate observations from interpretation

Create one evidence card per meaningful observation. Keep the direct wording or a short faithful excerpt, the source label, date when available, affected user, product moment, current workaround, and any stated impact.

Do not turn sentiment into willingness to pay. A complaint can show friction; it does not prove a market, a price, or that a feature should be built.

Mark these separately:

- **Direct evidence** — what the person said or did.
- **Inference** — a proposed explanation or pattern.
- **Unknown** — information the input does not establish.
- **Contrary evidence** — a source that weakens or complicates the proposed theme.

## 3. De-duplicate before counting

Group repeat contacts, copied reviews, forwarded tickets, and multiple notes about the same person into one demand source unless the owner can establish independent users. Keep the repeat count as operational context, but do not call it independent frequency.

Use one of these frequency labels:

- `Known: [n] independent sources in this input set`
- `Known: repeated contacts from [one source / n sources]`
- `Unknown: no count was supplied or the source is not independently identifiable`

Never invent a frequency, treat a loud enterprise request as a market, or count duplicates as independent demand.

## 4. Form themes and make the map

Cluster cards around the user problem or journey point, not a requested solution. A theme needs at least one direct evidence link. Keep isolated observations visible when they may matter, but label them as one-off or uncertain.

Produce a **Feedback Map** with one row per theme:

| Theme | Direct evidence | Affected user | Frequency when known | Severity | Current workaround | Contrary evidence / uncertainty | Recommendation | Owner check |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [problem, not feature] | [source label + short excerpt] | [needed segment only] | [known / unknown] | [blocked / delayed / inconvenient, with reason] | [what users do now] | [what conflicts or is missing] | [keep / watch / test / decline] | [what the owner must confirm] |

Define severity from the evidence. Do not use emotional language as a severity score unless the person described the consequence.

## 5. Recommend without deciding

- **Keep** — retain the evidence-backed theme for the owner’s product discussion; it does not authorize work.
- **Watch** — preserve the signal and name the missing evidence or next observation to collect.
- **Test** — propose one small, reversible learning step with a success condition; wait for approval before drafting it.
- **Decline** — record why the request is one-off, out of scope, unsupported, or outweighed by contrary evidence.

Use a recommendation only when its evidence and uncertainty are visible. Do not rank themes as a roadmap, announce a winner, create a ticket, schedule a test, or change a product.

## 6. Run the red-flag pass

Before showing the map, check for:

- Do not count duplicates as independent demand.
- Do not treat sentiment as willingness to pay.
- Do not invent frequency, severity, or impact.
- Do not mistake one enterprise request for a market.
- Do not skip contrary evidence or uncertainty.
- Do not include customer identity where a user segment is enough.
- Do not auto-create roadmap tickets, product requirements, or autonomous changes without owner approval.

Correct the issue or flag it plainly. Do not hide a weak signal by giving it a confident label.

## 7. Stop at the owner gate

Show the map and a short decision brief: strongest evidence, weakest assumption, contrary evidence, and the decision the owner must make. Ask the owner to approve any next step before drafting a roadmap ticket, experiment plan, product brief, message, or other consequential work.

The owner selects sources, checks de-duplication and interpretation, decides what to build, and authorizes any follow-on work. The AI may organize evidence, surface uncertainty, and propose a bounded test only.
