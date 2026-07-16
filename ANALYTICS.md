# Analytics and attribution

This site uses the existing GA4 measurement ID `G-358H0FHG50` on `why57.com` and is designed to share the same web data stream with `roi.why57.com`.

The repair was made against this baseline: 301 sessions in 90 days, 20 organic sessions, no reported key-event outcomes, and roughly 50 sessions attributed to `why57 / site_nav`. Treat that as the pre-repair comparison period rather than a target.

## Browser implementation

`analytics.js` is the single browser entry point on every tracked public content page. The authenticated analytics dashboard is intentionally excluded so routine reporting work does not create page views. The entry point:

- loads and configures the existing Google tag;
- configures the linker for `why57.com` and `roi.why57.com` before the GA4 `config` command;
- accepts incoming `_gl` linker parameters and decorates cross-domain links/forms;
- removes only the known legacy internal campaign combination before GA4 records the page view;
- records first-touch attribution in `why57_first_touch` on `.why57.com`, with local storage as a same-host fallback;
- adds first-touch, page, CTA, and offer context to custom events;
- records calendar and ROI destination clicks as micro-conversions.

Do not add UTM parameters to links between `why57.com` and `roi.why57.com`. UTMs describe acquisition campaigns, not navigation between owned experiences. The Google linker preserves the active GA4 user/session; the shared first-touch cookie preserves the original acquisition context.

The legacy cleanup is deliberately narrow. It removes `utm_source=why57` (or an equivalent Why57 hostname) only when paired with `utm_campaign=main_site_referral` or one of the former internal media values. The same known combination is removed from older ROI context cookies before server-side context is stored. Legitimate external campaign parameters and click IDs are left untouched.

## First-touch fields

The first valid visit creates a two-year first-party record. It is never overwritten by later visits.

Stored values can include:

