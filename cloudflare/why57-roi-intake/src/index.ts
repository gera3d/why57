const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 180;
const MAX_BODY_BYTES = 32 * 1024;
const MAX_TEXT_LENGTH = 2_000;
const PROVIDER_TIMEOUT_MS = 10_000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type JsonPrimitive = string | number | boolean | null;
type SafeRecord = Record<string, JsonPrimitive>;
type DeliveryMode = "dry-run" | "test" | "live";

type LeadContact = {
  name: string;
  email: string;
  company?: string;
  phone?: string;
};

type NormalizedLead = {
  id: string;
  submission_id?: string;
  received_at: string;
  sent_at: string;
  event_type: string;
  lead_kind: "identified" | "anonymous";
  source: string;
  site_source?: string;
  page_url?: string;
  referrer?: string;
  session_id?: string;
  contact?: LeadContact;
  interest?: string;
  message?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  recommendation?: string;
  readiness_score?: number;
  break_even_months?: number;
  project_type?: string;
  build_estimate_mid?: number;
  pain?: string;
  team?: string;
  goal?: string;
  origin?: string;
  context: SafeRecord;
};

type DeliveryOutcome = {
  channel: "auto_response" | "founder_alert" | "lead_log";
  status: "sent" | "logged" | "dry_run" | "blocked" | "not_configured" | "failed";
  attempted_at: string;
  completed_at: string;
  provider?: string;
  provider_id?: string;
  http_status?: number;
  detail?: string;
};

type DeliveryRecord = {
  lead_id: string;
  mode: DeliveryMode;
  started_at: string;
  completed_at: string;
  outcomes: DeliveryOutcome[];
};

class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function getAllowedOrigins(env: Env): Set<string> {
  return new Set(
    env.ALLOWED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  );
}

function resolveOrigin(request: Request, env: Env): { allowed: boolean; value: string } {
  const origin = request.headers.get("Origin") ?? "";
  if (!origin) return { allowed: true, value: "*" };
  return { allowed: getAllowedOrigins(env).has(origin), value: origin };
}

function corsHeaders(origin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Why57-Test-Token",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    Vary: "Origin"
  };
}

async function equalSecret(left: string, right: string): Promise<boolean> {
  if (!left || !right) return false;
  const encoder = new TextEncoder();
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right))
  ]);
  const subtle = crypto.subtle as SubtleCrypto & {
    timingSafeEqual(a: ArrayBuffer, b: ArrayBuffer): boolean;
  };
  return subtle.timingSafeEqual(leftHash, rightHash);
}

async function requireTestSubmissionToken(request: Request, env: Env, identifiedRoute: boolean): Promise<void> {
  if (deliveryMode(env) !== "test" || !identifiedRoute) return;
  const provided = request.headers.get("X-Why57-Test-Token") ?? "";
  if (!(await equalSecret(provided, env.STAGING_SUBMISSION_TOKEN))) {
    throw new HttpError(403, "staging_authorization_required", "A valid staging submission token is required.");
  }
}

function json(data: unknown, status: number, origin: string): Response {
  return Response.json(data, { status, headers: corsHeaders(origin) });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown, maxLength = MAX_TEXT_LENGTH): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim().replace(/\u0000/g, "");
  return cleaned ? cleaned.slice(0, maxLength) : undefined;
}

function cleanNumber(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function compact<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== "" && item !== null && item !== undefined)
  ) as Partial<T>;
}

function safeContext(...records: unknown[]): SafeRecord {
  const allowedKeys = new Set([
    "site_source",
    "landing_page",
    "page_path",
    "page_title",
    "referrer",
    "session_id",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "gbraid",
    "wbraid",
    "project_type",
    "workflow_fit",
    "integration_needs",
    "compliance_needs",
    "growth_12_months",
    "urgency",
    "monthly_saas_spend",
    "monthly_automation_spend",
    "manual_hours_per_week",
    "hourly_team_cost",
    "tool_count",
    "user_count",
    "recommendation",
    "readiness_score",
    "break_even_months",
    "annual_total_current_cost",
    "build_estimate_mid",
    "three_year_saas_cost",
    "three_year_custom_cost",
    "pain",
    "team",
    "goal",
    "cta_location"
  ]);

  const output: SafeRecord = {};
  for (const record of records) {
    if (!isRecord(record)) continue;
    for (const [key, rawValue] of Object.entries(record)) {
      if (!allowedKeys.has(key)) continue;
      if (typeof rawValue === "string") output[key] = rawValue.slice(0, 500);
      else if (typeof rawValue === "number" && Number.isFinite(rawValue)) output[key] = rawValue;
      else if (typeof rawValue === "boolean" || rawValue === null) output[key] = rawValue;
    }
  }
  return output;
}

