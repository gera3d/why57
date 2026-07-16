# Five-Point Prototype Review — offer brief

**Status:** reusable internal brief; capacity, response ownership, and any public offer detail require approval before publishing.<br>
**Primary page:** <https://why57.com/ai-app-prototype-to-production.html><br>
**Offer job:** turn “I built something with AI; what now?” into a clear production decision and an evidence-backed next step.

## Ideal request

- A founder, operator, or team has a working prototype built with an AI coding or app-building tool.
- At least one real workflow can be demonstrated, even if the code and UX are rough.
- The team expects customers, employees, partners, payments, sensitive data, or business-critical use.
- The decision is whether to harden, rebuild selectively, run a controlled pilot, or stop.

## Not the right fit

- A raw idea with nothing to demonstrate.
- A request for a free implementation estimate disguised as strategy.
- A security, compliance, or legal certification.
- A requester who cannot share enough context to evaluate the core journey.

## Five-point review scope

The public offer reviews these five areas, in this order:

1. **Product and release scope:** whether the first user and smallest useful outcome are clear enough to ship.
2. **Code and ownership:** what can be kept, what needs attention, and whether the business can own and change it.
3. **Data, security, and privacy:** whether accounts, permissions, customer data, and third-party access are handled responsibly.
4. **Reliability and operations:** what is missing for testing, backups, monitoring, recovery, and safe releases.
5. **Launch path and next move:** whether to keep building, fix a focused set of gaps, rebuild the foundation, or validate first.

The response should identify the clearest next move supported by the available evidence. Do not promise a clean bill of health, certification, a fixed implementation price, or a launch date.

## Participant inputs

The public form requests:

- name, work email, and optional company;
- the tool or mixed stack used to build it;
- an optional prototype URL and a plain-language description of who it helps and what it does;
- the current-user range;
- target timing; and
- the blocker or decision preventing the next step; and
- consent to use the submitted information for the review and follow-up, with confirmation that no passwords, secrets, or private customer data were included.

If a deeper review is appropriate, request only the additional context needed for the five points: intended first user and task, repository access when appropriate, data and third-party services, code and account ownership, and launch constraints.

If credentials are needed, use an approved secure channel. Never request secrets in an intake form, calendar note, or email.

## Review workflow

| Segment | Purpose | Output |
| --- | --- | --- |
| Product and release scope | Name the first user, smallest useful outcome, release boundary, and exclusions. | Evidence and unknowns for the first release. |
| Code and ownership | Identify what can be kept, what needs attention, and who controls the code and operating accounts. | Keep / fix / replace findings. |
| Data, security, and privacy | Review accounts, permissions, customer data, third-party access, and any specialist-review boundary. | Ranked access and data risks. |
| Reliability and operations | Review tests, backups, monitoring, recovery, deployment, and support ownership. | Ranked operating gaps. |
| Launch path and next move | Choose the smallest responsible next move supported by the evidence. | Keep building, focused fix, foundation rebuild, or validate-first recommendation. |

Use the [production-readiness checklist](production-readiness-checklist.md) as the shared scan, not as a certification.

## Canonical resource paths

| Funnel job | Canonical page | Page CTA |
| --- | --- | --- |
| Submit a working prototype for the five-point review | [AI prototype to production](https://why57.com/ai-app-prototype-to-production.html) | Send Your Prototype |
| Review the 12 readiness and security parts | [AI prototype readiness and security checklist](https://why57.com/ai-prototype-readiness-security-checklist.html) | Start the Checklist |
| Decide whether to keep, repair, replace a seam, or rebuild | [AI prototype repair-vs.-rebuild guide](https://why57.com/ai-prototype-repair-rebuild-cost.html) | Use the Decision Framework |

Keep these destinations canonical. Add the approved external-campaign UTM parameters only to distribution links, never to internal site links.

## Review response boundary

The follow-up response should stay proportional to the material reviewed. It can include:

- decision and intended user outcome;
- top three risks, with evidence;
- keep / fix / replace map;
- next release scope and explicit exclusions;
- evidence still needed before a broader release;
- owner, next checkpoint, and open questions; and
- optional implementation path, only if requested.

Do not describe the response as a penetration test, formal audit, certification, complete code review, or guaranteed implementation plan unless that separate scope has been approved and completed.

## Conversion paths

| Finding | Responsible next step | CTA |
| --- | --- | --- |
| Product signal is weak | Run a smaller user test before engineering expansion. | “Plan a controlled validation sprint.” |
| Core logic is valuable but fragile | Fix the risky components and add release controls. | “Scope a focused production fix.” |
| One weak seam creates disproportionate risk | Preserve the useful experience and replace that seam. | “Map a selective replacement.” |
| The foundation will not support the use case | Preserve the learning and rebuild the smallest viable core. | “Map a foundation rebuild.” |
| Prototype is ready for a limited cohort | Instrument, document, and run a staged launch. | “Prepare the pilot release.” |
| Why57 is not the right provider | Make a clean recommendation without forcing a sale. | “Document the next specialist or decision.” |

## Web-ready copy

### Short description

Built a working app with Claude, ChatGPT, Lovable, Replit, Bolt, v0, or another AI tool? The five-point prototype review examines product and release scope, code and ownership, data and security, reliability and operations, and the launch path. Send the prototype to get the clearest next move supported by the evidence—not a generic feature wishlist.

### CTA options

- **Primary navigation / distribution:** Send Your Prototype
- **Review section:** Get the 5-Point Review
- **Form submit:** Send My Prototype
- **Checklist resource:** Start the Checklist
- **Decision resource:** Use the Decision Framework
- **Secondary conversation:** Request a Fit Call

### Confirmation / thank-you state

> Your prototype is in the review queue. We’ll look at product and release scope, code and ownership, data and security, reliability and operations, and the launch path—then reply with the clearest next move supported by the context provided.

## Measurement contract

Use a consistent path from source to outcome:

| Stage | Signal | Required properties |
| --- | --- | --- |
| Landing | UTM-attributed session | `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` |
| Submit | `prototype_review_submitted` | success only after intake storage and delivery both succeed; no personal data in analytics |
| Booking click | `calendar_booking_clicked` | micro-conversion only; never report as a completed booking or lead |
| Outcome | CRM/status field, not a public analytics event | qualified, not-fit, proposal, won, lost |

Never send names, email addresses, prototype content, or sensitive business data to analytics. Verify each event in the analytics debugger before treating it as live.

## Publishing checklist

- [ ] Owner, capacity, response time, and any pricing language are approved.
- [ ] Intake fields and secure credential guidance are approved.
- [ ] Confirmation state and fallback contact route are tested.
- [ ] CTA links have source-specific UTMs.
- [ ] Analytics events appear once per action and contain no personal data.
- [ ] The delivery template and follow-up owner are ready.
- [ ] Any claim or case study used has an approved source and current permission.
