import { describe, expect, it } from "vitest";
import {
  createDryRunNurturePlan,
  dueAt,
  dueTestEvents,
  firstStopEvent,
  renderFirstTouch,
  type FirstTouchMergeFields
} from "../src/nurture/planner";
import { NURTURE_SEQUENCES, PROOF_POINTS, type SequenceKey, type TriggerType } from "../src/nurture/sequences";

const testPolicy = { mode: "dry-run" as const, testEmailAllowlist: ["owner-test@example.com"] };
const mergeFields: FirstTouchMergeFields = {
  first_name: "Gera",
  interest_or_workflow: "the order handoff",
  booking_url: "https://calendar.example.test/57",
  unsubscribe_url: "https://unsubscribe.example.test/57",
  proposal_or_audit_name: "the automation audit",
  primary_bottleneck: "duplicate order entry",
  company_or_team: "the test team"
};

function plan(sequenceKey: SequenceKey, triggerType: TriggerType, triggerAt = "2026-07-16T17:00:00.000Z") {
  return createDryRunNurturePlan(
    {
      leadId: "lead-test-57",
      triggerEventId: `event-${sequenceKey}`,
      sequenceKey,
      triggerType,
      triggerAt,
      contactEmail: "owner-test@example.com",
      emailPermission: "test_contact"
    },
    testPolicy,
    new Date("2026-07-16T17:01:00.000Z")
  );
}

describe("Thread 2 dry-run nurture foundation", () => {
  it("plans five new-lead touches on days 1, 4, 8, 14, and 21 with a proof point per touch", () => {
    const result = plan("new_lead", "lead_received");

    expect(result.events.map((event) => event.due_at)).toEqual([
      "2026-07-17T17:00:00.000Z",
      "2026-07-20T17:00:00.000Z",
      "2026-07-24T17:00:00.000Z",
      "2026-07-30T17:00:00.000Z",
      "2026-08-06T17:00:00.000Z"
    ]);
    expect(NURTURE_SEQUENCES.new_lead.touches.every((touch) => Boolean(touch.proofPointId))).toBe(true);
  });

  it("plans four proposal/audit touches on days 2, 5, 9, and 14", () => {
    const result = plan("proposal_or_audit", "proposal_sent");
    expect(result.events.map((event) => event.due_at)).toEqual([
      "2026-07-18T17:00:00.000Z",
      "2026-07-21T17:00:00.000Z",
      "2026-07-25T17:00:00.000Z",
      "2026-07-30T17:00:00.000Z"
    ]);
  });

  it("plans eight closed-lost touches every three calendar months through month 24", () => {
    const result = plan("closed_lost_quarterly", "closed_lost", "2026-01-31T17:00:00.000Z");
    expect(result.events.map((event) => event.due_at)).toEqual([
      "2026-04-30T17:00:00.000Z",
      "2026-07-31T17:00:00.000Z",
      "2026-10-31T17:00:00.000Z",
      "2027-01-31T17:00:00.000Z",
      "2027-04-30T17:00:00.000Z",
      "2027-07-31T17:00:00.000Z",
      "2027-10-31T17:00:00.000Z",
      "2028-01-31T17:00:00.000Z"
    ]);
  });

  it("rejects real prospects, mismatched triggers, and insufficient quarterly permission", () => {
    const base = {
      leadId: "lead-test-57",
      triggerEventId: "event-57",
      triggerAt: "2026-07-16T17:00:00.000Z",
      contactEmail: "real-prospect@example.com",
      emailPermission: "test_contact" as const
    };

    expect(() =>
      createDryRunNurturePlan(
        { ...base, sequenceKey: "new_lead", triggerType: "lead_received" },
        testPolicy
      )
    ).toThrow("not on the user-owned test allowlist");

    expect(() =>
      createDryRunNurturePlan(
        {
          ...base,
          contactEmail: "owner-test@example.com",
          sequenceKey: "proposal_or_audit",
          triggerType: "lead_received"
        },
        testPolicy
      )
    ).toThrow("cannot enroll");

    expect(() =>
      createDryRunNurturePlan(
        {
          ...base,
          contactEmail: "owner-test@example.com",
          sequenceKey: "closed_lost_quarterly",
          triggerType: "closed_lost",
          emailPermission: "requested_followup"
        },
        testPolicy
      )
    ).toThrow("not sufficient");
  });

  it("uses stable enrollment and touch idempotency keys for repeated trigger processing", () => {
    const first = plan("proposal_or_audit", "audit_sent");
    const second = plan("proposal_or_audit", "audit_sent");

    expect(second.enrollment.enrollment_id).toBe(first.enrollment.enrollment_id);
    expect(second.events.map((event) => event.idempotency_key)).toEqual(
      first.events.map((event) => event.idempotency_key)
    );
  });

  it("does not mark a touch due before its exact scheduled time", () => {
    const result = plan("new_lead", "lead_received");
    expect(dueTestEvents(result.events, new Date("2026-07-17T16:59:59.999Z"))).toHaveLength(0);
    expect(dueTestEvents(result.events, new Date("2026-07-17T17:00:00.000Z"))).toHaveLength(1);
  });

  it("renders polished first-touch copy without unresolved fields and only registered proof claims", () => {
    for (const key of Object.keys(NURTURE_SEQUENCES) as SequenceKey[]) {
      const rendered = renderFirstTouch(key, mergeFields);
      expect(rendered.subject).not.toContain("{{");
      expect(rendered.text).not.toContain("{{");
      expect(rendered.text).toContain("You can opt out here:");
      const proofPointId = NURTURE_SEQUENCES[key].touches[0]?.proofPointId;
      expect(proofPointId && PROOF_POINTS[proofPointId]).toBeTruthy();
    }
  });

  it("stops a sequence on the first suppressing lifecycle event", () => {
    expect(firstStopEvent("new_lead", ["lead_received", "reply_received", "call_booked"])).toBe(
      "reply_received"
    );
    expect(firstStopEvent("closed_lost_quarterly", ["closed_lost", "reopened"])).toBe("reopened");
    expect(firstStopEvent("proposal_or_audit", ["proposal_sent"])).toBeUndefined();
  });

  it("requires positive whole-number offsets", () => {
    expect(() => dueAt(new Date(), { unit: "days", value: 0 })).toThrow("positive integers");
    expect(() => dueAt(new Date(), { unit: "months", value: 1.5 })).toThrow("positive integers");
  });
});
