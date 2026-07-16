# why57 Intake Worker

This Worker accepts two kinds of first-party lead context for `why57.com`:

- ROI calculator attribution at `/`
- AI prototype production-readiness review requests at `/prototype-review`

The production endpoint is `https://why57-roi-intake.gera-695.workers.dev/`.

## Prototype review flow

`ai-app-prototype-to-production.html` progressively enhances a normal HTML form:

- With JavaScript, the page posts JSON and shows an inline success or error state.
- Without JavaScript, the browser posts URL-encoded form data and the Worker redirects a successful request to `prototype-review-thank-you.html`.
- The Worker accepts requests only from `https://why57.com`, validates every field, limits the body to 48 KiB, uses a honeypot and timing trap, and can apply a hashed per-IP KV rate limit.
- A successful submission is stored in the existing `ROI_LEADS` KV namespace and accepted by the configured delivery webhook before the Worker reports success.
- The webhook receives the same normalized payload for CRM or inbox notification. If delivery fails after storage, KV remains the source of truth, but the form receives a non-success response instead of claiming the request arrived.

The form sends name, email, optional company, prototype URL, prototype description, tool, current-user range, blocker, target window, consent, and first-party attribution fields. It does not intentionally store the submitter's IP address or user agent.

## KV records and retention

ROI records keep their existing keys:

- `event:<yyyy-mm-dd>:<session_id>:<uuid>` for interactions such as calculator and booking-button clicks
- `lead:<yyyy-mm-dd>:<session_id>:<uuid>` only for standardized completed outcomes
- `latest:<session_id>`

Each ROI record also keeps the offer, page path, conversion stage, and available first-touch source fields. A booking-button click is an interaction, not a completed lead; the lead key is reserved for `prototype_review_submitted`, `lead_submitted`, `roi_report_requested`, and `calendar_booking_completed`.

Prototype review records use:

- `prototype_review:<yyyy-mm-dd>:<uuid>`
- `latest:prototype_review`
- `rate:prototype_review:<yyyy-mm-ddThh>:<salted-ip-hash>` for the optional hourly rate limit

Lead records expire after `ROI_DATA_TTL_SECONDS`, currently 180 days. `PROTOTYPE_REVIEW_DATA_TTL_SECONDS` can override that retention for prototype reviews. Rate-limit counters expire after one hour.

## Bindings and variables

- `ROI_LEADS` — required KV binding for all durable submissions
- `ROI_DATA_TTL_SECONDS` — default lead retention in seconds
- `PROTOTYPE_REVIEW_DATA_TTL_SECONDS` — optional prototype-specific retention override
- `ROI_REPORT_RATE_LIMIT_SALT` — secret used to hash an hourly report-request rate-limit key
- `ROI_REPORT_WEBHOOK_URL` — required secret URL for report email or CRM delivery
- `ROI_REPORT_WEBHOOK_SECRET` — optional report-specific webhook secret; falls back to `ROI_FORWARD_WEBHOOK_SECRET`

The existing binding is declared in `wrangler.toml`. Do not put webhook credentials or rate-limit salts in that file.

## Secrets and notification setup

Set these before releasing the prototype form:

```bash
npx wrangler secret put PROTOTYPE_REVIEW_RATE_LIMIT_SALT
npx wrangler secret put PROTOTYPE_REVIEW_FORWARD_WEBHOOK_URL
npx wrangler secret put PROTOTYPE_REVIEW_FORWARD_WEBHOOK_SECRET
npx wrangler secret put ROI_REPORT_RATE_LIMIT_SALT
npx wrangler secret put ROI_REPORT_WEBHOOK_URL
npx wrangler secret put ROI_REPORT_WEBHOOK_SECRET
```

- `PROTOTYPE_REVIEW_RATE_LIMIT_SALT` should be a long random value. Without it, submissions still validate and store, but KV rate limiting is disabled.
- `PROTOTYPE_REVIEW_FORWARD_WEBHOOK_URL` must be the real CRM, automation, or notification endpoint that will alert the team. Without it, the Worker returns `delivery_not_configured` and does not claim or store a successful submission.
- `PROTOTYPE_REVIEW_FORWARD_WEBHOOK_SECRET` is optional if the receiving endpoint uses another authentication mechanism. When set, it is sent as `X-Prototype-Review-Webhook-Secret`.

The existing ROI forwarding secrets remain `ROI_FORWARD_WEBHOOK_URL` and `ROI_FORWARD_WEBHOOK_SECRET`.

The root intake route accepts only `calendar_booking_clicked` and `roi_report_requested`. Booking clicks are stored as micro-conversion events. Report requests are counted as completed outcomes only after server-side email, consent-version, timing, origin, storage, and webhook checks succeed. The endpoint returns a non-success status when report delivery is not configured or fails, so the calculator never displays a false success state.

## Release order

The site currently points the form at the production Worker URL. Release in this order so the page never advertises a route the deployed Worker does not understand:

1. Configure the prototype rate-limit salt and real notification webhook.
2. From this directory, run `npx wrangler deploy`.
3. Check `GET /prototype-review`. It reports whether storage, rate limiting, and forwarding are configured without revealing their values.
4. Submit a non-sensitive test request and confirm both the KV record and notification destination.
5. Release the static site, including the funnel page, script, thank-you page, and privacy update.
6. Submit once with JavaScript and once with JavaScript disabled. Confirm the analytics event `prototype_review_submitted` appears only after a successful response.

Do not publish the static form before the Worker update.

## Local and remote checks

Validate the Worker bundle without deploying:

```bash
npx wrangler deploy --dry-run
```

After deployment, inspect the latest prototype review without printing all stored leads:

```bash
npx wrangler kv key get "latest:prototype_review" --binding ROI_LEADS --remote --text
```

Delete a test record by its exact key after QA if it is no longer needed:

```bash
npx wrangler kv key delete "prototype_review:<yyyy-mm-dd>:<uuid>" --binding ROI_LEADS --remote
```

## Related files

- `worker.js`
- `wrangler.toml`
- `../../ai-app-prototype-to-production.html`
- `../../prototype-funnel.js`
- `../../prototype-review-thank-you.html`
- `../../privacy.html`
- `../../ROI-INTEGRATION.md`
- `../../ANALYTICS.md`
