# Two-week AI-prototype distribution launch batch

**Prepared:** July 15, 2026  
**Timezone:** America/Los_Angeles  
**Owner:** Gera Yeremin  
**Status:** Approval-ready drafts; distribution blocked on the complete Production Release and live smoke test.

## Public-repository privacy boundary

This file intentionally uses recipient-role placeholders. Do not add personal email addresses, private thread subjects or IDs, named recipient mappings, private correspondence summaries, or relationship notes to this repository. Resolve the exact recipient and any relationship-specific wording only in the private action-time approval context immediately before sending.

## Decision

Do not publish or send this batch yet.

The live check on July 15 found:

| Canonical destination | Integrated-release action | Live result | Launch decision |
| --- | --- | --- | --- |
| <https://why57.com/ai-app-prototype-to-production.html> | `Send Your Prototype` to the five-point review form; a calendar link is secondary. | HTTP 200, but the public file exactly matches the earlier growth-assets version and still sends all primary CTAs to the calendar. | Hold. The intended form funnel is not live. |
| <https://why57.com/ai-prototype-readiness-security-checklist.html> | Start the 12-part readiness/security checklist; prototype-review calendar links are micro-conversions. | HTTP 404. | Hold. Do not distribute. |
| <https://why57.com/ai-prototype-repair-rebuild-cost.html> | Use the repair/replace/rebuild decision framework; prototype-review calendar links are micro-conversions. | HTTP 404. | Hold. Do not distribute. |

The first two weeks now use only those three canonical URLs and the CTA that belongs to each integrated page. Retired offer and event terminology is not used in this batch.

## Release and approval gate

All five conditions must be true before the first item is published or sent:

- [ ] The Production Release owner confirms the integrated site release is public.
- [ ] All three canonical URLs return HTTP 200 and expose the expected canonical tag.
- [ ] The main prototype page shows `Send Your Prototype` and a successful labeled test produces one `prototype_review_submitted` event and one delivered intake.
- [ ] Resource-page calendar clicks produce one `calendar_booking_clicked` micro-conversion and are not counted as leads or completed bookings.
- [ ] Gera approves every external copy block and each named recipient below.

If the release gate is not complete by **Friday, July 17 at 3:00 PM**, move the whole sequence to the next Monday-start window. Do not compress several posts or messages into one day.

## External UTM convention

Use lowercase snake-case values. Keep the destination path canonical and add attribution only to the external link.

```text
utm_source=[linkedin|google_business_profile|founder_email|approved_partner_name]
utm_medium=[organic_social|organic_local|email|referral]
utm_campaign=why57_ai_prototype_launch_2026q3
utm_content=w[1|2]_[channel_or_asset_code]
```

Rules:

1. Do not place names, email addresses, prototype details, or other personal data in UTM values.
2. One-to-one messages from Gera use `utm_source=founder_email` and an organization-level `utm_content` code.
3. Do not label a link with a partner's name until that partner has approved a separate share. If approved, create a new `utm_source=[approved_partner_name]&utm_medium=referral` link.
4. Do not use UTMs on internal site links.
5. Before use, open the final URL in a clean browser session, confirm HTTP 200 and the expected page, and confirm the UTM values appear in first-touch attribution without overwriting an earlier external source.

## Two-week execution schedule

The dates assume the release gate passes by July 17. All external rows remain `approval required` until Gera explicitly approves the copy and recipient.

