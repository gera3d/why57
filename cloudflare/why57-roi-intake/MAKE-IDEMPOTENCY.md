# Make delivery dedupe handoff

The Worker is the primary idempotency authority. It forwards each accepted prototype or ROI request with the same `request_id` in both the JSON body and the `Idempotency-Key` / `X-Why57-Request-Id` headers. Make should reject a repeated key as defense in depth before Gmail or any customer-facing module runs.

## Scenario configuration

Apply this separately to the prototype-review and ROI-report scenarios:

1. Turn **Sequential processing** on for the scenario.
2. Immediately after the custom webhook, validate that `request_id` is present and matches `^[A-Za-z0-9_-]{8,120}$`. Stop the execution when it is missing or invalid.
3. Add a Make Data Store whose record key is the webhook `request_id`. Do not include email addresses, prototype URLs, report content, webhook secrets, or other lead data in the dedupe record.
4. Read the record before Gmail. If its status is `processing` or `delivered`, stop the execution as a successful duplicate without replaying Gmail.
5. Before Gmail, create or replace the record with `{ "status": "processing", "event_type": <event_type>, "updated_at": <now> }`.
6. Run Gmail and the existing delivery modules once.
7. After successful delivery, replace the record status with `delivered`.
8. On a delivery error, keep the record and set its status to `failed`; route the execution to the existing error handling instead of automatically replaying Gmail.

Sequential processing is required because a Make Data Store lookup followed by a write is not being treated here as an atomic compare-and-set. The D1 unique request claim remains authoritative when simultaneous webhook deliveries arrive.

## Read-only deployment check

- Confirm the webhook payload and both headers contain the same `request_id`.
- Confirm duplicate executions stop before Gmail and are not labeled as incomplete.
- Confirm no secret or lead PII is written to the dedupe Data Store.
- Do not replay an accepted proof execution; use a local/staging webhook fixture with one repeated request ID.
