# why57 ROI Integration

This document describes how `why57.com`, `roi.why57.com`, GA4, and the Cloudflare Worker fit together.

## What is live

- `roi.why57.com` runs the ROI calculator
- `why57.com` links to the calculator and reads shared ROI context back from the calculator
- GA4 is shared across both hostnames
- a Cloudflare Worker stores ROI interaction context server-side at `https://why57-roi-intake.gera-695.workers.dev/`

## Why this exists

The calculator already gives a recommendation, score, and break-even range. The Worker makes that information durable so it does not live only in browser cookies or analytics reports.

That gives the site:

- stronger attribution
- persistent lead context
- cleaner handoff from calculator to booking
- a future-ready place to forward data into another backend if needed

## Data flow

1. A visitor uses `roi.why57.com`.
2. The calculator fires GA4 events and writes `why57_roi_context` on `.why57.com`.
3. Booking CTA clicks on the calculator can send a best-effort interaction POST to the Worker.
4. `why57.com` reads the shared cookie and personalizes the ROI handoff section.
5. Booking CTA clicks on `why57.com` send a second best-effort interaction POST to the same Worker when ROI context exists.
6. The Worker normalizes and stores the payload in Cloudflare KV.

## Key files

ROI calculator repository:

- `index.html`
- `calculator.js`
- `INTEGRATIONS.md`

Main site repo:

- `index.html`
- `analytics.js`
- `roi-bridge.js`
- `cloudflare/why57-roi-intake/worker.js`
- `cloudflare/why57-roi-intake/wrangler.toml`

## Worker behavior

Accepted origins:

- `https://roi.why57.com`
- `https://why57.com`

Storage model:

- `event:<yyyy-mm-dd>:<session_id>:<uuid>` for interactions and unclassified events
- `lead:<yyyy-mm-dd>:<session_id>:<uuid>` only for the four completed outcome events defined in `ANALYTICS.md`
- `latest:<session_id>`

Default retention:

- 180 days through `ROI_DATA_TTL_SECONDS`

## Deploying changes

Worker deploy from the repository root:

```bash
cd cloudflare/why57-roi-intake
npx wrangler deploy
```

Remote KV inspection:

```bash
npx wrangler kv key get --binding ROI_LEADS --remote --preview false "latest:<session_id>"
```

## Optional future work

- forward normalized payloads to another backend using `ROI_FORWARD_WEBHOOK_URL`
- add GTM or ad-platform tags on top of the existing `dataLayer`
- build an internal dashboard or reporting job on top of KV data

Booking clicks stored by this integration are interaction context, not completed leads. See `ANALYTICS.md` for event semantics, GA4 configuration, and calendar completion options.
