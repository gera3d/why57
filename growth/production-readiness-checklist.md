---
title: "AI Prototype Production-Readiness Checklist"
description: "A practical 20-point checklist for deciding whether an AI-built prototype is ready for real users—and what to fix next."
slug: "ai-prototype-production-readiness-checklist"
audience: "Founders, operators, and teams with a working AI-built prototype"
primary_cta: "Start the 12-Part Readiness Checklist"
status: "internal supporting worksheet; canonical public resource is the 12-part readiness and security checklist"
---

# Is your AI-built prototype ready for real users?

Claude, ChatGPT, Lovable, Replit, Bolt, v0, and similar tools can get a useful idea on screen fast. Production is a different job: the product has to protect data, survive failure, support real users, and create evidence that it is working.

Use this checklist before inviting customers, accepting payments, or making the prototype part of an important workflow. It takes about 15 minutes.

## How to score it

Give each section a score:

- **0 — Unknown or missing:** nobody owns it, or the answer is based on hope.
- **1 — Partly handled:** a path exists, but it is manual, fragile, or untested.
- **2 — Ready for the next stage:** the owner, process, and evidence are clear.

Write one piece of evidence beside every score. A checked box without evidence is still an assumption.

## 1. Product outcome and ownership

- [ ] The product solves one named problem for one defined primary user.
- [ ] A single person owns scope and can say “not yet” to new features.
- [ ] The first-release success metric is measurable within 30 days.
- [ ] The team knows what would cause it to pause, roll back, or retire the product.

**Evidence:** [user/problem statement, owner, metric, stop condition]<br>
**Score (0–2):** [ ]

## 2. Core journeys and accessibility

- [ ] The highest-value journey works from start to finish without developer help.
- [ ] Empty, loading, validation, error, and success states are visible and understandable.
- [ ] Keyboard navigation, labels, focus order, color contrast, and mobile layout have been checked.
- [ ] A user can recover from a mistake without losing important work.

**Evidence:** [journey recording, test notes, accessibility scan]<br>
**Score (0–2):** [ ]

## 3. Architecture and ownership of the code

- [ ] The source code, deployment accounts, domains, and key services are owned by the business.
- [ ] Environments and configuration are documented; secrets are not committed to source control.
- [ ] Major dependencies and generated components are identifiable and replaceable.
- [ ] Another qualified developer can run the product from written instructions.

**Evidence:** [repository, account inventory, runbook]<br>
**Score (0–2):** [ ]

## 4. Identity, permissions, and security

- [ ] Authentication is appropriate for the data and actions the product exposes.
- [ ] Users can access only the records and actions their role requires.
- [ ] Inputs, uploads, APIs, and admin functions are validated on the server—not only in the browser.
- [ ] Dependency, secret, and permission reviews happen before release.

**Evidence:** [role matrix, security review, dependency scan]<br>
**Score (0–2):** [ ]

## 5. Data, privacy, and AI behavior

- [ ] The team can explain what data is collected, where it goes, who can access it, and when it is deleted.
- [ ] Sensitive data is minimized and protected in transit and at rest.
- [ ] AI outputs have boundaries, fallbacks, and a human review path when errors matter.
- [ ] Prompts, models, evaluations, and known failure cases are versioned or recorded.

**Evidence:** [data map, retention rule, AI evaluation set]<br>
**Score (0–2):** [ ]

## 6. Reliability and recovery

- [ ] The product handles timeouts, duplicates, retries, and partial failures safely.
- [ ] Backups exist for important data and a restore has been tested.
- [ ] A failed release can be rolled back without improvisation.
- [ ] Capacity, rate limits, and third-party outages have an explicit response.

**Evidence:** [failure test, backup restore, rollback notes]<br>
**Score (0–2):** [ ]

## 7. Testing and release control

- [ ] Critical journeys have repeatable automated or documented tests.
- [ ] Changes are reviewed and released from a known version.
- [ ] Production configuration differs from local development intentionally.
- [ ] The release checklist names the approver and the evidence required to ship.

**Evidence:** [test report, release checklist, version tag]<br>
**Score (0–2):** [ ]

## 8. Monitoring and support

- [ ] Errors, availability, and the main product outcome are observable.
- [ ] Alerts go to a person who knows what to do next.
- [ ] Users have a clear support route and receive a useful acknowledgement.
- [ ] The team can connect a user report to logs without exposing private data.

**Evidence:** [dashboard, alert route, support workflow]<br>
**Score (0–2):** [ ]

## 9. Commercial and legal readiness

- [ ] Pricing, billing, refunds, and cancellations match the product experience.
- [ ] Terms, privacy language, consent, and vendor obligations have an owner.
- [ ] Required licenses and rights exist for code, data, fonts, images, and generated content.
- [ ] There is a plan for portability if a critical vendor changes price or terms.

**Evidence:** [approved policy links, vendor register, billing test]<br>
**Score (0–2):** [ ]

## 10. Launch and learning loop

- [ ] The launch starts with a defined cohort instead of “everyone.”
- [ ] Acquisition links carry source and campaign attribution.
- [ ] Activation, completion, conversion, and retention events are named and tested.
- [ ] A weekly owner reviews the evidence and decides what to keep, fix, or stop.

**Evidence:** [cohort list, analytics test, weekly review owner]<br>
**Score (0–2):** [ ]

## Your result

**Total (0–20):** [ ]

- **0–7 — Prototype:** keep the audience small. Protect data and clarify ownership before adding features.
- **8–14 — Controlled pilot:** choose a limited cohort, close the highest-risk gaps, and instrument the core journey.
- **15–17 — Launch candidate:** run a release review, failure test, and rollback rehearsal before expanding access.
- **18–20 — Ready for measured growth:** launch in stages and keep watching the outcome, reliability, and support load.

A high total does not cancel a critical red flag. Authentication, permissions, data loss, unsafe AI behavior, and unowned infrastructure can block launch regardless of score.

## The three-gap action plan

Do not turn the checklist into a 40-item backlog. Pick the three gaps with the highest combination of user impact, likelihood, and difficulty of recovery.

| Priority | Gap | Risk if ignored | Smallest useful fix | Owner | Evidence due |
| --- | --- | --- | --- | --- | --- |
| 1 | [gap] | [risk] | [fix] | [owner] | [date/evidence] |
| 2 | [gap] | [risk] | [fix] | [owner] | [date/evidence] |
| 3 | [gap] | [risk] | [fix] | [owner] | [date/evidence] |

## Continue with the canonical resources

Use the public [12-part readiness and security checklist](https://why57.com/ai-prototype-readiness-security-checklist.html) for the canonical review sequence. If you already have a working prototype and want a second set of eyes, the [five-point prototype review](https://why57.com/ai-app-prototype-to-production.html) helps identify the riskiest gaps and the smallest responsible next release.

**Web CTA:** [Start the 12-Part Readiness Checklist](https://why57.com/ai-prototype-readiness-security-checklist.html?utm_source=readiness_worksheet&utm_medium=lead_magnet&utm_campaign=why57_ai_prototype_launch_2026q3&utm_content=canonical_checklist)

_This checklist is a product-readiness aid, not a security, privacy, or legal certification. Use qualified specialists where the risk requires them._
