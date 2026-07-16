---
title: "AI Prototype Readiness & Security Checklist"
description: "A 12-part evidence checklist for deciding whether an AI-built prototype is ready for a controlled pilot, public release, or specialist review."
slug: "ai-prototype-readiness-security-checklist"
canonical_url: "https://why57.com/ai-prototype-readiness-security-checklist.html"
audience: "Founders, operators, and teams with a working AI-built prototype"
primary_cta: "Start the Checklist"
conversion_cta: "Send Your Prototype for the 5-Point Review"
status: "internal supporting worksheet aligned to the canonical public resource"
---

# Is your AI-built prototype ready for real users?

AI tools can get useful behavior on screen quickly. Production is a different job: the product has to protect data, survive failure, support real users, and create evidence that it is working.

Use this worksheet with the canonical [AI prototype readiness and security checklist](https://why57.com/ai-prototype-readiness-security-checklist.html). It is a readiness and scoping aid, not a penetration test, formal audit, certification, or legal advice.

## How to use it

For each part, record evidence, unknowns, and the next owner. A checked box without evidence is still an assumption. A critical access, data-loss, unsafe-AI, or unowned-infrastructure risk can block a broader release even when the other items look strong.

## 1. Define the first user, job, and launch boundary

- [ ] Name who can access the release, what they must accomplish, what data they will use, and what is explicitly outside version one.

**Evidence:** [one-page release brief, user roles, primary workflow, excluded scope]<br>
**Unknown / next owner:** [ ]

## 2. Establish ownership of code, accounts, domains, and data

- [ ] Identify who controls the repository, hosting, domain, database, AI provider, email, payments, analytics, and third-party services. Avoid dependence on a contractor's personal account.

**Evidence:** [owner inventory, admin list, transfer plan, license and export notes]<br>
**Unknown / next owner:** [ ]

## 3. Separate development, preview, and production

- [ ] Keep production data and credentials out of routine experimentation. Document how configuration differs and how a release moves between environments.

**Evidence:** [environment list, deployment path, protected variables, release permissions]<br>
**Unknown / next owner:** [ ]

## 4. Verify identity and authorization on the server

- [ ] Verify who the user is and what that user may read or change. Hiding a button in the browser is not an access control.

**Evidence:** [role matrix, server-side checks, tenant isolation tests, session behavior]<br>
**Unknown / next owner:** [ ]

## 5. Remove secrets from code, prompts, logs, and the browser

- [ ] Rotate any exposed key. Use server-side secret storage, least-privilege credentials, separate keys by environment, and provider restrictions where available.

**Evidence:** [secret inventory, rotation record, repository scan, key restrictions]<br>
**Unknown / next owner:** [ ]

## 6. Map data collection, access, retention, and deletion

- [ ] Identify what the product collects, why it is needed, where it travels, who can access it, how long it remains, how users can correct or delete it, and what appears in logs.

**Evidence:** [data-flow diagram, field inventory, retention rules, deletion test]<br>
**Unknown / next owner:** [ ]

## 7. Validate every trust boundary

- [ ] Treat browser input, uploaded files, webhooks, URLs, model output, and third-party responses as untrusted. Validate on the server and encode output for its destination.

**Evidence:** [validation rules, file restrictions, output encoding, webhook verification]<br>
**Unknown / next owner:** [ ]

## 8. Control AI behavior, data exposure, and spend

- [ ] Define what can enter a model, what the model may influence, when a human must review, how prompt injection or unsafe tool use is limited, and how usage or cost abuse is contained.

**Evidence:** [model data policy, tool permissions, review gates, quotas and alerts]<br>
**Unknown / next owner:** [ ]

## 9. Inventory dependencies and third-party failure

- [ ] Record the packages, APIs, and services the product relies on, their licenses, support status, limits, timeouts, retry behavior, and the product experience when they fail.

**Evidence:** [dependency inventory, lockfile, API limits, timeout and fallback tests]<br>
**Unknown / next owner:** [ ]

## 10. Test critical workflows and common failure paths

- [ ] Cover account creation, sign-in, permissions, payments if applicable, saving and editing data, duplicate actions, interrupted requests, empty states, and recovery from errors.

**Evidence:** [acceptance cases, automated checks, exploratory notes, defect decisions]<br>
**Unknown / next owner:** [ ]

## 11. Make releases observable and reversible

- [ ] Capture useful errors without leaking sensitive data. Define health signals, alerts, release ownership, rollback or forward-fix strategy, and a simple incident path.

**Evidence:** [monitored errors, alert owner, deploy record, rollback exercise]<br>
**Unknown / next owner:** [ ]

## 12. Prove backup and recovery where data matters

- [ ] Do not treat an enabled backup setting as a tested restore. Define acceptable data loss and recovery time, then exercise the path in proportion to the product's consequence.

**Evidence:** [backup owner, retention, restore result, recovery objective]<br>
**Unknown / next owner:** [ ]

## Choose the release boundary

- **Demo only:** controlled access with synthetic or disposable data; do not promise durability, privacy, availability, or account isolation.
- **Controlled pilot:** named users, limited data, explicit limits, active observation, and a human recovery path.
- **Public first release:** address unknown users, real operating conditions, abuse, account recovery, privacy, accessibility, monitoring, failure handling, backups where needed, and ownership.
- **Sensitive or regulated use:** identify additional security, privacy, compliance, contractual, and operational obligations and use appropriately qualified specialists.

## The three-gap action plan

Pick the three gaps with the highest combination of consequence, likelihood, and difficulty of recovery.

| Priority | Gap | Risk if ignored | Smallest useful fix | Owner | Evidence due |
| --- | --- | --- | --- | --- | --- |
| 1 | [gap] | [risk] | [fix] | [owner] | [date/evidence] |
| 2 | [gap] | [risk] | [fix] | [owner] | [date/evidence] |
| 3 | [gap] | [risk] | [fix] | [owner] | [date/evidence] |

## Continue with the three canonical AI resources

- [AI prototype to production and the five-point review](https://why57.com/ai-app-prototype-to-production.html)
- [12-part AI prototype readiness and security checklist](https://why57.com/ai-prototype-readiness-security-checklist.html)
- [AI prototype repair-vs.-rebuild decision guide](https://why57.com/ai-prototype-repair-rebuild-cost.html)

If the prototype is already working and the next move is unclear, **[Send Your Prototype for the 5-Point Review](https://why57.com/ai-app-prototype-to-production.html#send-prototype)**. A successful intake records `prototype_review_submitted`; a calendar-link click remains the `calendar_booking_clicked` micro-conversion and does not prove a lead or completed booking.

Do not put personal data, prototype content, secrets, or private business details in analytics or UTM values.