| ID | Date and time | Channel | Audience | Destination and CTA | Owner | Primary success metric | Approval |
| --- | --- | --- | --- | --- | --- | --- | --- |
| W1-1 | Mon Jul 20, 8:30 AM | Gera's LinkedIn profile | Founders/operators with a working Claude, ChatGPT, Lovable, Replit, Bolt, v0, or Cursor-built app | Prototype-to-production page; `Send Your Prototype` | Gera | UTM-attributed landing sessions and `prototype_review_submitted` | Required |
| W1-2 | Wed Jul 22, 10:00 AM | One-to-one email to an approved technical collaborator | Technical collaborator who may know one real prototype owner | Prototype-to-production page; one-person intro or forward | Gera | Reply, intro made, UTM session, qualified submission | Required |
| W1-3 | Thu Jul 23, 9:00 AM | 57 Google Business Profile | Sonoma County owners who have built or commissioned an AI-assisted app | Prototype-to-production page; `Send Your Prototype` | Gera | UTM-attributed sessions and `prototype_review_submitted` | Required |
| W1-4 | Fri Jul 24, 3:00 PM | Internal scorecard review | Gera / funnel owner | Weekly scorecard; no external link | Gera | Link/event QA complete; exact published URLs recorded | Internal |
| W2-1 | Mon Jul 27, 8:30 AM | Gera's LinkedIn profile | Prototype owners preparing for a pilot, customer data, payments, or business-critical use | Readiness/security checklist; `Start the Checklist` | Gera | UTM-attributed resource sessions, engaged visits, secondary calendar clicks | Required |
| W2-2 | Tue Jul 28, 10:30 AM | One-to-one email to an approved SBDC contact | Small-business support contact approved for this specific resource | Readiness checklist; one-person resource-forward ask | Gera | Reply, one qualified forward/introduction, UTM sessions | Required |
| W2-3 | Wed Jul 29, 8:30 AM | Gera's LinkedIn profile | Founders deciding whether AI-generated code should be kept, repaired, partly replaced, or rebuilt | Repair-vs.-rebuild guide; `Use the Decision Framework` | Gera | UTM-attributed resource sessions, engaged visits, secondary calendar clicks | Required |
| W2-4 | Thu Jul 30, 10:30 AM | One-to-one email to an approved economic-development contact | Economic-development contact approved for a narrow introduction request | Prototype-to-production page; request the right Chamber or member-programming contact, not promotion | Gera | Introduction made or clear next contact; no endorsement claim | Required |
| W2-5 | Fri Jul 31, 3:00 PM | Internal scorecard review | Gera / funnel owner | Weekly scorecard; no external link | Gera | Sources annotated; next two-week decision recorded | Internal |

## Approval-ready external copy

### W1-1 — LinkedIn: the gap after the demo

**Profile:** <https://www.linkedin.com/in/gerayeremin>  
**Final link:** <https://why57.com/ai-app-prototype-to-production.html?utm_source=linkedin&utm_medium=organic_social&utm_campaign=why57_ai_prototype_launch_2026q3&utm_content=w1_prototype_gap>

> AI tools can help get a working app on screen quickly.
>
> That proves the idea can exist. It does not prove the product can survive real users.
>
> Before customers, payments, or important data enter the picture, I want evidence around five things:
>
> - who owns the code, accounts, and data;
> - what users can access and change;
> - what happens when an integration or release fails;
> - how the product is tested, monitored, and recovered; and
> - who supports it after the demo becomes an operation.
>
> You may be thinking the choice is “ship the prototype” or “throw it away and rebuild.” Usually that is the wrong frame.
>
> The useful decision is what to keep, what to repair, which risky seam to replace, whether the core needs a rebuild, or whether the product question still needs validation.
>
> If you have something working and need the smallest responsible next release, send the prototype for a five-point review:
>
> [final link]

### W1-2 — Email: approved technical collaborator

**Recipient role:** Approved technical collaborator  
**Action-time requirement:** Insert the approved recipient only in the outbound draft; do not store the mapping in this repository.  
**Subject:** One specific AI-prototype referral ask  
**Final link:** <https://why57.com/ai-app-prototype-to-production.html?utm_source=founder_email&utm_medium=email&utm_campaign=why57_ai_prototype_launch_2026q3&utm_content=w1_internal_referral_ask>