- `source` and `medium`;
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_id`, `utm_source_platform`, `utm_term`, and `utm_content`;
- supported advertising click IDs;
- `landing_page`, external `referrer_host`, and `captured_at`.

Custom GA4 events receive the corresponding `first_touch_*` fields. Register only the fields used in reporting as event-scoped custom dimensions; GA4 still handles its own session and attribution dimensions separately.

Do not put names, email addresses, phone numbers, free-form form content, or other personal data in GA4 event parameters, URLs, or the first-touch record.

## Event contract

An event ending in `_submitted`, `_requested`, or `_completed` must represent a successful outcome. Button and outbound-link clicks are intent signals only.

| Event | Fire only when | GA4 key event | Current status |
| --- | --- | --- | --- |
| `prototype_review_submitted` | A prototype-review form or API has accepted the request | Yes, after validation | Implemented; awaiting one labeled production delivery test |
| `lead_submitted` | A general lead form or API has accepted the lead | Not yet | No general lead form exists on this site |
| `roi_report_requested` | The ROI report request has been accepted and delivered | Yes, after validation | Implemented in the ROI calculator; awaiting one labeled production delivery test |
| `calendar_booking_clicked` | A visitor clicks a Google Calendar booking link | No | Implemented automatically as a micro-conversion |
| `calendar_booking_completed` | The scheduler or a trusted backend confirms an appointment was created | Not yet | Not observable from the current external Google Calendar link |
| `roi_calculator_clicked` | A visitor clicks from the main site to the calculator | No | Implemented automatically as a micro-conversion |

Required context for CTA-driven events:

- `cta_location`
- `cta_text`
- `offer`
- `page_path`
- `page_title`
- `page_type`

`analytics.js` adds the page and first-touch fields automatically. Automatic CTA tracking derives a useful default, while `data-cta-location` and `data-offer` can override ambiguous links.

Fire a completion event only in the success handler, after the form or backend confirms acceptance:

```js
window.why57Analytics.track("lead_submitted", {
  form_id: "contact_form",
  submission_method: "website",
  cta_location: "contact_form",
  offer: "strategy_call"
});
```

Do not fire the same event once on submit and again on a thank-you page. Pick one authoritative success point and deduplicate retries there.

## GA4 account configuration

The repository can install the tag, but the following settings require Editor access to the GA4 property.

### Cross-domain measurement

1. Open **Admin > Data collection and modification > Data streams**.
2. Open the web stream for `G-358H0FHG50`.
3. Open **Configure tag settings > Configure your domains**.
4. Include both `why57.com` and `roi.why57.com`, then save.
5. Confirm the ROI calculator uses the same measurement ID and the same linker configuration before its `config` command.

The code-level linker is intentional for this static site, but the GA4 Admin setting should also be present so the property configuration is visible and auditable.

### Key events

After each implemented completion event has appeared exactly once in Realtime or DebugView and has a matching delivery-system record:

1. Open **Admin > Data display > Events**.
2. Mark `prototype_review_submitted` and `roi_report_requested` as key events.
3. Leave `lead_submitted` and `calendar_booking_completed` unmarked until those outcomes are implemented and validated.
4. Leave `calendar_booking_clicked` and `roi_calculator_clicked` unmarked; report them as micro-conversions or funnel steps.
5. Confirm no real flow still uses `generate_lead`, then unmark it so legacy configuration does not imply current lead coverage.
6. Check for older click-based events such as `main_site_booking_clicked` before removing or archiving downstream reports that use them.

### Internal employee traffic

Employee/developer traffic exclusion is different from cross-domain referral handling.

1. Open the web data stream and choose **Configure tag settings > Show all > Define internal traffic**.
2. Create rules for the real office, home, VPN, and monitoring IP addresses. Do not guess IPs.
3. In **Admin > Data collection and modification > Data filters**, set the Internal Traffic filter to **Testing** first.
4. Verify that internal visits carry `traffic_type=internal` and that the test-data filter dimension behaves as expected.
5. Activate the filter only after verification. Active filters permanently exclude matching future data.

Use a separate GA4 test property or DebugView for automated monitoring when a stable source IP is not available.

## Calendar completion options

The current `calendar.app.google` link exposes the click but does not provide this page with a trustworthy client-side completion callback. Therefore the site must not infer `calendar_booking_completed` from the click, tab return, or elapsed time.

Use one of these options when credentials and scheduler capabilities are available:

1. **Trusted backend confirmation:** observe newly created appointment events through an authorized Calendar integration, deduplicate by booking/event ID, and send `calendar_booking_completed` through GA4 Measurement Protocol. This requires Calendar credentials and a GA4 API secret stored server-side.
2. **Verified scheduler callback:** use an embedded scheduler that documents a booking-complete callback or `postMessage` event, validate its origin and payload, and fire the completion once.
3. **Provider-controlled success redirect:** if the scheduler can redirect only after a confirmed booking, send the visitor to a dedicated confirmation page and fire once there. A public query parameter alone is not proof of completion.

## Test plan

### Static and local checks

- Every tracked public content HTML file loads exactly one correctly relative `analytics.js`; `dashboard.html` remains excluded.
- No owned-site ROI link contains `utm_source=why57`, `site_nav`, or `main_site_referral`.
- JavaScript syntax checks pass for `analytics.js`, `main.js`, `roi-bridge.js`, and the Worker.
- Internal navigation and ROI teaser query parameters such as `hours_lost` still work.

### Browser QA

1. Clear the `why57_first_touch` cookie and local storage.
2. Visit `why57.com/?utm_source=qa_external&utm_medium=cpc&utm_campaign=attribution_test`.
3. Confirm the first-touch record contains those values and a second visit with different UTMs does not overwrite it.
4. Click an ROI link. Confirm the destination contains `_gl`, contains no Why57 internal UTMs, and retains one GA4 session/client journey in DebugView.
5. Visit a legacy URL using `utm_source=why57&utm_medium=site_nav&utm_campaign=main_site_referral`. Confirm those three parameters disappear before the page view while unrelated parameters remain.
6. Click a calendar CTA. Confirm exactly one `calendar_booking_clicked` event with `conversion_stage=micro` plus CTA, offer, page, and first-touch fields.
7. Confirm no `lead_submitted`, `prototype_review_submitted`, or `calendar_booking_completed` event fires from that click.
8. Load the ROI calculator without interacting. Confirm no `calculator_started`, `calculator_completed`, or `result_bucket_viewed` event fires.
9. Change one calculator input. Confirm one `calculator_started` and no `calculator_completed`.
10. Use an explicit result action or intentionally change a field in all four steps. Confirm one `calculator_completed`, one current `result_bucket_viewed`, and no duplicate lifecycle event on repeated result interaction.
11. Complete an actual ROI report request after the calculator is instrumented. Confirm exactly one `roi_report_requested` event at the success point.

### Production reporting QA

- Compare self-referrals and `why57 / site_nav` sessions after release against the baseline period.
- Confirm organic, paid, referral, and direct acquisition remain distinct.
- Confirm Realtime/DebugView first, then standard reports after normal GA4 processing delay.
- Annotate the release date in reporting so the attribution break is not mistaken for an organic traffic change.

## Credential-dependent follow-up

- GA4 Editor access for domain configuration, custom dimensions, key events, and the internal-traffic filter.
- Access to the ROI calculator repository/deployment to mirror `analytics.js` behavior and fire `roi_report_requested` at the real success point.
- Calendar integration credentials or a scheduler with a verified completion callback.
- A GA4 Measurement Protocol API secret if booking completion is sent server-side.
- Real internal IP ranges from the business/VPN owner.
