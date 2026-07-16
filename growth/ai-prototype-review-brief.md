# Five-Point Prototype Review — offer brief

**Status:** reusable internal brief; pricing, availability, and owner require approval before publishing.<br>
**Primary page:** <https://why57.com/ai-app-prototype-to-production.html><br>
**Offer job:** turn “I built something with AI; what now?” into a clear production decision and an evidence-backed next step.

## Ideal participant

- A founder, operator, or team has a working prototype built with an AI coding or app-building tool.
- At least one real workflow can be demonstrated, even if the code and UX are rough.
- The team expects customers, employees, partners, payments, sensitive data, or business-critical use.
- The decision is whether to harden, rebuild selectively, run a controlled pilot, or stop.

## Not the right fit

- A raw idea with nothing to demonstrate.
- A request for a free implementation estimate disguised as strategy.
- A security, compliance, or legal certification.
- A participant who cannot share enough context to evaluate the core journey.

## Promise

By the end of the review, the participant should understand:

1. which parts of the prototype are safe to keep;
2. which production gaps create the most risk;
3. the smallest responsible next release; and
4. what evidence will prove that release is working.

Do not promise a clean bill of health, a fixed implementation price, or a launch date without technical review.

## Participant inputs

Request these before the session:

- prototype URL or a short screen recording;
- primary user and job-to-be-done;
- tool(s) used to build it;
- repository and deployment ownership, if known;
- data types collected or generated;
- required integrations;
- current users and expected next cohort;
- biggest concern and pending decision.

If credentials are needed, use an approved secure channel. Never request secrets in an intake form, calendar note, or email.

## Working-session agenda

| Segment | Purpose | Output |
| --- | --- | --- |
| Context and decision | Name the user, workflow, business stakes, and decision deadline. | One-sentence decision statement. |
| Core-journey walkthrough | Follow the highest-value journey, including failure and success states. | Journey gaps and usability notes. |
| Production risk scan | Review ownership, data, security, reliability, release process, monitoring, and support. | Ranked risk stack. |
| Keep / harden / replace | Separate valuable product logic from fragile implementation. | Component decision map. |
| Next-release plan | Choose the smallest controlled cohort, measures, and stop conditions. | 30-day action plan. |

Use the [production-readiness checklist](production-readiness-checklist.md) as the shared scan, not as a certification.

## Deliverable

Send a concise review summary after the session:

- decision and intended user outcome;
- top three risks, with evidence;
- keep / harden / replace map;
- next release scope and explicit exclusions;
- analytics and reliability events to verify;
- owner, next checkpoint, and open questions;
- optional implementation path, only if requested.

## Conversion paths

| Finding | Responsible next step | CTA |
| --- | --- | --- |
| Product signal is weak | Run a smaller user test before engineering expansion. | “Plan a controlled validation sprint.” |
| Core logic is valuable but fragile | Harden the risky components and add release controls. | “Scope a production-hardening phase.” |
| Prototype architecture will not support the use case | Preserve learnings and rebuild the smallest viable core. | “Map a selective rebuild.” |
| Prototype is ready for a limited cohort | Instrument, document, and run a staged launch. | “Prepare the pilot release.” |
| Why57 is not the right provider | Make a clean recommendation without forcing a sale. | “Document the next specialist or decision.” |

## Web-ready copy

### Short description

Built a working app with Claude, ChatGPT, Lovable, Replit, Bolt, v0, or another AI tool? The five-point prototype review examines product ownership, access and data, failure handling, release controls, and ongoing support. You leave with the highest-risk gaps and a practical next release—not a generic feature wishlist.

### CTA options

- **Primary:** Send Your Prototype
- **Lower commitment:** Check Your Prototype’s Readiness
- **Partner handoff:** Get a Production Readiness Review

### Confirmation / thank-you state

> Request received. We’ll review the context you shared and reply with fit and next-step options. Please do not send passwords, API keys, or other secrets. If the five-point review is not the right format, we’ll say so.

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