> Hi [First name] — the prototype-to-production funnel is ready for a small first wave once the production release is live.
>
> I want to keep the ask narrow. If one person comes to mind who has a working AI-built app and is now deciding how to put real users, real data, or payments on it, would you be comfortable forwarding this link or making an introduction?
>
> The review is built around evidence and a practical decision: keep, repair, replace a risky seam, rebuild the core, or validate demand first. It is not a request to send this to a list, and it is not a blanket pitch for a rebuild.
>
> [final link]
>
> If nobody specific comes to mind, no action needed.

### W1-3 — Google Business Profile

**Profile:** 57 Custom Software Development, Rohnert Park  
**Public listing:** <https://share.google/WOtVrd4zFFLoNMDso>  
**Final link:** <https://why57.com/ai-app-prototype-to-production.html?utm_source=google_business_profile&utm_medium=organic_local&utm_campaign=why57_ai_prototype_launch_2026q3&utm_content=w1_local_prototype_review>

> Built a working app with Claude, ChatGPT, Lovable, Replit, Bolt, v0, Cursor, or another AI tool?
>
> The demo is only the first job. Before real users arrive, the product needs clear ownership, safe access, reliable data, failure recovery, release control, monitoring, and support.
>
> 57 helps founders and operators in Sonoma County and beyond decide what to keep, what to repair, what to rebuild, and what can wait. If the prototype works and the next move is unclear, send it for a five-point production-readiness review.
>
> [final link]

### W2-1 — LinkedIn: readiness is evidence

**Profile:** <https://www.linkedin.com/in/gerayeremin>  
**Final link:** <https://why57.com/ai-prototype-readiness-security-checklist.html?utm_source=linkedin&utm_medium=organic_social&utm_campaign=why57_ai_prototype_launch_2026q3&utm_content=w2_readiness_checklist>

> “Production-ready” is not a feeling. It is a claim with evidence attached.
>
> Before an AI-built app goes in front of real users, ask:
>
> - Who owns the repository, domain, hosting, database, and vendor accounts?
> - Can each user access only the records and actions their role requires?
> - Where do secrets live, and what happens if one is exposed?
> - What data is collected, retained, shared with AI providers, or deleted?
> - Can the team roll back a bad release and restore important data?
> - Who sees an alert and knows what to do next?
>
> A private pilot with synthetic data and a public app handling sensitive records do not need the same controls. The point is to match the evidence to the real users, data, and consequences.
>
> I put the full 12-part readiness and security checklist here:
>
> [final link]

### W2-2 — Email: approved SBDC contact

**Recipient role:** Approved SBDC contact  
**Action-time requirement:** Insert the approved recipient and appropriate greeting only in the outbound draft; do not store the mapping or private context in this repository.  
**Subject:** A narrow AI-prototype resource for one owner  
**Final link:** <https://why57.com/ai-prototype-readiness-security-checklist.html?utm_source=founder_email&utm_medium=email&utm_campaign=why57_ai_prototype_launch_2026q3&utm_content=w2_sbdc_checklist>

> Hi [First name] — I am sharing one deliberately narrow resource rather than making a broad referral request.
>
> I narrowed the resource to one specific situation: a business owner already has a working AI-built prototype, but does not know whether it is responsible to put real users, customer data, payments, or an important workflow on it.
>
> This 12-part checklist helps them inspect ownership, access, data, security, testing, deployment, monitoring, and recovery:
>
> [final link]
>
> If one advisor or client comes to mind, would you be comfortable passing it along? No event or endorsement ask—the checklist is useful on its own, and the review boundary is explicit. If nobody specific comes to mind, no action needed.
>
> Thanks,
>
> Gera

### W2-3 — LinkedIn: repair vs. rebuild

**Profile:** <https://www.linkedin.com/in/gerayeremin>  
**Final link:** <https://why57.com/ai-prototype-repair-rebuild-cost.html?utm_source=linkedin&utm_medium=organic_social&utm_campaign=why57_ai_prototype_launch_2026q3&utm_content=w2_repair_rebuild>

