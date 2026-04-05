# why57 ROI Integration

This document describes how `why57.com`, `roi.why57.com`, GA4, and the Cloudflare Worker fit together.

## What is live

- `roi.why57.com` runs the ROI calculator
- `why57.com` links to the calculator and reads shared ROI context back from the calculator
- GA4 is shared across both properties
- a Cloudflare Worker stores lead context server-side at `https://why57-roi-intake.gera-695.workers.dev/`

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
3. Booking CTA clicks on the calculator send a best-effort POST to the Worker.
4. `why57.com` reads the shared cookie and personalizes the ROI handoff section.
5. Booking CTA clicks on `why57.com` send a second best-effort POST to the same Worker.
6. The Worker normalizes and stores the payload in Cloudflare KV.

## Key files

ROI calculator repo:

- [index.html](/Users/gerayeremin/Documents/New%20project/custom-software-roi-calculator/index.html)
- [calculator.js](/Users/gerayeremin/Documents/New%20project/custom-software-roi-calculator/calculator.js)
- [INTEGRATIONS.md](/Users/gerayeremin/Documents/New%20project/custom-software-roi-calculator/INTEGRATIONS.md)

Main site repo:

- [index.html](/Users/gerayeremin/Documents/New%20project/why57/index.html)
- [roi-bridge.js](/Users/gerayeremin/Documents/New%20project/why57/roi-bridge.js)
- [cloudflare/why57-roi-intake/worker.js](/Users/gerayeremin/Documents/New%20project/why57/cloudflare/why57-roi-intake/worker.js)
- [cloudflare/why57-roi-intake/wrangler.toml](/Users/gerayeremin/Documents/New%20project/why57/cloudflare/why57-roi-intake/wrangler.toml)

## Worker behavior

Accepted origins:

- `https://roi.why57.com`
- `https://why57.com`

Storage model:

- `lead:<yyyy-mm-dd>:<session_id>:<uuid>`
- `latest:<session_id>`

Default retention:

- 180 days through `ROI_DATA_TTL_SECONDS`

## Deploying changes

Worker deploy:

```bash
cd "/Users/gerayeremin/Documents/New project/why57/cloudflare/why57-roi-intake"
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
