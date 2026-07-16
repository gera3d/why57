export type SequenceKey = "new_lead" | "proposal_or_audit" | "closed_lost_quarterly";

export type TriggerType =
  | "lead_received"
  | "proposal_sent"
  | "audit_sent"
  | "closed_lost"
  | "not_now";

export type EmailPermission = "requested_followup" | "explicit_marketing" | "test_contact" | "none";

export type ScheduleOffset =
  | { unit: "days"; value: number }
  | { unit: "months"; value: number };

export type ProofPointId =
  | "health_for_california_reviews"
  | "drivesavers_reviews_and_search"
  | "nuvolum_deployment_platform"
  | "ux_owl_qualified_leads"
  | "dent_experts_storm_ops"
  | "57seconds_review_automation";

export type NurtureTouch = {
  touchNumber: number;
  offset: ScheduleOffset;
  purpose: string;
  outline: string;
  proofPointId?: ProofPointId;
  subject?: string;
  text?: string;
};

export type NurtureSequenceDefinition = {
  key: SequenceKey;
  version: number;
  label: string;
  triggers: readonly TriggerType[];
  allowedPermissions: readonly EmailPermission[];
  stopEvents: readonly string[];
  touches: readonly NurtureTouch[];
};

export const PROOF_POINTS: Readonly<Record<ProofPointId, string>> = {
  health_for_california_reviews:
    "Health for California — 9,000+ verified Google reviews generated over 4 years via the review system.",
  drivesavers_reviews_and_search:
    "DriveSavers — 300+ new five-star reviews in one quarter; top-3 rankings on 20+ keywords.",
  nuvolum_deployment_platform:
    "Nuvolum — 200+ sites deployed in under 4 hours; the agency grew from 7 to 50 employees.",
  ux_owl_qualified_leads:
    "UX Owl — 30–50% increase in qualified leads for attorney client sites.",
  dent_experts_storm_ops:
    "Dent Experts — Storm Ops Flow, a custom iPhone and operations platform rivaling major insurance-industry tools.",
  "57seconds_review_automation": "57Seconds — 57's own review-automation product."
};

const COMMON_STOP_EVENTS = ["unsubscribed", "bounced", "do_not_contact"] as const;

