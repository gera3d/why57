import {
  getNurtureSequence,
  type EmailPermission,
  type NurtureSequenceDefinition,
  type ScheduleOffset,
  type SequenceKey,
  type TriggerType
} from "./sequences";

export const LEAD_LIFECYCLE_HEADERS = [
  "event_id",
  "lead_id",
  "event_type",
  "event_at",
  "email_permission",
  "consent_version",
  "source",
  "notes",
  "created_at"
] as const;

export const NURTURE_ENROLLMENT_HEADERS = [
  "enrollment_id",
  "lead_id",
  "contact_email",
  "sequence_key",
  "sequence_version",
  "trigger_event_id",
  "trigger_type",
  "trigger_at",
  "email_permission",
  "status",
  "next_touch_number",
  "next_due_at",
  "last_touch_at",
  "stop_reason",
  "created_at",
  "updated_at",
  "dry_run"
] as const;

export const NURTURE_EVENT_HEADERS = [
  "event_id",
  "idempotency_key",
  "enrollment_id",
  "lead_id",
  "sequence_key",
  "sequence_version",
  "touch_number",
  "status",
  "due_at",
  "claimed_at",
  "completed_at",
  "provider_message_id",
  "error_code",
  "created_at"
] as const;

export type NurtureEnrollmentStatus =
  | "planned_test"
  | "active_test"
  | "paused"
  | "completed_test"
  | "stopped";

export type NurtureEventStatus =
  | "planned_test"
  | "claimed_test"
  | "dry_run_completed"
  | "sent_test"
  | "failed_test"
  | "skipped";

export type DryRunPolicy = {
  mode: "dry-run";
  testEmailAllowlist: readonly string[];
};

export type DryRunEnrollmentInput = {
  leadId: string;
  triggerEventId: string;
  sequenceKey: SequenceKey;
  triggerType: TriggerType;
  triggerAt: string;
  contactEmail: string;
  emailPermission: EmailPermission;
};

export type PlannedNurtureEvent = {
  event_id: string;
  idempotency_key: string;
  enrollment_id: string;
  lead_id: string;
  sequence_key: SequenceKey;
  sequence_version: number;
  touch_number: number;
  status: "planned_test";
  due_at: string;
  claimed_at: "";
  completed_at: "";
  provider_message_id: "";
  error_code: "";
  created_at: string;
};

export type DryRunNurturePlan = {
  enrollment: {
    enrollment_id: string;
    lead_id: string;
    contact_email: string;
    sequence_key: SequenceKey;
    sequence_version: number;
    trigger_event_id: string;
    trigger_type: TriggerType;
    trigger_at: string;
    email_permission: EmailPermission;
    status: "planned_test";
    next_touch_number: 1;
    next_due_at: string;
    last_touch_at: "";
    stop_reason: "";
    created_at: string;
    updated_at: string;
    dry_run: true;
  };
  events: PlannedNurtureEvent[];
};

const SAFE_ID = /^[A-Za-z0-9._:-]{1,128}$/;

function requireSafeId(label: string, value: string): string {
  if (!SAFE_ID.test(value)) throw new Error(`${label} must be a stable non-PII identifier.`);
  return value;
}

function normalizeEmail(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error("A valid test contact email is required.");
  return normalized;
}

function parseTimestamp(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("triggerAt must be an ISO-8601 timestamp.");
  return date;
}

function addClampedUtcMonths(anchor: Date, months: number): Date {
  const targetMonthStart = new Date(
    Date.UTC(
      anchor.getUTCFullYear(),
      anchor.getUTCMonth() + months,
      1,
      anchor.getUTCHours(),
      anchor.getUTCMinutes(),
      anchor.getUTCSeconds(),
      anchor.getUTCMilliseconds()
    )
  );
  const lastDay = new Date(
    Date.UTC(targetMonthStart.getUTCFullYear(), targetMonthStart.getUTCMonth() + 1, 0)
  ).getUTCDate();
  targetMonthStart.setUTCDate(Math.min(anchor.getUTCDate(), lastDay));
  return targetMonthStart;
}

export function dueAt(anchor: Date, offset: ScheduleOffset): Date {
  if (!Number.isInteger(offset.value) || offset.value <= 0) throw new Error("Schedule offsets must be positive integers.");
  if (offset.unit === "months") return addClampedUtcMonths(anchor, offset.value);
  const date = new Date(anchor);
  date.setUTCDate(date.getUTCDate() + offset.value);
  return date;
}