async function readBoundedJson(request: Request): Promise<Record<string, unknown>> {
  const declaredLength = Number(request.headers.get("Content-Length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    throw new HttpError(413, "payload_too_large", "Payload exceeds the accepted size.");
  }

  if (!request.body) throw new HttpError(400, "invalid_json", "A JSON body is required.");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel("payload_too_large");
      throw new HttpError(413, "payload_too_large", "Payload exceeds the accepted size.");
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(merged));
  } catch {
    throw new HttpError(400, "invalid_json", "The request body must be valid JSON.");
  }

  if (!isRecord(parsed)) throw new HttpError(400, "invalid_json", "The JSON body must be an object.");
  return parsed;
}

function normalizeContact(payload: Record<string, unknown>): LeadContact | undefined {
  const contact = isRecord(payload.contact) ? payload.contact : payload;
  const name = cleanString(contact.name, 120);
  const email = cleanString(contact.email, 320)?.toLowerCase();
  if (!name && !email) return undefined;
  if (!name) throw new HttpError(422, "name_required", "Name is required.");
  if (!email || !EMAIL_PATTERN.test(email)) {
    throw new HttpError(422, "valid_email_required", "A valid email is required.");
  }

  return compact({
    name,
    email,
    company: cleanString(contact.company, 160),
    phone: cleanString(contact.phone, 60)
  }) as LeadContact;
}

function normalizeLead(payload: Record<string, unknown>, request: Request, identifiedRoute: boolean): NormalizedLead {
  const context = isRecord(payload.context) ? payload.context : {};
  const detail = isRecord(payload.detail) ? payload.detail : {};
  const formContext = isRecord(payload.form_context) ? payload.form_context : {};
  const now = new Date().toISOString();
  const contact = normalizeContact(payload);

  if (identifiedRoute && !contact) {
    throw new HttpError(422, "contact_required", "Name and email are required.");
  }

  const normalizedContext = safeContext(context, detail, formContext);
  const source =
    cleanString(payload.source, 100) ??
    cleanString(detail.site_source, 100) ??
    cleanString(context.site_source, 100) ??
    (identifiedRoute ? "website_form" : "roi_booking_click");

  return compact({
    id: crypto.randomUUID(),
    submission_id: cleanString(payload.submission_id, 128),
    received_at: now,
    sent_at: cleanString(payload.sent_at, 80) ?? now,
    event_type: cleanString(payload.event_type, 80) ?? (identifiedRoute ? "lead_submission" : "generate_lead"),
    lead_kind: contact ? "identified" : "anonymous",
    source,
    site_source: cleanString(detail.site_source, 100) ?? cleanString(context.site_source, 100),
    page_url: cleanString(payload.page_url, 1_000) ?? cleanString(detail.page_url, 1_000),
    referrer: cleanString(payload.referrer, 1_000) ?? cleanString(detail.referrer, 1_000),
    session_id: cleanString(payload.session_id, 160) ?? cleanString(context.session_id, 160),
    contact,
    interest: cleanString(payload.interest, 240),
    message: cleanString(payload.message, MAX_TEXT_LENGTH),
    utm_source: cleanString(context.utm_source, 200) ?? cleanString(payload.utm_source, 200),
    utm_medium: cleanString(context.utm_medium, 200) ?? cleanString(payload.utm_medium, 200),
    utm_campaign: cleanString(context.utm_campaign, 200) ?? cleanString(payload.utm_campaign, 200),
    utm_content: cleanString(context.utm_content, 200) ?? cleanString(payload.utm_content, 200),
    utm_term: cleanString(context.utm_term, 200) ?? cleanString(payload.utm_term, 200),
    recommendation: cleanString(context.recommendation, 120) ?? cleanString(formContext.recommendation, 120),
    readiness_score: cleanNumber(context.readiness_score) ?? cleanNumber(formContext.readiness_score),
    break_even_months: cleanNumber(context.break_even_months) ?? cleanNumber(formContext.break_even_months),
    project_type: cleanString(context.project_type, 120) ?? cleanString(formContext.project_type, 120),
    build_estimate_mid: cleanNumber(context.build_estimate_mid) ?? cleanNumber(formContext.build_estimate_mid),
    pain: cleanString(formContext.pain, 120) ?? cleanString(context.pain, 120),
    team: cleanString(formContext.team, 120) ?? cleanString(context.team, 120),
    goal: cleanString(formContext.goal, 120) ?? cleanString(context.goal, 120),
    origin: request.headers.get("Origin") ?? undefined,
    context: normalizedContext
  }) as NormalizedLead;
}