export const NURTURE_SEQUENCES: Readonly<Record<SequenceKey, NurtureSequenceDefinition>> = {
  new_lead: {
    key: "new_lead",
    version: 1,
    label: "New lead — 5 touches over 3 weeks",
    triggers: ["lead_received"],
    allowedPermissions: ["requested_followup", "explicit_marketing", "test_contact"],
    stopEvents: [
      "reply_received",
      "call_booked",
      "proposal_sent",
      "audit_sent",
      "won",
      "closed_lost",
      "not_now",
      ...COMMON_STOP_EVENTS
    ],
    touches: [
      {
        touchNumber: 1,
        offset: { unit: "days", value: 1 },
        purpose: "Turn a broad automation request into one observable bottleneck.",
        proofPointId: "health_for_california_reviews",
        outline: "Ask where information is retyped, chased, or lost; offer to identify the smallest useful first release.",
        subject: "One way to shrink the manual-work bottleneck",
        text: `Hi {{first_name}},

You mentioned {{interest_or_workflow}}. The useful question usually isn't “what can we automate?” It's “where is information being retyped, chased, or lost?”

For Health for California, the review system generated 9,000+ verified Google reviews over four years. The leverage came from making one repeatable handoff reliable, not trying to rebuild an entire operation at once.

If you send me the step that creates the most rework, I'll reply with the smallest practical first release I'd test. Or, if it's easier, book a short call here: {{booking_url}}

— Gera
57

You can opt out here: {{unsubscribe_url}}`
      },
      {
        touchNumber: 2,
        offset: { unit: "days", value: 4 },
        purpose: "Show how a triggered follow-up loop can recover missed demand.",
        proofPointId: "drivesavers_reviews_and_search",
        outline:
          "Use the 300+ new five-star reviews in one quarter and top-3 rankings on 20+ keywords proof point; give a three-question audit for trigger, owner, and exception handling."
      },
      {
        touchNumber: 3,
        offset: { unit: "days", value: 8 },
        purpose: "Explain the leverage in turning repeated delivery into a system.",
        proofPointId: "nuvolum_deployment_platform",
        outline:
          "Use the 200+ sites in under 4 hours and 7-to-50 growth context; suggest mapping the repeated inputs, approvals, and QA checks before adding software."
      },
      {
        touchNumber: 4,
        offset: { unit: "days", value: 14 },
        purpose: "Connect qualification and attribution to revenue visibility.",
        proofPointId: "ux_owl_qualified_leads",
        outline:
          "Use the 30–50% qualified-lead increase for attorney client sites; offer a lightweight lead-routing and source-attribution teardown."
      },
      {
        touchNumber: 5,
        offset: { unit: "days", value: 21 },
        purpose: "Close the loop with a concrete field-to-office example and a low-pressure choice.",
        proofPointId: "dent_experts_storm_ops",
        outline:
          "Use Storm Ops Flow as the example; ask whether to map one field-to-office handoff, revisit later, or close the file."
      }
    ]
  },
  proposal_or_audit: {
    key: "proposal_or_audit",
    version: 1,
    label: "Proposal or audit sent — 4 touches over 2 weeks",
    triggers: ["proposal_sent", "audit_sent"],
    allowedPermissions: ["requested_followup", "explicit_marketing", "test_contact"],
    stopEvents: ["reply_received", "call_booked", "won", "closed_lost", "not_now", ...COMMON_STOP_EVENTS],
    touches: [
      {
        touchNumber: 1,
        offset: { unit: "days", value: 2 },
        purpose: "Refocus the decision on the operating constraint the scope removes.",
        proofPointId: "nuvolum_deployment_platform",
        outline: "Ask what work disappears if the primary bottleneck is removed and invite a correction to the scope assumptions.",
        subject: "The decision behind {{proposal_or_audit_name}}",
        text: `Hi {{first_name}},

Before you decide on {{proposal_or_audit_name}}, one question: if we remove only {{primary_bottleneck}}, what does your team stop doing every week?

At Nuvolum, 200+ sites were deployed in under four hours; over time, the agency grew from 7 to 50 employees. The useful pattern wasn't “automate everything.” It was making a high-frequency operating step reliable enough to scale.

That's how I framed this scope: fixed price, a first release in weeks, and a clear measure of what changed. If the bottleneck or assumption is wrong, reply with the correction and I'll tighten the scope before you make a decision.

— Gera
57

You can opt out here: {{unsubscribe_url}}`
      },
      {
        touchNumber: 2,
        offset: { unit: "days", value: 5 },
        purpose: "Remove uncertainty without adding scope.",
        outline:
          "Send a short assumption-and-risk checklist: users, systems, data, exceptions, ownership, and the evidence needed to start."
      },
      {
        touchNumber: 3,
        offset: { unit: "days", value: 9 },
        purpose: "Offer a smaller first release if timing or risk is the blocker.",
        outline:
          "Name the smallest defensible scope trim, what it proves, what is deferred, and how the original goal remains measurable."
      },
      {
        touchNumber: 4,
        offset: { unit: "days", value: 14 },
        purpose: "Close the loop cleanly.",
        outline: "Offer three explicit choices: proceed, revise one assumption, or pause without further follow-up."
      }
    ]
  },
  closed_lost_quarterly: {
    key: "closed_lost_quarterly",
    version: 1,
    label: "Closed-lost or not-now — quarterly for 24 months",
    triggers: ["closed_lost", "not_now"],
    allowedPermissions: ["explicit_marketing", "test_contact"],
    stopEvents: [
      "reply_received",
      "call_booked",
      "reopened",
      "proposal_sent",
      "audit_sent",
      "won",
      ...COMMON_STOP_EVENTS
    ],
    touches: [
      {
        touchNumber: 1,
        offset: { unit: "months", value: 3 },
        purpose: "Give one narrow intake-and-status idea with no pressure to restart a project.",
        proofPointId: "dent_experts_storm_ops",
        outline: "Suggest one shared intake and status view for a field-to-office handoff.",
        subject: "A quarterly automation idea for {{company_or_team}}",
        text: `Hi {{first_name}},

You may not need a project right now, so here's one useful idea: choose one request that arrives by email, text, or spreadsheet and give it a single intake and status view. Measure the handoff time and exceptions before automating anything else.

Dent Experts' Storm Ops Flow became a custom iPhone and operations platform rivaling major insurance-industry tools. The practical starting point can still be narrow: make one field-to-office handoff visible and reliable.

If that maps to something your team is dealing with, reply with the handoff and I'll send back what I'd measure first. No need to restart a sales conversation.

— Gera
57

You can opt out here: {{unsubscribe_url}}`
      },
      {
        touchNumber: 2,
        offset: { unit: "months", value: 6 },
        purpose: "Make customer follow-up observable.",
        proofPointId: "57seconds_review_automation",
        outline: "Suggest a consent-aware request queue with delivery status, one reminder, and exception handling."
      },
      {
        touchNumber: 3,
        offset: { unit: "months", value: 9 },
        purpose: "Turn repeated delivery into a checklist-driven system.",
        proofPointId: "nuvolum_deployment_platform",
        outline: "Suggest capturing inputs once, generating the repeated setup, and keeping human QA at the release boundary."
      },
      {
        touchNumber: 4,
        offset: { unit: "months", value: 12 },
        purpose: "Improve lead qualification and source visibility.",
        proofPointId: "ux_owl_qualified_leads",
        outline: "Suggest one qualification rule, one routing owner, and one source field that survives through a booked call."
      },
      {
        touchNumber: 5,
        offset: { unit: "months", value: 15 },
        purpose: "Expose exceptions instead of automating them blindly.",
        outline: "Suggest an exception inbox that shows failed syncs, missing approvals, and the person responsible for recovery."
      },
      {
        touchNumber: 6,
        offset: { unit: "months", value: 18 },
        purpose: "Reduce field-to-office re-entry.",
        proofPointId: "dent_experts_storm_ops",
        outline: "Suggest capturing a field update once, with offline-safe status and a visible handoff to operations."
      },
      {
        touchNumber: 7,
        offset: { unit: "months", value: 21 },
        purpose: "Find the most expensive manual system bridge.",
        outline: "Suggest a one-week count of every record copied between systems, including failures and reconciliation time."
      },
      {
        touchNumber: 8,
        offset: { unit: "months", value: 24 },
        purpose: "Revisit the original constraint with a fresh baseline.",
        outline: "Ask what changed in two years, identify the current bottleneck, and offer a no-pressure keep/pause/revisit decision."
      }
    ]
  }
};

export function getNurtureSequence(key: SequenceKey): NurtureSequenceDefinition {
  return NURTURE_SEQUENCES[key];
}
