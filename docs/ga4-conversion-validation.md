# GA4 conversion validation

Audited July 15, 2026. GA4 property timezone: `America/Los_Angeles`. This is a pre-release baseline: the Production Release task has confirmed that the Worker, main site, and ROI calculator release is still gated and that neither approved labeled smoke submission has run.

## Decision status

- Do not interpret the new event names in GA4's recent-event list as proof that the production release works. They can include earlier, local, or unlabeled traffic.
- Do not change the live key-event configuration until one labeled production prototype review and one labeled production ROI report have both succeeded in the destination system and appeared exactly once in DebugView.
- Keep `calendar_booking_clicked` as a micro-conversion. It is not a lead and does not prove a completed booking.
- Leave `calendar_booking_completed` unconfigured. The current Google Calendar appointment-schedule booking page has no documented client-side completion redirect or webhook.

## Property and stream audit

| Check | Observed state | Practical implication |
| --- | --- | --- |
| Property | `why57.com`, property ID `531150669`, Los Angeles timezone, USD | Timezone is correct for weekly reporting. |
| Web stream | One active stream: `why57.com`, stream ID `14308139159`, measurement ID `G-358H0FHG50` | The stream was receiving traffic in the prior 48 hours. |
| Google tag | Tag ID `GT-552SP44M`; quality reported as Excellent | Tag delivery is active, but this does not validate business outcomes. |
| Enhanced measurement | On, including page views, scrolls, and outbound clicks | Automatic events must stay separate from lead outcomes. |
| Cross-domain admin setting | No domain conditions configured | Add both owned hosts after the release smoke test. The release-candidate code now configures the same linker domains on both the main site and ROI calculator, but the property setting still needs live verification. |
| Referral exclusions | None configured | No exclusion is needed merely because an external calendar link is clicked. Add only a provider that sends users back and creates a verified unwanted referral. |
| Internal traffic | No rules; the `Internal Traffic` exclusion filter exists in Testing state | The filter currently marks nothing. Add known office/test IP rules and verify them before activating the filter. |
| DebugView | Zero debug devices during the audit | Exact-once production validation remains outstanding. |
| Live key events | `generate_lead` is marked; GA4's automatic `purchase` key event is present with no stream data | `generate_lead` should be unmarked after release validation confirms no real general-lead flow uses it. The automatic `purchase` row has no reporting effect while no purchase event is sent. |

GA4's recent-event list included `prototype_review_submitted` and `roi_report_requested`, but the processed 90-day Events report had no rows for either. The release owner also confirmed that the approved production submissions have not happened. Treat coverage as unavailable, not as zero demand.

## Baseline funnel

### Acquisition

| Period | Sessions | Engaged sessions | Engagement rate | Average engagement time | Reported key events |
| --- | ---: | ---: | ---: | ---: | ---: |
| June 17–July 14, 2026 | 100 | 41 | 41% | 30 seconds | 0 |
| April 16–July 14, 2026 | 301 | 102 | 33.89% | 29 seconds | 0 |

The 90-day channel totals were Direct 202, Unassigned 60, Organic Search 20, Referral 13, Organic Social 4, Email 1, and Mobile Push Notifications 1.

Source/medium inspection also exposed internal campaign pollution: at least 54 sessions were attributed to `why57` UTMs (`site_nav` 50, `footer_link` 2, and `intake_primary` 2). A hostname view included `why57.com`, `roi.why57.com`, and `127.0.0.1`; the UI did not expose trustworthy hostname counts during this audit. Do not manufacture a split.

### Behavior and outcomes, April 16–July 14

| Signal | GA4 state | Reporting treatment |
| --- | ---: | --- |
| `page_view` | 1,151 events | Context only. |
| `user_engagement` | 834 events | Context only. |
| `calculator_started` | 439 events | Historic count is invalid as a funnel start because the pre-release code fired on page load. The release candidate gates it on intentional interaction. |
| `calculator_completed` | 439 events | Historic count is invalid as a completion because the pre-release defaults caused it to fire on page load. The release candidate requires an explicit result action or all four steps to be changed. |
| `main_site_booking_clicked` | 7 events / 6 users | Legacy micro signal; not a lead or booking. |
| `roi_calculator_clicked` | 2 events / 2 users | Micro signal. |
| `prototype_review_submitted` | Coverage unavailable | New event was not present as a processed report row; wait for the labeled test. |
| `roi_report_requested` | Coverage unavailable | New event was not present as a processed report row; wait for the labeled test. |
| `lead_submitted` | Not implemented | No real general lead form currently exists. |
| `calendar_booking_completed` | Not implemented | No trusted completion integration exists. |

This baseline cannot support a real submission rate, booking rate, or lead count. Use `—` for those fields until the outcome events are validated and reconciled to their source systems.

## Release validation protocol

Run only after the release owner confirms Worker → main site → ROI calculator are all public.

