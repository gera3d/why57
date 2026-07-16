# Thread 2 nurture foundation

This is a dry-run/test-only foundation for the three follow-up sequences in the 57 execution brief. It does not register a schedule, call an email provider, deploy code, or modify the live Google Sheet.

## Sequence contract

| Sequence | Enrollment trigger | Schedule from trigger | Permission gate | Stops immediately on |
| --- | --- | --- | --- | --- |
| New lead | `lead_received`, after the identified Thread 1 lead has been logged | Days 1, 4, 8, 14, 21 | Requested related follow-up, explicit marketing permission, or an allowlisted test contact | Reply, booked call, proposal/audit, win, closed-lost/not-now, unsubscribe, bounce, or do-not-contact |
| Proposal or audit | `proposal_sent` or `audit_sent` | Days 2, 5, 9, 14 | Requested related follow-up, explicit marketing permission, or an allowlisted test contact | Reply, booked call, win, closed-lost/not-now, unsubscribe, bounce, or do-not-contact |
| Closed-lost / not-now | `closed_lost` or `not_now` | Calendar months 3, 6, 9, 12, 15, 18, 21, 24 | Explicit marketing permission or an allowlisted test contact | Reply, booked call, reopened lead, proposal/audit, win, unsubscribe, bounce, or do-not-contact |

The exact definitions, full first-touch copy, remaining-touch outlines, proof-point references, and stop conditions are in `src/nurture/sequences.ts`. Calendar-month scheduling clamps month-end dates; for example, a January 31 trigger schedules the first quarterly touch on April 30.

## Lead-log integration

Keep the existing 16-column `Leads` tab and its verified Thread 1 receiver unchanged. Add these companion tabs to the same workbook only when implementation is approved:

### `LeadLifecycle`

Append one row per human or system lifecycle event. The exact header contract is exported as `LEAD_LIFECYCLE_HEADERS`.

Required fields are a stable non-PII `event_id`, existing `lead_id`, `event_type`, UTC `event_at`, `email_permission`, and the captured consent-copy version when applicable. Proposal/audit, reply, booked-call, won, closed-lost, not-now, reopened, unsubscribe, bounce, and do-not-contact changes all belong here.

### `NurtureEnrollments`

One row represents one sequence enrollment. The exact header contract is exported as `NURTURE_ENROLLMENT_HEADERS`. Important status fields are:

- `status`: `planned_test`, `active_test`, `paused`, `completed_test`, or `stopped`;
- `next_touch_number` and `next_due_at` for the scheduler;
- `last_touch_at`, `stop_reason`, and `updated_at` for auditability;
- `dry_run`, which must remain `true` in this foundation.

### `NurtureEvents`

One row represents one scheduled touch. The exact header contract is exported as `NURTURE_EVENT_HEADERS`. Touch statuses are `planned_test`, `claimed_test`, `dry_run_completed`, `sent_test`, `failed_test`, or `skipped`. There is intentionally no live-send status in the current code.

## Idempotency and concurrency

1. Every lifecycle change receives one stable `event_id`.
2. The enrollment ID is deterministic from sequence key, sequence version, and trigger event ID.
3. Every touch has a deterministic idempotency key from enrollment ID and touch number.
4. A future Sheet runner must acquire `LockService.getScriptLock()`, re-read the enrollment and event rows, and change one due event from `planned_test` to `claimed_test` before any provider call.
5. A future provider test call must reuse the touch idempotency key. A retry may update the same event row but must never append a second logical touch.
6. Before claiming, re-read `LeadLifecycle`. If a stop event, missing permission, or unsubscribe exists, mark the event `skipped` and the enrollment `stopped`.

## Safety boundary

- `createDryRunNurturePlan` accepts `mode: "dry-run"` only.
- The contact must exactly match a runtime `testEmailAllowlist`; no email address is committed here.
- The closed-lost sequence requires `explicit_marketing` permission except for a user-owned test contact.
- Full first-touch copy includes an unsubscribe merge field. A future test runner must refuse delivery if it cannot render a working unsubscribe URL.
- The implementation has no email-provider client, scheduled trigger, production mode, or deployment path.

## Later implementation and test plan

1. Add the three companion tabs to the existing test workbook with the exported headers. Do not change `Leads`.
2. Add one user-owned address to an encrypted/runtime test allowlist. Do not put the address in source or Sheet formulas.
3. Create three synthetic leads using that same address and append one trigger event per sequence: `lead_received`, `proposal_sent` (or `audit_sent`), and `closed_lost` (or `not_now`). Use `email_permission=test_contact`.
4. Run `createDryRunNurturePlan` for each event and append the resulting enrollment and touch rows. Re-run the same inputs and verify the deterministic keys prevent duplicates.
5. Add a manually invoked test runner with an injected clock. It may call Resend only when delivery mode is `test`, the address is allowlisted, the event is due, the permission is still valid, and no stop event exists.
6. Test each sequence at one millisecond before and exactly at its first due timestamp. Confirm no call before due and one call at due. Record provider ID and timestamp in the same event row.
7. Append `reply_received` or `unsubscribed`, invoke again, and confirm remaining touches become `skipped` with no provider call.
8. Inspect the user-owned inbox and Sheet rows, then remove any temporary trigger. Do not create a recurring trigger or enroll a real contact without a separate user review.

Thread 2 is not done until that controlled test proves one correct first-touch delivery for each sequence. The current foundation is ready for that next implementation step but has intentionally sent nothing.
