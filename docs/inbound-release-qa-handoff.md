# Inbound release QA handoff

Updated July 15, 2026. This document separates code that passed QA from live work that still requires an authenticated release or account change.

## Decision

The integrated site and Worker code are ready for release after the deployment prerequisites below are supplied. The public site and public Worker were still serving the previous release during this audit, so the new funnels cannot be counted as live conversions yet.

## Verified locally

- The static-site QA suite, JavaScript syntax checks, analytics tests, Worker tests, and SEO audit pass.
- Four representative mobile pages render at 390 × 844 without horizontal overflow.
- Prototype-review validation, inline success feedback, and the thank-you page were exercised in a real browser.
- The Worker dry run succeeds with the configured KV binding and observability enabled.
- Unsupported pricing, timelines, experience claims, and client outcome numbers were removed or replaced with bounded evidence language.
- The main site and ROI calculator use the same first-touch attribution cookie and no longer overwrite acquisition with internal campaign parameters.
- `calendar_booking_clicked` is a micro-conversion. It is not reported as a lead or a completed booking.

## Live baseline observed

- Search Console, April 14 through July 13: 9 clicks, 7,965 impressions, 0.1% CTR, average position 9.6.
- The homepage produced 7 clicks from 7,074 impressions. This makes search-snippet relevance and intent matching the largest current acquisition opportunity.
- `/sitemap.xml` was successful with 15 discovered pages. The stale `/sitemap_index.xml` submission still could not be fetched.
- Seven parameterized homepage URLs were reported as blocked by the old blanket query-string robots rule.
- GA4 showed 301 sessions in the inspected 90-day report. Its key-event list contained `generate_lead` and the automatic `purchase` event; the new prototype-review and ROI-report outcomes were not yet live key events.

## Required release order

1. **Configure and deploy the Worker first.** Confirm the production KV binding, allowed origins, prototype-review notification destination, ROI-report delivery webhook, and rate-limit salts. A report request must not return success unless delivery succeeds.
2. **Deploy the main site.** Confirm the new prototype pages, analytics script, sitemap, robots file, retired-page handling, and form endpoint are public.
3. **Deploy the ROI calculator changes.** Confirm clean cross-subdomain attribution, one `calendar_booking_clicked` event per click, and one `roi_report_requested` event after a successful report request.
4. **Run live smoke tests.** Submit one clearly labeled test prototype review and one test ROI report, verify storage and delivery, then exclude or annotate the test traffic.
5. **Configure GA4 outcomes.** Make successful `prototype_review_submitted`, `lead_submitted`, and `roi_report_requested` events key events after DebugView confirms one event per real submission. Do not mark `calendar_booking_clicked` as a primary conversion. Add `calendar_booking_completed` only when a trusted scheduling-provider completion signal exists.
6. **Refresh Search Console.** Remove the failed `/sitemap_index.xml`, resubmit `/sitemap.xml`, confirm 14 discovered canonical pages after the new release is read, and request indexing for the AI-prototype page plus the priority commercial pages.

## Owner verification still required

- Confirm which client names, logos, screenshots, outcomes, and testimonials are approved for public use.
- Confirm the real lead-delivery destination and who owns response-time follow-up.
- Confirm whether the calendar provider can supply a signed webhook or redirect that proves a completed booking.
- Approve the first two weeks of distribution and partner outreach before anything is sent.

## Task disposition

The content, technical SEO, trust-copy, growth-kit, analytics-code, AI-funnel-code, and ROI-code implementation tasks are code-complete and can be archived after their commits are present in the integration branches. Live deployment, authenticated GA4/Search Console changes, delivery verification, and evidence approval remain open in this pinned QA task.