function ttlSeconds(env: Env): number {
  const configured = Number(env.ROI_DATA_TTL_SECONDS);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_TTL_SECONDS;
}

function leadStorageKeys(lead: NormalizedLead): { primary: string; latest: string } {
  const timestamp = Date.parse(lead.sent_at);
  const day = new Date(Number.isFinite(timestamp) ? timestamp : Date.now()).toISOString().slice(0, 10);
  const session = lead.session_id ?? lead.contact?.email ?? "anonymous";
  return {
    primary: `lead:${day}:${session}:${lead.id}`,
    latest: `latest:${session}`
  };
}

async function findExistingLead(env: Env, submissionId: string | undefined): Promise<NormalizedLead | null> {
  if (!submissionId) return null;
  return env.ROI_LEADS.get<NormalizedLead>(`submission:${submissionId}`, "json");
}

async function persistLead(env: Env, lead: NormalizedLead): Promise<void> {
  const keys = leadStorageKeys(lead);
  const options = { expirationTtl: ttlSeconds(env) };
  const serialized = JSON.stringify(lead);
  const writes: Promise<void>[] = [
    env.ROI_LEADS.put(keys.primary, serialized, options),
    env.ROI_LEADS.put(keys.latest, serialized, options)
  ];
  if (lead.submission_id) {
    writes.push(env.ROI_LEADS.put(`submission:${lead.submission_id}`, serialized, options));
  }
  await Promise.all(writes);
}

function deliveryMode(env: Env): DeliveryMode {
  return env.DELIVERY_MODE === "test" || env.DELIVERY_MODE === "live" ? env.DELIVERY_MODE : "dry-run";
}

function outcome(
  channel: DeliveryOutcome["channel"],
  status: DeliveryOutcome["status"],
  started: string,
  extra: Omit<DeliveryOutcome, "channel" | "status" | "attempted_at" | "completed_at"> = {}
): DeliveryOutcome {
  return {
    channel,
    status,
    attempted_at: started,
    completed_at: new Date().toISOString(),
    ...extra
  };
}

async function providerFetch(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
  });
}

async function captureDeliveryFailure(
  channel: DeliveryOutcome["channel"],
  provider: string,
  operation: () => Promise<DeliveryOutcome>
): Promise<DeliveryOutcome> {
  const started = new Date().toISOString();
  try {
    return await operation();
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    console.error(
      JSON.stringify({
        message: "lead_delivery_provider_failed",
        channel,
        provider,
        detail: timedOut ? "timeout" : "exception"
      })
    );
    return outcome(channel, "failed", started, {
      provider,
      detail: timedOut ? `${provider}_timeout` : `${provider}_exception`
    });
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      "\"": "&quot;"
    };
    return entities[character] ?? character;
  });
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

function emailCopy(env: Env, lead: NormalizedLead): { subject: string; text: string; html: string } {
  const contact = lead.contact;
  if (!contact) throw new Error("identified lead is missing contact data");
  const greeting = firstName(contact.name);
  const interest = lead.interest ? ` about ${lead.interest}` : "";
  const hasRoiResult = lead.source === "roi_calculator_result" && Boolean(lead.recommendation);
  const roiText = hasRoiResult
    ? [
        "",
        `Your calculator result: ${lead.recommendation}`,
        lead.readiness_score === undefined ? undefined : `Readiness score: ${lead.readiness_score}`,
        lead.break_even_months === undefined ? undefined : `Directional break-even: ${lead.break_even_months} months`
      ].filter((line): line is string => Boolean(line))
    : [];
  const subject = hasRoiResult
    ? `Your 57 ROI result, ${greeting}`
    : `Got it, ${greeting} — here’s the fastest next step`;
  const text = [
    `Hi ${greeting},`,
    "",
    `Thanks for reaching out${interest}. I’ve got your note.`,
    ...roiText,
    "",
    "57 builds AI-powered automation and internal tools for businesses drowning in manual work — fixed price, first release in weeks, measured in hours saved and revenue recovered.",
    "",
    `The fastest next move is to book a short call here: ${env.BOOKING_URL}`,
    "",
    "If you’d rather add context first, reply to this email and tell me where the process is breaking down.",
    "",
    "— Gera",
    "57"
  ].join("\n");
  const roiHtml = hasRoiResult
    ? `<p><strong>Your calculator result:</strong> ${escapeHtml(lead.recommendation ?? "")}${
        lead.readiness_score === undefined ? "" : `<br />Readiness score: ${lead.readiness_score}`
      }${lead.break_even_months === undefined ? "" : `<br />Directional break-even: ${lead.break_even_months} months`}</p>`
    : "";
  const html = `
    <p>Hi ${escapeHtml(greeting)},</p>
    <p>Thanks for reaching out${escapeHtml(interest)}. I’ve got your note.</p>
    ${roiHtml}
    <p>57 builds AI-powered automation and internal tools for businesses drowning in manual work — fixed price, first release in weeks, measured in hours saved and revenue recovered.</p>
    <p><a href="${escapeHtml(env.BOOKING_URL)}">Book a short call</a> so we can map the bottleneck and the smallest useful first release.</p>
    <p>If you’d rather add context first, reply to this email and tell me where the process is breaking down.</p>
    <p>— Gera<br />57</p>
  `.trim();
  return { subject, text, html };
}