> Do not rebuild AI-generated code just because it looks unfamiliar.
>
> Do not keep it just because the demo works.
>
> Compare the paths against the same first release:
>
> - **Keep or repair** when the foundation is ownable, understandable, and testable, and the risks are specific.
> - **Replace a seam** when the experience is valuable but authentication, data access, payments, or another boundary cannot be trusted.
> - **Rebuild the core** when security, state, deployment, testability, or ownership cannot support the intended product.
> - **Validate first** when the bigger unknown is whether anyone needs the product enough to use or pay for it.
>
> The question is not “Can this code be saved?” The question is “Which path gets the same responsible release with the least total risk and waste?”
>
> Use the repair-vs.-rebuild decision framework:
>
> [final link]

### W2-4 — Email: approved economic-development contact

**Recipient role:** Approved economic-development contact  
**Action-time requirement:** Insert the approved recipient and any approved relationship-specific context only in the outbound draft; do not store that mapping or context in this repository.  
**Subject:** Right contact for an educational AI-prototype resource?  
**Final link:** <https://why57.com/ai-app-prototype-to-production.html?utm_source=founder_email&utm_medium=email&utm_campaign=why57_ai_prototype_launch_2026q3&utm_content=w2_city_chamber_intro>

> Hi [First name] — I have narrowed this resource to one concrete case: a business owner has already built an app with an AI tool and needs to decide what can be kept, what needs repair, and what must be in place before real users or customer data are involved.
>
> The five-point review is here:
>
> [final link]
>
> If this fits your remit, would you be open to pointing me to the right Chamber or member-programming contact for a short conversation about whether the resource is useful?
>
> I am not asking your organization to promote or endorse 57. I would just value the right conversation about whether this narrow resource is useful to local owners.
>
> Thanks,
>
> Gera

## Partner shortlist decision

The first wave is intentionally limited to three recipients:

| Recipient | Why now | Risk control | Decision |
| --- | --- | --- | --- |
| Approved technical collaborator | May know one real prototype owner. | Ask for one person, not a list; do not claim endorsement. | First wave after recipient approval. |
| Approved SBDC contact | Can assess whether the resource is useful to one relevant owner or advisor. | Resource-first; no event, promotion, or endorsement request. | First wave after recipient approval. |
| Approved economic-development contact | Can point to the appropriate Chamber or member-programming role. | Ask for the right contact only; make clear no promotion or endorsement is requested. | First wave after recipient approval. |

Not included in the first wave:

- Any unapproved or stale contact: excluded until current relationship context is confirmed privately at action time.
- Any scraped agency, MSP, founder, or chamber list: excluded because there is no approved relationship context.

## Measurement and scorecard entry

Do not annotate a launch before an item is actually public or sent.

For each live item, record:

- exact post URL or sent-message thread;
- publish/send timestamp in America/Los_Angeles;
- final destination URL and UTM tuple;
- HTTP/canonical verification result;
- first observed UTM-attributed sessions;
- `prototype_review_submitted` count;
- `calendar_booking_clicked` count, labeled as a micro-conversion;
- replies, forwards, introductions, qualified leads, and not-fit reasons;
- any attribution or delivery QA issue.

Two-week operating threshold—not a forecast:

- **Technical pass:** every released link resolves correctly, attribution is visible, and expected events fire once.
- **Qualified signal:** at least one qualified `prototype_review_submitted` or two explicit partner/prospect replies or introductions.
- **No qualified signal:** do not add volume. Review which message produced engaged visits, inspect the landing-page promise and form friction, and revise one variable for the next two weeks.

## Approval record

Immediately before any external action, copy the exact block into the approval request and record Gera's answer here.

| ID | Copy approved | Recipient/channel approved | Final link rechecked | Published/sent | Public URL or approved sent-message record |
| --- | --- | --- | --- | --- | --- |
| W1-1 |  |  |  |  |  |
| W1-2 |  |  |  |  |  |
| W1-3 |  |  |  |  |  |
| W2-1 |  |  |  |  |  |
| W2-2 |  |  |  |  |  |
| W2-3 |  |  |  |  |  |
| W2-4 |  |  |  |  |  |