function assertSequenceEligibility(
  sequence: NurtureSequenceDefinition,
  triggerType: TriggerType,
  permission: EmailPermission
): void {
  if (!sequence.triggers.includes(triggerType)) {
    throw new Error(`${triggerType} cannot enroll ${sequence.key}.`);
  }
  if (!sequence.allowedPermissions.includes(permission)) {
    throw new Error(`${permission} is not sufficient for ${sequence.key}.`);
  }
}

export function createDryRunNurturePlan(
  input: DryRunEnrollmentInput,
  policy: DryRunPolicy,
  createdAt = new Date()
): DryRunNurturePlan {
  if (policy.mode !== "dry-run") throw new Error("This foundation can create dry-run plans only.");

  const leadId = requireSafeId("leadId", input.leadId);
  const triggerEventId = requireSafeId("triggerEventId", input.triggerEventId);
  const contactEmail = normalizeEmail(input.contactEmail);
  const allowlist = new Set(policy.testEmailAllowlist.map(normalizeEmail));
  if (!allowlist.has(contactEmail)) throw new Error("The contact is not on the user-owned test allowlist.");

  const sequence = getNurtureSequence(input.sequenceKey);
  assertSequenceEligibility(sequence, input.triggerType, input.emailPermission);

  const triggerAt = parseTimestamp(input.triggerAt);
  const createdAtIso = createdAt.toISOString();
  const enrollmentId = `why57:nurture:${sequence.key}:v${sequence.version}:${triggerEventId}`;
  const events = sequence.touches.map((touch): PlannedNurtureEvent => {
    const idempotencyKey = `${enrollmentId}:touch:${touch.touchNumber}`;
    return {
      event_id: idempotencyKey,
      idempotency_key: idempotencyKey,
      enrollment_id: enrollmentId,
      lead_id: leadId,
      sequence_key: sequence.key,
      sequence_version: sequence.version,
      touch_number: touch.touchNumber,
      status: "planned_test",
      due_at: dueAt(triggerAt, touch.offset).toISOString(),
      claimed_at: "",
      completed_at: "",
      provider_message_id: "",
      error_code: "",
      created_at: createdAtIso
    };
  });
  const firstEvent = events[0];
  if (!firstEvent) throw new Error(`${sequence.key} has no touches.`);

  return {
    enrollment: {
      enrollment_id: enrollmentId,
      lead_id: leadId,
      contact_email: contactEmail,
      sequence_key: sequence.key,
      sequence_version: sequence.version,
      trigger_event_id: triggerEventId,
      trigger_type: input.triggerType,
      trigger_at: triggerAt.toISOString(),
      email_permission: input.emailPermission,
      status: "planned_test",
      next_touch_number: 1,
      next_due_at: firstEvent.due_at,
      last_touch_at: "",
      stop_reason: "",
      created_at: createdAtIso,
      updated_at: createdAtIso,
      dry_run: true
    },
    events
  };
}

export function dueTestEvents(events: readonly PlannedNurtureEvent[], now: Date): PlannedNurtureEvent[] {
  const timestamp = now.getTime();
  return events.filter((event) => event.status === "planned_test" && Date.parse(event.due_at) <= timestamp);
}

export function firstStopEvent(sequenceKey: SequenceKey, lifecycleEvents: readonly string[]): string | undefined {
  const stopEvents = new Set(getNurtureSequence(sequenceKey).stopEvents);
  return lifecycleEvents.find((event) => stopEvents.has(event));
}

export type FirstTouchMergeFields = {
  first_name: string;
  interest_or_workflow: string;
  booking_url: string;
  unsubscribe_url: string;
  proposal_or_audit_name: string;
  primary_bottleneck: string;
  company_or_team: string;
};

function renderTemplate(template: string, fields: FirstTouchMergeFields): string {
  return template.replace(/{{([a-z_]+)}}/g, (_match, key: string) => {
    if (!(key in fields)) throw new Error(`Missing merge field: ${key}`);
    const value = fields[key as keyof FirstTouchMergeFields].trim().slice(0, 500);
    if (!value) throw new Error(`Merge field ${key} cannot be blank.`);
    return value;
  });
}

export function renderFirstTouch(
  sequenceKey: SequenceKey,
  fields: FirstTouchMergeFields
): { subject: string; text: string } {
  const firstTouch = getNurtureSequence(sequenceKey).touches[0];
  if (!firstTouch?.subject || !firstTouch.text) throw new Error(`${sequenceKey} has no first-touch copy.`);
  return {
    subject: renderTemplate(firstTouch.subject, fields),
    text: renderTemplate(firstTouch.text, fields)
  };
}