function testRecipientAllowed(env: Env, email: string): boolean {
  const allowed = new Set(
    env.TEST_EMAIL_ALLOWLIST.split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
  );
  return allowed.has(email.toLowerCase());
}

async function sendAutoResponse(env: Env, lead: NormalizedLead): Promise<DeliveryOutcome> {
  const started = new Date().toISOString();
  const mode = deliveryMode(env);
  const contact = lead.contact;
  if (!contact) return outcome("auto_response", "not_configured", started, { detail: "no_contact" });
  if (mode === "dry-run") return outcome("auto_response", "dry_run", started, { provider: "resend" });
  if (mode === "test" && !testRecipientAllowed(env, contact.email)) {
    return outcome("auto_response", "blocked", started, { provider: "resend", detail: "recipient_not_allowlisted" });
  }

  const copy = emailCopy(env, lead);
  const response = await providerFetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `why57-lead-${lead.submission_id ?? lead.id}`
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: [contact.email],
      reply_to: env.FOUNDER_REPLY_TO,
      subject: copy.subject,
      text: copy.text,
      html: copy.html
    })
  });

  if (!response.ok) {
    return outcome("auto_response", "failed", started, {
      provider: "resend",
      http_status: response.status,
      detail: `resend_http_${response.status}`
    });
  }

  const body = (await response.json()) as { id?: unknown };
  const success: Omit<DeliveryOutcome, "channel" | "status" | "attempted_at" | "completed_at"> = {
    provider: "resend",
    http_status: response.status
  };
  if (typeof body.id === "string") success.provider_id = body.id;
  return outcome("auto_response", "sent", started, success);
}

function slackText(lead: NormalizedLead): string {
  const contact = lead.contact;
  if (!contact) return `Anonymous 57 event from ${lead.source}`;
  const details = [
    `New 57 lead: ${contact.name}`,
    contact.company ? `Company: ${contact.company}` : undefined,
    `Email: ${contact.email}`,
    contact.phone ? `Phone: ${contact.phone}` : undefined,
    `Source: ${lead.source}`,
    lead.interest ? `Interest: ${lead.interest}` : undefined,
    lead.message ? `Note: ${lead.message}` : undefined,
    lead.utm_source ? `UTM: ${lead.utm_source} / ${lead.utm_medium ?? "(none)"} / ${lead.utm_campaign ?? "(none)"}` : undefined,
    lead.page_url ? `Page: ${lead.page_url}` : undefined,
    `Accepted: ${lead.received_at}`
  ];
  return details.filter(Boolean).join("\n").slice(0, 2_800);
}

async function sendFounderAlert(env: Env, lead: NormalizedLead): Promise<DeliveryOutcome> {
  const started = new Date().toISOString();
  const mode = deliveryMode(env);
  if (mode === "dry-run") return outcome("founder_alert", "dry_run", started, { provider: "slack" });

  const text = slackText(lead);
  const response = await providerFetch(env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, mrkdwn: false })
  });

  return response.ok
    ? outcome("founder_alert", "sent", started, { provider: "slack", http_status: response.status })
    : outcome("founder_alert", "failed", started, {
        provider: "slack",
        http_status: response.status,
        detail: `slack_http_${response.status}`
      });
}

