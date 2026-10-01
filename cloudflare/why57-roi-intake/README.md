# why57 intake Workers

This directory contains two deliberately separate Worker paths. Keep them separate until the identified lead pipeline has passed live staging QA and the existing production routes have been ported or otherwise preserved.

## Existing production Worker

`worker.js` and `wrangler.toml` are the current production implementation at `https://why57-roi-intake.gera-695.workers.dev/`.

It supports:

- ROI calculator events at `POST /`;
- ROI report requests at `POST /`;
- AI prototype production-readiness requests at `POST /prototype-review`;
- the current KV contracts, validation, rate limiting, consent checks, and forwarding behavior for those routes.

Do not delete or replace this Worker while those public flows depend on it. Validate its bundle without deploying:

```bash
npx wrangler deploy --dry-run
```

Production secrets and variables for this Worker remain documented in `wrangler.toml`, `ROI-INTEGRATION.md`, and the related source comments. Never store their values in this repository.

## Identified lead-delivery Worker

`src/index.ts` and `wrangler.lead-intake.jsonc` implement the new Thread 1 pipeline at `POST /v1/leads`. The top-level Worker name is intentionally `why57-lead-intake-v2`, so a mistaken top-level deploy cannot overwrite the existing production Worker.

The flow:

1. Validate origin and a bounded JSON body.
2. Normalize contact, source, UTM, quiz, and ROI context.
3. Persist the accepted lead in KV before returning `202 Accepted`.
4. Dispatch background delivery through `ctx.waitUntil()`:
   - personalized auto-response through Resend;
   - founder alert through a Slack incoming webhook;
   - lead row through the signed Google Apps Script receiver in `integrations/google-apps-script.gs`.
5. Store channel outcomes at `delivery:<lead_id>`.

### Safety modes

- `dry-run` is the default. It records delivery outcomes without contacting external services.
- `test` only emails recipients in `TEST_EMAIL_ALLOWLIST` and requires `X-Why57-Test-Token` for identified submissions.
- `live` enables normal delivery and must not be selected until staging has passed and the user has approved production activation.

The browser forms are also disabled on production by default and enable only on the local QA ports.

### Required secrets

- `RESEND_API_KEY`
- `FROM_EMAIL`
- `FOUNDER_REPLY_TO`
- `SLACK_WEBHOOK_URL`
- `LEAD_LOG_WEBHOOK_URL`
- `LEAD_LOG_WEBHOOK_SECRET`
- `STAGING_SUBMISSION_TOKEN`
- `TEST_EMAIL_ALLOWLIST`

Use `.dev.vars` locally and Cloudflare encrypted secrets for deployed environments. `.dev.vars.example` contains placeholders only.

### Commands

```bash
pnpm install
pnpm run cf-typegen
pnpm run check
pnpm test
```

Start the new Worker locally:

```bash
pnpm exec wrangler dev --config wrangler.lead-intake.jsonc --local --port 8787 --env-file .dev.vars.example
```

Validate or deploy only the isolated staging environment:

```bash
pnpm exec wrangler deploy --config wrangler.lead-intake.jsonc --dry-run --env staging --secrets-file .dev.vars.example
pnpm exec wrangler deploy --config wrangler.lead-intake.jsonc --env staging
```

The staging environment retains the existing `why57-roi-intake-staging` name and its dedicated KV namespace. Never run a production deploy as part of normal QA.

## Google Sheets receiver

Configure these Apps Script properties before deploying `integrations/google-apps-script.gs` as a web app:

- `LEAD_SPREADSHEET_ID`
- `LEAD_WEBHOOK_SECRET`

`LEAD_WEBHOOK_SECRET` must match the encrypted Worker secret of the same name.
