# why57 ROI Intake Worker

This Worker stores ROI calculator lead context server-side so booked calls can be tied back to calculator output even after the browser cookie expires.

## Live endpoint

- `https://why57-roi-intake.gera-695.workers.dev/`

## Allowed origins

- `https://roi.why57.com`
- `https://why57.com`

## Bindings

- `ROI_LEADS`
  - Cloudflare KV namespace used for persisted lead context
- `ROI_DATA_TTL_SECONDS`
  - Plain-text environment variable
  - Current value: `15552000` (180 days)
- `ROI_FORWARD_WEBHOOK_URL`
  - Optional secret or plain-text variable for forwarding each normalized payload to another backend
- `ROI_FORWARD_WEBHOOK_SECRET`
  - Optional secret header value sent as `X-ROI-Webhook-Secret`

## What gets stored

Each accepted POST is normalized and written to KV twice:

- `lead:<yyyy-mm-dd>:<session_id>:<uuid>`
- `latest:<session_id>`

The payload includes fields such as:

- `event_type`
- `site_source`
- `page_url`
- `session_id`
- `recommendation`
- `readiness_score`
- `break_even_months`
- `project_type`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `cta_location`

## Deploying updates

This Worker is now deployed from this repo with Wrangler, not edited in the Cloudflare dashboard.

From this directory:

```bash
npx wrangler deploy
```

Useful remote KV commands:

```bash
npx wrangler kv key get --binding ROI_LEADS --remote --preview false "latest:<session_id>"
npx wrangler kv key delete --binding ROI_LEADS --remote --preview false "latest:<session_id>"
```

## Related files

- [wrangler.toml](/Users/gerayeremin/Documents/New%20project/why57/cloudflare/why57-roi-intake/wrangler.toml)
- [worker.js](/Users/gerayeremin/Documents/New%20project/why57/cloudflare/why57-roi-intake/worker.js)
- [ROI-INTEGRATION.md](/Users/gerayeremin/Documents/New%20project/why57/ROI-INTEGRATION.md)