1. Start one debug-enabled browser/device and record the GA4 device name, property timezone, release identifier, test label, and local timestamp.
2. Submit one approved labeled prototype review. Record the Worker response time and destination-system record/delivery. In DebugView, require exactly one `prototype_review_submitted` event after the successful response and no `generate_lead` alias.
3. Submit one approved labeled ROI report. Record the Worker response time and delivered report. In DebugView, require exactly one `roi_report_requested` event after the successful response.
4. For both events, check the page/network trace and DebugView sequence for duplicate dispatch. A custom DOM event or Worker storage record is not a second GA4 event.
5. Click one calendar CTA. Require exactly one `calendar_booking_clicked` event with micro-conversion context, and require no `calendar_booking_completed`, lead, or submission event.
6. Load the ROI calculator without interacting. Require zero `calculator_started`, `calculator_completed`, and `result_bucket_viewed` events. Change one field and require exactly one start with no completion; then use an explicit result action and require exactly one completion and one current result bucket.
7. Cross from `why57.com` to `roi.why57.com`. Verify the same GA client/session identity is retained and that neither hostname becomes a referral. Repeat once after adding the GA4 domain conditions.
8. Record any path not tested. Annotate or exclude the labeled test traffic; never silently count it as demand.
9. After standard-report processing, reconcile the two GA4 outcome counts with the Worker/delivery records for the same window.

If an outcome fires zero times or more than once, stop the key-event change. Capture timestamp, page, browser, release identifier, expected behavior, actual behavior, and the relevant DebugView/network evidence for QA.

## Exact key-event recommendation

After the release validation passes, request confirmation immediately before making these live GA4 changes:

| Event | Recommended state | Gate |
| --- | --- | --- |
| `prototype_review_submitted` | Mark as key event | Exactly one event for the successful labeled production review and a matching delivered intake. |
| `roi_report_requested` | Mark as key event | Exactly one event for the successful labeled production request and a matching delivered report. |
| `lead_submitted` | Leave unmarked | Mark only after a real general lead form exists and its accepted submission is validated once. |
| `calendar_booking_completed` | Leave unmarked | Mark only after a trusted provider-side confirmation is implemented and deduplicated. |
| `calendar_booking_clicked` | Leave unmarked | Always a micro-conversion. |
| `generate_lead` | Unmark | No current real general-lead flow uses this event. Reconfirm in the production smoke test. |
| `purchase` | No action | GA4 exposes it as an automatic key event; Why57 currently sends no purchase data. |

## Calendar completion decision

Google documents that an appointment becomes a Calendar event after booking, but its appointment-schedule setup and embed documentation do not expose a custom success redirect or browser callback. The Calendar API does support authenticated event-change notifications through `events.watch`, so a trusted server-side implementation is possible, but it does not exist today.

The smallest reliable implementation is:

1. Use a dedicated booking calendar or a verified, stable appointment-event marker.
2. Authorize a backend integration to that calendar and create an `events.watch` channel to an HTTPS Worker endpoint.
3. Validate the channel ID/token/resource, fetch changes with an incremental-sync token, and identify only newly created in-scope booked appointments.
4. Deduplicate by calendar ID plus Calendar event ID; treat updates, reschedules, and cancellations separately.
5. Send `calendar_booking_completed` to GA4 with Measurement Protocol only after that provider-side event is confirmed. Keep the GA4 API secret server-side.
6. Renew expiring watch channels and run incremental reconciliation because notifications contain no event body and delivery is not guaranteed to be complete.

Until that exists, a click, elapsed time, focus return, or thank-you text observed in the browser is not a completed booking.

Official references: [appointment schedules](https://support.google.com/calendar/answer/11608416), [appointment schedule setup](https://support.google.com/calendar/answer/10729749), [share/embed options](https://support.google.com/calendar/answer/10733297), [Calendar API watch](https://developers.google.com/workspace/calendar/api/v3/reference/events/watch), [push notifications](https://developers.google.com/workspace/calendar/api/guides/push), and [incremental sync](https://developers.google.com/workspace/calendar/api/guides/sync).

## Biweekly audit

Every two weeks, use a closed 14-day window in the property's Los Angeles timezone and retain the prior comparable window.

1. Record property, stream, dates, timezone, release/marketing annotations, filters, and whether both owned hostnames are included.
2. Export sessions and engaged sessions by hostname, default channel group, and session source/medium. Flag localhost traffic, owned-domain referrals, and internal `why57` UTMs.
3. Export counts and users for validated outcomes and declared micro-conversions. Use `—` when coverage is unavailable; use `0` only when tracking was verified operational for the whole window.
4. Reconcile each outcome with the Worker/delivery system. Investigate any mismatch, duplicates, or outcome without a destination record.
5. Confirm key-event membership has not drifted. Outcome events may be key; clicks and page-load behavior events may not.
6. Run one non-production/debug exact-once check per outcome after any release that touches forms, analytics, the Worker, or the ROI calculator.
7. Review cross-domain identity, unwanted referrals, internal-traffic rules/filter state, and DebugView availability. Do not activate a Testing internal filter until test-IP marking is visible.
8. Record defects and the smallest next action. Do not backfill guessed conversions.