async function logToSheet(env: Env, lead: NormalizedLead): Promise<DeliveryOutcome> {
  const started = new Date().toISOString();
  const mode = deliveryMode(env);
  if (mode === "dry-run") return outcome("lead_log", "dry_run", started, { provider: "google_sheets" });

  const response = await providerFetch(env.LEAD_LOG_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      webhook_secret: env.LEAD_LOG_WEBHOOK_SECRET,
      lead
    })
  });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  const accepted = response.ok && isRecord(body) && body.ok === true;

  return accepted
    ? outcome("lead_log", "logged", started, { provider: "google_sheets", http_status: response.status })
    : outcome("lead_log", "failed", started, {
        provider: "google_sheets",
        http_status: response.status,
        detail: response.ok ? "lead_log_rejected" : `lead_log_http_${response.status}`
      });
}

async function deliverLead(env: Env, lead: NormalizedLead): Promise<void> {
  const startedAt = new Date().toISOString();
  const outcomes = await Promise.all([
    captureDeliveryFailure("auto_response", "resend", () => sendAutoResponse(env, lead)),
    captureDeliveryFailure("founder_alert", "slack", () => sendFounderAlert(env, lead)),
    captureDeliveryFailure("lead_log", "google_sheets", () => logToSheet(env, lead))
  ]);
  const record: DeliveryRecord = {
    lead_id: lead.id,
    mode: deliveryMode(env),
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    outcomes
  };

  await env.ROI_LEADS.put(`delivery:${lead.id}`, JSON.stringify(record), {
    expirationTtl: ttlSeconds(env)
  });

  console.log(JSON.stringify({ message: "lead_delivery_completed", ...record }));
}

function isHoneypotSubmission(payload: Record<string, unknown>): boolean {
  return Boolean(cleanString(payload.website, 500));
}

async function handlePost(request: Request, env: Env, ctx: ExecutionContext, origin: string): Promise<Response> {
  const payload = await readBoundedJson(request);
  if (isHoneypotSubmission(payload)) {
    return json({ ok: true, accepted: true }, 202, origin);
  }

  const path = new URL(request.url).pathname;
  const identifiedRoute = path === "/v1/leads" || payload.event_type === "lead_submission";
  await requireTestSubmissionToken(request, env, identifiedRoute);
  const normalized = normalizeLead(payload, request, identifiedRoute);

  const existing = await findExistingLead(env, normalized.submission_id);
  if (existing) {
    return json(
      { ok: true, accepted: true, duplicate: true, id: existing.id, delivery_mode: deliveryMode(env) },
      200,
      origin
    );
  }

  await persistLead(env, normalized);

  if (normalized.lead_kind === "identified") {
    ctx.waitUntil(deliverLead(env, normalized));
  }

  console.log(
    JSON.stringify({
      message: "lead_accepted",
      id: normalized.id,
      kind: normalized.lead_kind,
      source: normalized.source,
      received_at: normalized.received_at
    })
  );

  return json(
    {
      ok: true,
      accepted: true,
      id: normalized.id,
      received_at: normalized.received_at,
      delivery_mode: deliveryMode(env)
    },
    202,
    origin
  );
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const resolvedOrigin = resolveOrigin(request, env);

    if (request.method === "OPTIONS") {
      return resolvedOrigin.allowed
        ? new Response(null, { status: 204, headers: corsHeaders(resolvedOrigin.value) })
        : json({ ok: false, error: "forbidden_origin" }, 403, "https://why57.com");
    }

    if (!resolvedOrigin.allowed) {
      return json({ ok: false, error: "forbidden_origin" }, 403, "https://why57.com");
    }

    const url = new URL(request.url);

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
      return json(
        {
          ok: true,
          service: "why57-lead-intake",
          delivery_mode: deliveryMode(env),
          timestamp: new Date().toISOString()
        },
        200,
        resolvedOrigin.value
      );
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "method_not_allowed" }, 405, resolvedOrigin.value);
    }

    if (url.pathname !== "/" && url.pathname !== "/v1/leads") {
      return json({ ok: false, error: "not_found" }, 404, resolvedOrigin.value);
    }

    try {
      return await handlePost(request, env, ctx, resolvedOrigin.value);
    } catch (error) {
      if (error instanceof HttpError) {
        return json({ ok: false, error: error.code, message: error.message }, error.status, resolvedOrigin.value);
      }

      console.error(
        JSON.stringify({
          message: "lead_intake_failed",
          error: error instanceof Error ? error.message : "unknown_error",
          path: url.pathname
        })
      );
      return json({ ok: false, error: "internal_error" }, 500, resolvedOrigin.value);
    }
  }
} satisfies ExportedHandler<Env>;
