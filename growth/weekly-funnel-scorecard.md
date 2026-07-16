# Weekly funnel scorecard

Use this scorecard every week, including weeks with no publishing or no conversions. The purpose is to find the constraint between visibility, qualified attention, action, and revenue—not to reward activity.

## Supplied baseline

| Metric | Baseline | Period / caveat |
| --- | ---: | --- |
| GA4 sessions | 301 | 90 days; about 23.4 per seven days for rough context only. |
| GA4 organic sessions | 20 | 90 days; about 1.6 per seven days for rough context only. |
| GA4 reported key-event outcomes | 0 | April 16–July 14, 2026; `generate_lead` was configured as a key event but recorded no outcome in the audited report. |
| GSC clicks | 9 | April 14–July 13, 2026. |
| GSC impressions | 7,965 | April 14–July 13, 2026. |
| GSC CTR | 0.1% | Supplied rounded value; 9 / 7,965 is about 0.113%. |
| GSC average position | 9.6 | Impression-weighted; do not average weekly averages into a longer period. |
| External links | 11 | Source and snapshot date not supplied; treat as a periodic context metric. |

Record the property, date range, filters, and timezone with the first export. Why57 operates in `America/Los_Angeles`; keep weekly cutoffs consistent.

## Weekly scorecard

| Week ending | Sessions | Organic sessions | GSC clicks | GSC impressions | GSC CTR | Avg. position | Primary CTA clicks | Prototype / lead starts | Leads submitted | Qualified leads | Calls booked | Proposals | Wins | Notes / releases |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| [YYYY-MM-DD] |  |  |  |  |  |  |  |  |  |  |  |  |  | [annotation] |
| [YYYY-MM-DD] |  |  |  |  |  |  |  |  |  |  |  |  |  | [annotation] |
| [YYYY-MM-DD] |  |  |  |  |  |  |  |  |  |  |  |  |  | [annotation] |

## Metric contract

| Metric | Definition | Source | QA rule |
| --- | --- | --- | --- |
| Sessions | GA4 sessions for `why57.com`; state whether ROI subdomain traffic is included. | GA4 | Same property, hostname filter, timezone, and seven-day window each week. |
| Organic sessions | Sessions whose session default channel group is Organic Search. | GA4 | Do not substitute first-user channel. |
| GSC clicks / impressions / CTR / position | Search performance for the canonical site property. | Search Console | Export query and page detail; compare like date ranges and search types. |
| Primary CTA clicks | Clicks on the week’s declared CTA, deduplicated by event design. | GA4 event | Verify event once in debug view before counting it. |
| Lead starts | Intentional first interaction with the prototype-review or another real lead flow. | GA4 event | No personal data in event properties. |
| Leads submitted | Successful accepted submissions, not button clicks. | Form/CRM plus GA4 | Reconcile analytics to the destination system. |
| Qualified leads | Submitted leads matching the approved fit criteria. | CRM/manual register | Owner and reason required. |
| Calls booked | Completed booking confirmation for an in-scope call. | Calendar/CRM | Deduplicate reschedules and cancellations. |
| Proposals / wins | Commercial stages with explicit status and value in the source of truth. | CRM/manual register | No inference from email activity. |
| External links | Referring-link snapshot, reviewed monthly rather than weekly. | GSC or chosen backlink source | Record tool, snapshot date, and gained/lost links. |

## Derived rates

Calculate only when the denominator is meaningful, and show `—` instead of pretending a zero-denominator rate is 0%.

- **Organic share** = organic sessions / sessions.
- **Search CTR** = GSC clicks / GSC impressions.
- **CTA rate** = primary CTA clicks / relevant landing-page sessions.
- **Lead completion** = leads submitted / lead starts.
- **Qualification rate** = qualified leads / leads submitted.
- **Booking rate** = calls booked / qualified leads.
- **Win rate** = wins / proposals.

Add a four-week rolling total for counts. For rates, recompute from the four-week numerator and denominator; do not average weekly percentages.

## Five-question Friday review

1. **Did measurement work?** If an expected event is zero, verify the implementation before concluding that users did nothing.
2. **Where is the constraint?** Visibility, click-through, engagement, CTA, form completion, qualification, booking, or close?
3. **What changed?** Record publishing, metadata, links, downtime, campaigns, tracking changes, and unusual referral traffic.
4. **What did we learn from actual queries and conversations?** Capture language, objections, and fit—not just totals.
5. **What single change will we test next week?** Name the owner and the metric expected to move.

## Biweekly GA4 integrity audit

Every second Friday, run the measurement audit in [GA4 conversion validation](../docs/ga4-conversion-validation.md) before interpreting funnel movement.

- Use a closed 14-day window in the property's Los Angeles timezone and record the property, stream, filters, hostnames, and release annotations.
- Reconcile successful submission outcomes to the Worker/delivery records. Treat `calendar_booking_clicked` and other CTA clicks as micro-conversions, never leads or completed bookings.
- Show `—` when event coverage was unavailable. Enter `0` only when tracking was verified operational for the full window.
- Check key-event membership, cross-domain identity, owned-domain or localhost pollution, unwanted referrals, internal-traffic rules/filter state, DebugView, and duplicate firing.
- After any relevant release, run one debug exact-once check for each outcome before using it in this scorecard.

## Diagnosis rules

| Pattern | Likely constraint | Next check |
| --- | --- | --- |
| Impressions rise; clicks do not | Search snippet or query-intent mismatch | Inspect page/query CTR, title, description, and competing results. |
| Clicks rise; engaged actions do not | Landing-page promise or UX mismatch | Check page speed, mobile layout, first screen, and CTA relevance. |
| CTA clicks rise; submissions do not | Form friction, trust, or broken success state | Replay the flow; inspect validation, labels, errors, confirmation, and delivery. |
| Submissions rise; qualified leads do not | Targeting or offer boundaries are unclear | Tighten referral signals, not-fit language, and intake questions. |
| Qualified leads rise; bookings do not | Scheduling or follow-up breakdown | Verify thank-you state, calendar link, response owner, and latency. |
| Analytics says zero while source systems show activity | Instrumentation failure | Fix and annotate tracking; do not backfill guessed events. |

## Weekly decision log

| Week ending | Evidence | Decision | Owner | Expected signal | Review date |
| --- | --- | --- | --- | --- | --- |
| [YYYY-MM-DD] | [metric + qualitative evidence] | [one change] | [name] | [metric/direction] | [YYYY-MM-DD] |
