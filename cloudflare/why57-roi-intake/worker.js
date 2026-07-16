const ALLOWED_ORIGINS = new Set([
  "https://roi.why57.com",
  "https://why57.com"
]);

const SITE_ORIGIN = "https://why57.com";
const PROTOTYPE_REVIEW_PATH = "/prototype-review";
const PROTOTYPE_NO_JS_FORM_PATH = "/prototype-review/form";
const CONVERSION_RECEIPT_PATH = "/conversion-receipt";
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 180;
const MAX_BODY_BYTES = 48 * 1024;
const RATE_LIMIT_ATTEMPTS = 6;
const RATE_LIMIT_TTL_SECONDS = 60 * 60;
const CONSENT_TEXT_VERSION = "2026-07-15";
const ROI_REPORT_CONSENT_VERSION = "roi-report-v1-2026-07-15";
const MIN_REPORT_FORM_TIME_MS = 1500;
const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{8,120}$/;
const ALLOWED_ROI_EVENTS = new Set([
  "calendar_booking_clicked",
  "roi_report_requested"
]);
const COMPLETED_OUTCOME_EVENTS = new Set([
  "prototype_review_submitted",
  "lead_submitted",
  "roi_report_requested",
  "calendar_booking_completed"
]);

const ALLOWED_TOOLS = new Set([
  "claude",
  "chatgpt",
  "lovable",
  "replit",
  "bolt",
  "v0",
  "cursor",
  "other"
]);

const ALLOWED_USER_STAGES = new Set([
  "none",
  "just_me",
  "testers_1_10",
  "active_11_100",
  "active_100_plus"
]);

const ALLOWED_TARGET_DATES = new Set([
  "asap",
  "within_30_days",
  "one_to_three_months",
  "three_to_six_months",
  "exploring"
]);

class RequestError extends Error {
  constructor(status, code, message, fields = undefined) {
    super(message);
    this.name = "RequestError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

function corsHeaders(origin = SITE_ORIGIN) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(data, { status = 200, origin = SITE_ORIGIN } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== "" && item !== null && item !== undefined)
  );
}

function cleanText(value, maxLength) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value).replace(/\u0000/g, "").trim().slice(0, maxLength);
}

function isAllowedUrl(value) {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch (_error) {
    return false;
  }
}

function isEmail(value) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isConsentGranted(value) {
  if (value === true) return true;
  return ["1", "on", "true", "yes"].includes(cleanText(value, 8).toLowerCase());
}

function getRequestOrigin(request) {
  return request.headers.get("origin") || "";
}

function getAllowedCorsOrigin(request) {
  const origin = getRequestOrigin(request);
  return ALLOWED_ORIGINS.has(origin) ? origin : SITE_ORIGIN;
}

function hasAllowedSiteContext(request, { allowWorkerOrigin = false } = {}) {
  const origin = getRequestOrigin(request);
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (allowWorkerOrigin && origin === new URL(request.url).origin) return true;
  if (origin) return false;

  const referer = request.headers.get("referer");
  if (!referer) return false;
  try {
    const refererOrigin = new URL(referer).origin;
    return ALLOWED_ORIGINS.has(refererOrigin) || (allowWorkerOrigin && refererOrigin === new URL(request.url).origin);
  } catch (_error) {
    return false;
  }
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function prototypeNoJsFormResponse(request) {
  const requestId = crypto.randomUUID();
  const action = `${new URL(request.url).origin}${PROTOTYPE_REVIEW_PATH}`;
  const body = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Send your prototype | 57</title>
  <style>body{margin:0;background:#07070d;color:#ededee;font:16px/1.55 Inter,-apple-system,BlinkMacSystemFont,sans-serif}main{max-width:720px;margin:0 auto;padding:48px 20px 72px}h1{font-size:clamp(2rem,8vw,3.4rem);line-height:1.05;margin:0 0 12px}p{color:rgba(237,237,239,.7)}form{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:32px;padding:24px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(255,255,255,.04)}label{display:grid;gap:7px;font-weight:650;font-size:.88rem}.full{grid-column:1/-1}input,select,textarea{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.18);border-radius:8px;background:#111119;color:#fff;font:inherit;padding:12px}textarea{min-height:112px;resize:vertical}.consent{display:grid;grid-template-columns:20px 1fr;gap:10px;align-items:start}.consent input{width:18px;height:18px}button{border:0;border-radius:8px;background:#e04c28;color:#fff;font:inherit;font-weight:700;padding:14px 18px;cursor:pointer}a{color:#ffb090}@media(max-width:640px){main{padding-top:30px}form{grid-template-columns:1fr;padding:18px}.full{grid-column:1}}</style>
</head>
<body><main>
  <p>57 prototype review</p>
  <h1>Send the prototype. Get a five-point readiness review.</h1>
  <p>This secure fallback works without JavaScript. Do not include passwords, API keys, private customer data, or access we have not agreed to review.</p>
  <form action="${action}" method="post">
    <input type="hidden" name="request_id" value="${requestId}">
    <input type="hidden" name="event_type" value="prototype_review_submitted">
    <input type="hidden" name="site_source" value="why57_prototype_no_js">
    <input type="hidden" name="page_url" value="${SITE_ORIGIN}/ai-app-prototype-to-production.html">
    <label>Your name *<input name="name" autocomplete="name" minlength="2" maxlength="100" required></label>
    <label>Work email *<input name="email" type="email" autocomplete="email" maxlength="254" required></label>
    <label>Built with *<select name="tool" required><option value="">Choose a tool</option><option value="claude">Claude</option><option value="chatgpt">ChatGPT</option><option value="lovable">Lovable</option><option value="replit">Replit</option><option value="bolt">Bolt</option><option value="v0">v0</option><option value="cursor">Cursor</option><option value="other">Another or mixed stack</option></select></label>
    <label>Current users *<select name="current_users" required><option value="">Choose one</option><option value="none">None yet</option><option value="just_me">Only me or my team</option><option value="testers_1_10">1–10 testers</option><option value="active_11_100">11–100 active users</option><option value="active_100_plus">More than 100 active users</option></select></label>
    <label class="full">What does it help someone do? *<textarea name="prototype_description" minlength="20" maxlength="2000" required></textarea></label>
    <label>Target date *<select name="target_date" required><option value="">Choose a window</option><option value="asap">As soon as responsibly possible</option><option value="within_30_days">Within 30 days</option><option value="one_to_three_months">1–3 months</option><option value="three_to_six_months">3–6 months</option><option value="exploring">Exploring</option></select></label>
    <label>Prototype URL (optional)<input name="prototype_url" type="url" maxlength="500"></label>
    <label class="full">What is blocking the next step? *<textarea name="blocker" minlength="10" maxlength="1500" required></textarea></label>
    <input name="website" tabindex="-1" autocomplete="off" hidden>
    <label class="full consent"><input name="consent" type="checkbox" value="yes" required><span>I agree that 57 may use this information to review my prototype and contact me about this request. I have not included secrets or private customer data. See the <a href="${SITE_ORIGIN}/privacy.html">Privacy Policy</a>. *</span></label>
    <button class="full" type="submit">Send My Prototype</button>
  </form>
</main></body></html>`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

function isHtmlFormRequest(request) {
  const contentType = request.headers.get("content-type") || "";
  const accept = request.headers.get("accept") || "";
  return contentType.includes("application/x-www-form-urlencoded") && !accept.includes("application/json");
}

function htmlErrorResponse({ status, title, message }) {
  const body = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>${title} | 57</title>
  <style>body{margin:0;background:#07070d;color:#ededee;font:16px/1.65 Inter,-apple-system,BlinkMacSystemFont,sans-serif}main{max-width:660px;margin:12vh auto;padding:32px}div{padding:32px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(255,255,255,.04)}h1{font-size:2rem;line-height:1.15;margin:0 0 14px}p{color:rgba(237,237,239,.66);margin:0 0 24px}a{display:inline-block;padding:12px 18px;border-radius:8px;background:#e04c28;color:#fff;text-decoration:none;font-weight:650}a:focus{outline:3px solid #ff7940;outline-offset:3px}</style>
</head>
<body><main><div><h1>${title}</h1><p>${message}</p><a href="${SITE_ORIGIN}/ai-app-prototype-to-production.html#send-prototype">Return to your prototype request</a></div></main></body>
</html>`;

  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

function prototypeErrorResponse(request, error) {
  if (isHtmlFormRequest(request)) {
    const content = error.status === 429
      ? {
          title: "Please try again later",
          message: "We have received several requests from this connection. Wait an hour, then return to the form and try again."
        }
      : error.status >= 500
        ? {
            title: "The review service is temporarily unavailable",
            message: "Your prototype was not submitted. Please return to the form and try again in a few minutes."
          }
        : {
            title: "Please check your prototype request",
            message: "One or more answers could not be accepted. Return to the form, check each required field, and submit again."
          };

    return htmlErrorResponse({ status: error.status, ...content });
  }

  return json({
    ok: false,
    error: error.code,
    message: error.message,
    ...(error.fields ? { fields: error.fields } : {})
  }, {
    status: error.status,
    origin: getAllowedCorsOrigin(request)
  });
}

async function readBoundedBody(request) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    throw new RequestError(413, "payload_too_large", "The submitted form is too large.");
  }

  if (!request.body) return "";

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesRead += value.byteLength;
    if (bytesRead > MAX_BODY_BYTES) {
      await reader.cancel("payload_too_large");
      throw new RequestError(413, "payload_too_large", "The submitted form is too large.");
    }
    body += decoder.decode(value, { stream: true });
  }

  return body + decoder.decode();
}

async function parseRequestPayload(request) {
  const contentType = request.headers.get("content-type") || "";
  const body = await readBoundedBody(request);

  if (contentType.includes("application/json")) {
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (_error) {
      throw new RequestError(400, "invalid_json", "The request body is not valid JSON.");
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new RequestError(400, "invalid_payload", "The request body must be an object.");
    }
    return payload;
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(body));
  }

  throw new RequestError(415, "unsupported_media_type", "Use JSON or a standard HTML form submission.");
}

function normalizePayload(payload = {}, request) {
  const context = payload?.context || {};
  const detail = payload?.detail || {};
  const now = new Date().toISOString();

  return compactObject({
    id: crypto.randomUUID(),
    received_at: now,
    sent_at: cleanText(payload?.sent_at, 40) || now,
    event_type: cleanText(payload?.event_type, 80) || "unclassified_event",
    site_source: cleanText(detail.site_source || context.site_source, 120) || null,
    page_url: cleanText(detail.page_url, 1000) || null,
    referrer: cleanText(detail.referrer, 1000) || null,
    session_id: cleanText(context.session_id, 120) || null,
    recommendation: cleanText(context.recommendation, 120) || null,
    readiness_score: Number.isFinite(Number(context.readiness_score))
      ? Number(context.readiness_score)
      : null,
    break_even_months: Number.isFinite(Number(context.break_even_months))
      ? Number(context.break_even_months)
      : null,
    project_type: cleanText(context.project_type, 120) || null,
    build_estimate_mid: Number.isFinite(Number(context.build_estimate_mid))
      ? Number(context.build_estimate_mid)
      : null,
    utm_source: cleanText(context.utm_source, 120) || null,
    utm_medium: cleanText(context.utm_medium, 120) || null,
    utm_campaign: cleanText(context.utm_campaign, 160) || null,
    cta_location: cleanText(detail.cta_location, 120) || null,
    offer: cleanText(detail.offer, 120) || null,
    page_path: cleanText(detail.page_path || context.page_path, 500) || null,
    conversion_stage: cleanText(detail.conversion_stage, 40) || null,
    first_touch_source: cleanText(detail.first_touch?.source || context.first_touch_source, 120) || null,
    first_touch_medium: cleanText(detail.first_touch?.medium || context.first_touch_medium, 120) || null,
    first_touch_campaign: cleanText(detail.first_touch?.utm_campaign || context.first_touch_campaign, 160) || null,
    origin: request.headers.get("origin") || null
  });
}

function validateRoiPayload(payload, request) {
  const eventType = cleanText(payload?.event_type, 80);
  if (!ALLOWED_ROI_EVENTS.has(eventType)) {
    throw new RequestError(400, "unsupported_event", "This ROI event is not supported.");
  }

  const normalized = normalizePayload(payload, request);
  if (eventType !== "roi_report_requested") return normalized;

  const detail = payload?.detail || {};
  const email = cleanText(detail.email, 254).toLowerCase();
  const requestId = cleanText(detail.request_id, 120);
  const consentVersion = cleanText(detail.consent_version, 80);
  const formElapsedMs = Number(detail.form_elapsed_ms);

  if (!isEmail(email)) throw new RequestError(422, "invalid_email", "Enter a valid email address.");
  if (!REQUEST_ID_PATTERN.test(requestId)) {
    throw new RequestError(422, "invalid_request_id", "A valid request identifier is required.");
  }
  if (!isConsentGranted(detail.consent) || consentVersion !== ROI_REPORT_CONSENT_VERSION) {
    throw new RequestError(422, "consent_required", "Consent is required before the report can be sent.");
  }
  if (!Number.isFinite(formElapsedMs) || formElapsedMs < MIN_REPORT_FORM_TIME_MS) {
    throw new RequestError(429, "request_too_fast", "Please wait a moment before sending the report request.");
  }

  return compactObject({
    ...normalized,
    request_id: requestId,
    email,
    consent: true,
    consent_version: consentVersion,
    result_summary: cleanText(detail.result_summary, 2000),
    recommended_plan: cleanText(JSON.stringify(detail.recommended_plan || {}), 4000)
  });
}

function validatePrototypePayload(payload, request) {
  const data = {
    request_id: cleanText(payload.request_id, 120),
    name: cleanText(payload.name, 100),
    email: cleanText(payload.email, 254).toLowerCase(),
    company: cleanText(payload.company, 160),
    prototype_url: cleanText(payload.prototype_url, 500),
    prototype_description: cleanText(payload.prototype_description, 2000),
    tool: cleanText(payload.tool, 40).toLowerCase(),
    current_users: cleanText(payload.current_users, 40).toLowerCase(),
    blocker: cleanText(payload.blocker, 1500),
    target_date: cleanText(payload.target_date, 40).toLowerCase(),
    consent: isConsentGranted(payload.consent),
    site_source: cleanText(payload.site_source, 120) || "why57_ai_prototype_page",
    page_url: cleanText(payload.page_url, 1000),
    referrer: cleanText(payload.referrer, 1000),
    session_id: cleanText(payload.session_id, 120),
    utm_source: cleanText(payload.utm_source, 120),
    utm_medium: cleanText(payload.utm_medium, 120),
    utm_campaign: cleanText(payload.utm_campaign, 160)
  };

  const fields = {};
  if (!REQUEST_ID_PATTERN.test(data.request_id)) fields.request_id = "Reload the form to create a valid request identifier.";
  if (data.name.length < 2) fields.name = "Enter your name.";
  if (!isEmail(data.email)) fields.email = "Enter a valid email address.";
  if (data.prototype_url && !isAllowedUrl(data.prototype_url)) fields.prototype_url = "Enter a full http:// or https:// URL.";
  if (data.prototype_description.length < 20) fields.prototype_description = "Describe who the prototype is for and what it does.";
  if (!ALLOWED_TOOLS.has(data.tool)) fields.tool = "Choose the tool you used.";
  if (!ALLOWED_USER_STAGES.has(data.current_users)) fields.current_users = "Choose the closest current-user range.";
  if (data.blocker.length < 10) fields.blocker = "Tell us what is blocking the next step.";
  if (!ALLOWED_TARGET_DATES.has(data.target_date)) fields.target_date = "Choose a target window.";
  if (!data.consent) fields.consent = "Consent is required before we can review and respond.";

  if (Object.keys(fields).length) {
    throw new RequestError(422, "validation_failed", "Please check the highlighted fields.", fields);
  }

  const now = new Date().toISOString();
  return compactObject({
    id: crypto.randomUUID(),
    received_at: now,
    event_type: "prototype_review_submitted",
    ...data,
    consent_text_version: CONSENT_TEXT_VERSION,
    origin: getRequestOrigin(request) || null
  });
}

function looksAutomated(payload) {
  if (cleanText(payload.website, 200)) return true;

  const startedAt = Number(payload.form_started_at);
  if (!Number.isFinite(startedAt) || startedAt <= 0) return false;
  const elapsed = Date.now() - startedAt;
  return elapsed < 1200 || elapsed < -10000;
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

async function payloadHash(normalized) {
  const stablePayload = { ...normalized };
  delete stablePayload.id;
  delete stablePayload.received_at;
  delete stablePayload.sent_at;
  delete stablePayload.origin;
  return sha256Hex(stableStringify(stablePayload));
}

async function getRequestRecord(env, requestId) {
  return env.INTAKE_DB.prepare(
    "SELECT request_id, event_type, submission_id, payload_hash, status, stored, forwarded, receipt_token, receipt_consumed_at, response_status, error_code, error_message, created_at, updated_at FROM intake_requests WHERE request_id = ?1 LIMIT 1"
  ).bind(requestId).first();
}

async function claimRequest(env, normalized) {
  if (!env.INTAKE_DB) {
    throw new RequestError(503, "idempotency_unavailable", "Submission idempotency is not configured.");
  }

  const hash = await payloadHash(normalized);
  const receiptToken = randomToken();
  const now = new Date().toISOString();
  const inserted = await env.INTAKE_DB.prepare(`
    INSERT INTO intake_requests (
      request_id, event_type, submission_id, payload_hash, status,
      stored, forwarded, receipt_token, created_at, updated_at
    ) VALUES (?1, ?2, ?3, ?4, 'processing', 0, 0, ?5, ?6, ?6)
    ON CONFLICT(request_id) DO NOTHING
    RETURNING request_id, event_type, submission_id, payload_hash, status, stored, forwarded, receipt_token, receipt_consumed_at, response_status, error_code, error_message, created_at, updated_at
  `).bind(
    normalized.request_id,
    normalized.event_type,
    normalized.id,
    hash,
    receiptToken,
    now
  ).first();

  if (inserted) return { owner: true, record: inserted };

  const existing = await getRequestRecord(env, normalized.request_id);
  if (!existing) {
    throw new RequestError(503, "idempotency_unavailable", "The prior request outcome could not be read.");
  }
  if (existing.event_type !== normalized.event_type || existing.payload_hash !== hash) {
    throw new RequestError(409, "idempotency_conflict", "This request identifier was already used for different submission data.");
  }
  return { owner: false, record: existing };
}

async function markRequestDelivered(env, requestId) {
  const now = new Date().toISOString();
  const record = await env.INTAKE_DB.prepare(`
    UPDATE intake_requests
    SET status = 'delivered', stored = 1, forwarded = 1, response_status = 200,
        error_code = NULL, error_message = NULL, updated_at = ?1
    WHERE request_id = ?2 AND status = 'processing'
    RETURNING request_id, event_type, submission_id, payload_hash, status, stored, forwarded, receipt_token, receipt_consumed_at, response_status, error_code, error_message, created_at, updated_at
  `).bind(now, requestId).first();

  if (!record) {
    throw new RequestError(500, "delivery_state_unknown", "Delivery succeeded but its authoritative state could not be finalized.");
  }
  return record;
}

async function markRequestFailed(env, requestId, error) {
  const now = new Date().toISOString();
  await env.INTAKE_DB.prepare(`
    UPDATE intake_requests
    SET status = 'failed', stored = 0, forwarded = 0, response_status = ?1,
        error_code = ?2, error_message = ?3, updated_at = ?4
    WHERE request_id = ?5 AND status = 'processing'
  `).bind(error.status, error.code, error.message, now, requestId).run();
}

async function consumeRateLimit(env, request, prefix, salt) {
  const ip = request.headers.get("cf-connecting-ip");
  if (!ip || !salt) return { enabled: false, limited: false };
  if (!env.INTAKE_DB) {
    throw new RequestError(503, "idempotency_unavailable", "Submission idempotency is not configured.");
  }

  const now = Date.now();
  const windowKey = new Date(now).toISOString().slice(0, 13);
  const hash = await sha256Hex(`${salt}:${ip}`);
  const key = `${prefix}:${windowKey}:${hash}`;
  const updatedAt = new Date(now).toISOString();

  await env.INTAKE_DB.prepare("DELETE FROM intake_rate_limits WHERE expires_at < ?1").bind(now).run();
  const counter = await env.INTAKE_DB.prepare(`
    INSERT INTO intake_rate_limits (rate_key, request_count, expires_at, updated_at)
    VALUES (?1, 1, ?2, ?3)
    ON CONFLICT(rate_key) DO UPDATE SET
      request_count = intake_rate_limits.request_count + 1,
      expires_at = excluded.expires_at,
      updated_at = excluded.updated_at
    RETURNING request_count
  `).bind(key, now + RATE_LIMIT_TTL_SECONDS * 1000, updatedAt).first();

  const count = Number(counter?.request_count || 0);
  return { enabled: true, limited: count > RATE_LIMIT_ATTEMPTS, count };
}

function consumePrototypeRateLimit(env, request) {
  return consumeRateLimit(env, request, "prototype_review", env.PROTOTYPE_REVIEW_RATE_LIMIT_SALT);
}

function consumeRoiReportRateLimit(env, request) {
  return consumeRateLimit(env, request, "roi_report", env.ROI_REPORT_RATE_LIMIT_SALT);
}

async function persistLead(env, normalized) {
  if (!env.ROI_LEADS) return { stored: false, reason: "missing_kv_binding" };

  const timestamp = Date.parse(normalized.sent_at || normalized.received_at || new Date().toISOString());
  const day = new Date(Number.isFinite(timestamp) ? timestamp : Date.now()).toISOString().slice(0, 10);
  const sessionId = normalized.session_id || "anonymous";
  const recordType = COMPLETED_OUTCOME_EVENTS.has(normalized.event_type) ? "lead" : "event";
  const key = `${recordType}:${day}:${sessionId}:${normalized.id}`;
  const latestKey = `latest:${sessionId}`;
  const expirationTtl = Number(env.ROI_DATA_TTL_SECONDS || DEFAULT_TTL_SECONDS);
  const body = JSON.stringify(normalized);

  await Promise.all([
    env.ROI_LEADS.put(key, body, { expirationTtl }),
    env.ROI_LEADS.put(latestKey, body, { expirationTtl })
  ]);

  return { stored: true, key, latest_key: latestKey, expiration_ttl: expirationTtl };
}

async function persistPrototypeReview(env, normalized) {
  if (!env.ROI_LEADS) {
    throw new RequestError(503, "service_unavailable", "The review service is not configured.");
  }

  const day = normalized.received_at.slice(0, 10);
  const key = `prototype_review:${day}:${normalized.id}`;
  const latestKey = "latest:prototype_review";
  const expirationTtl = Number(env.PROTOTYPE_REVIEW_DATA_TTL_SECONDS || env.ROI_DATA_TTL_SECONDS || DEFAULT_TTL_SECONDS);
  const body = JSON.stringify(normalized);

  await Promise.all([
    env.ROI_LEADS.put(key, body, { expirationTtl }),
    env.ROI_LEADS.put(latestKey, body, { expirationTtl })
  ]);

  return { key, latest_key: latestKey, expiration_ttl: expirationTtl };
}

async function forwardLead(env, normalized) {
  const isReport = normalized.event_type === "roi_report_requested";
  const webhookUrl = isReport ? env.ROI_REPORT_WEBHOOK_URL : env.ROI_FORWARD_WEBHOOK_URL;
  if (!webhookUrl) {
    if (isReport) throw new RequestError(503, "delivery_not_configured", "Report delivery is not configured.");
    return { forwarded: false, configured: false };
  }

  const headers = {
    "Content-Type": "application/json"
  };
  if (normalized.request_id) {
    headers["Idempotency-Key"] = normalized.request_id;
    headers["X-Why57-Request-Id"] = normalized.request_id;
  }

  const webhookSecret = isReport
    ? env.ROI_REPORT_WEBHOOK_SECRET || env.ROI_FORWARD_WEBHOOK_SECRET
    : env.ROI_FORWARD_WEBHOOK_SECRET;
  if (webhookSecret) {
    headers["X-ROI-Webhook-Secret"] = webhookSecret;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(normalized)
  });

  return {
    forwarded: response.ok,
    configured: true,
    status: response.status
  };
}

async function forwardPrototypeReview(env, normalized) {
  if (!env.PROTOTYPE_REVIEW_FORWARD_WEBHOOK_URL) return { forwarded: false, configured: false };

  const headers = {
    "Content-Type": "application/json"
  };
  headers["Idempotency-Key"] = normalized.request_id;
  headers["X-Why57-Request-Id"] = normalized.request_id;

  if (env.PROTOTYPE_REVIEW_FORWARD_WEBHOOK_SECRET) {
    headers["X-Prototype-Review-Webhook-Secret"] = env.PROTOTYPE_REVIEW_FORWARD_WEBHOOK_SECRET;
  }

  const response = await fetch(env.PROTOTYPE_REVIEW_FORWARD_WEBHOOK_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(normalized)
  });

  return {
    forwarded: response.ok,
    configured: true,
    status: response.status
  };
}

function successPayload(record, { replayed = false } = {}) {
  return {
    ok: true,
    id: record.submission_id,
    request_id: record.request_id,
    stored: Boolean(record.stored),
    forwarded: Boolean(record.forwarded),
    receipt: record.receipt_token,
    replayed
  };
}

function prototypeSuccessResponse(request, record, options = {}) {
  if (isHtmlFormRequest(request)) {
    const location = `${SITE_ORIGIN}/prototype-review-thank-you.html?receipt=${encodeURIComponent(record.receipt_token)}`;
    return new Response(null, {
      status: 303,
      headers: {
        "Location": location,
        "Cache-Control": "no-store"
      }
    });
  }

  return json(successPayload(record, options), {
    origin: getAllowedCorsOrigin(request)
  });
}

function roiSuccessResponse(request, record, options = {}) {
  return json(successPayload(record, options), {
    origin: getAllowedCorsOrigin(request)
  });
}

function filteredResponse(request) {
  return json({
    ok: true,
    stored: false,
    forwarded: false,
    filtered: true
  }, {
    status: 202,
    origin: getAllowedCorsOrigin(request)
  });
}

function previousRequestResponse(request, record, kind) {
  if (record.status === "delivered") {
    return kind === "prototype"
      ? prototypeSuccessResponse(request, record, { replayed: true })
      : roiSuccessResponse(request, record, { replayed: true });
  }

  if (record.status === "failed") {
    const error = new RequestError(
      Number(record.response_status || 500),
      record.error_code || "submission_failed",
      record.error_message || "The prior submission attempt failed."
    );
    return kind === "prototype"
      ? prototypeErrorResponse(request, error)
      : json({ ok: false, error: error.code, message: error.message, replayed: true }, {
          status: error.status,
          origin: getAllowedCorsOrigin(request)
        });
  }

  const pending = new RequestError(202, "request_processing", "This request is already being processed.");
  return kind === "prototype"
    ? (isHtmlFormRequest(request)
        ? htmlErrorResponse({ status: 409, title: "Your request is still processing", message: "Do not submit it again. Return in a moment and check your email." })
        : json({ ok: false, pending: true, replayed: true, error: pending.code, message: pending.message }, {
            status: pending.status,
            origin: getAllowedCorsOrigin(request)
          }))
    : json({ ok: false, pending: true, replayed: true, error: pending.code, message: pending.message }, {
        status: pending.status,
        origin: getAllowedCorsOrigin(request)
      });
}

async function handleConversionReceipt(request, env) {
  if (!hasAllowedSiteContext(request)) {
    return json({ ok: false, error: "forbidden_origin" }, { status: 403, origin: getAllowedCorsOrigin(request) });
  }
  if (!env.INTAKE_DB) {
    return json({ ok: false, error: "idempotency_unavailable" }, { status: 503, origin: getAllowedCorsOrigin(request) });
  }

  try {
    const payload = await parseRequestPayload(request);
    const receipt = cleanText(payload.receipt, 128);
    if (!/^[a-f0-9]{64}$/.test(receipt)) {
      throw new RequestError(404, "invalid_receipt", "This conversion receipt is not valid.");
    }

    const now = new Date().toISOString();
    const claimed = await env.INTAKE_DB.prepare(`
      UPDATE intake_requests
      SET receipt_consumed_at = ?1, updated_at = ?1
      WHERE receipt_token = ?2 AND status = 'delivered' AND stored = 1 AND forwarded = 1
        AND receipt_consumed_at IS NULL
      RETURNING request_id, event_type, submission_id
    `).bind(now, receipt).first();

    if (claimed) {
      return json({
        ok: true,
        claimed: true,
        event_type: claimed.event_type,
        submission_id: claimed.submission_id,
        reference: String(claimed.submission_id).slice(0, 8).toUpperCase()
      }, { origin: getAllowedCorsOrigin(request) });
    }

    const existing = await env.INTAKE_DB.prepare(
      "SELECT event_type, submission_id, status, stored, forwarded, receipt_consumed_at FROM intake_requests WHERE receipt_token = ?1 LIMIT 1"
    ).bind(receipt).first();
    if (!existing) throw new RequestError(404, "invalid_receipt", "This conversion receipt is not valid.");
    if (existing.status !== "delivered" || !existing.stored || !existing.forwarded) {
      throw new RequestError(409, "receipt_not_delivered", "This receipt does not represent a delivered submission.");
    }

    return json({
      ok: true,
      claimed: false,
      already_consumed: Boolean(existing.receipt_consumed_at),
      event_type: existing.event_type,
      submission_id: existing.submission_id,
      reference: String(existing.submission_id).slice(0, 8).toUpperCase()
    }, { origin: getAllowedCorsOrigin(request) });
  } catch (error) {
    const responseError = error instanceof RequestError
      ? error
      : new RequestError(500, "receipt_failed", "The conversion receipt could not be validated.");
    return json({ ok: false, error: responseError.code, message: responseError.message }, {
      status: responseError.status,
      origin: getAllowedCorsOrigin(request)
    });
  }
}

async function handlePrototypeReview(request, env) {
  if (!hasAllowedSiteContext(request, { allowWorkerOrigin: true })) {
    return prototypeErrorResponse(request, new RequestError(403, "forbidden_origin", "This form only accepts requests from why57.com."));
  }

  let requestClaim = null;
  let deliveryAccepted = false;
  try {
    const payload = await parseRequestPayload(request);

    if (looksAutomated(payload)) {
      return filteredResponse(request);
    }

    const normalized = validatePrototypePayload(payload, request);
    if (!env.INTAKE_DB) {
      throw new RequestError(503, "idempotency_unavailable", "Prototype review idempotency is not configured.");
    }
    if (!env.ROI_LEADS) {
      throw new RequestError(503, "service_unavailable", "The review service is not configured.");
    }
    if (!env.PROTOTYPE_REVIEW_FORWARD_WEBHOOK_URL) {
      throw new RequestError(503, "delivery_not_configured", "Prototype review delivery is not configured.");
    }

    requestClaim = await claimRequest(env, normalized);
    if (!requestClaim.owner) return previousRequestResponse(request, requestClaim.record, "prototype");

    const rateLimit = await consumePrototypeRateLimit(env, request);
    if (rateLimit.limited) {
      throw new RequestError(429, "rate_limited", "Too many prototype review requests. Please try again later.");
    }

    let storage;
    try {
      storage = await persistPrototypeReview(env, normalized);
    } catch (_error) {
      throw new RequestError(500, "storage_failed", "The prototype review request could not be stored.");
    }

    let forwarding;
    try {
      forwarding = await forwardPrototypeReview(env, normalized);
    } catch (error) {
      console.error(JSON.stringify({
        message: "prototype review forwarding failed",
        submission_id: normalized.id,
        error: error instanceof Error ? error.message : "unknown_error"
      }));
      throw new RequestError(502, "delivery_state_unknown", "Delivery could not be confirmed. This request will not be forwarded again automatically.");
    }

    if (!forwarding.forwarded) {
      throw new RequestError(502, "delivery_failed", "The prototype review request could not be delivered.");
    }
    deliveryAccepted = true;
    const deliveredRecord = await markRequestDelivered(env, normalized.request_id);

    console.log(JSON.stringify({
      message: "prototype review accepted",
      request_id: normalized.request_id,
      submission_id: normalized.id,
      storage_key: storage.key,
      rate_limit_enabled: rateLimit.enabled,
      forwarded: forwarding.forwarded
    }));

    return prototypeSuccessResponse(request, deliveredRecord);
  } catch (error) {
    const responseError = error instanceof RequestError
      ? error
      : new RequestError(500, "submission_failed", "The prototype review request could not be stored.");

    if (requestClaim?.owner && !deliveryAccepted && responseError.code !== "delivery_state_unknown") {
      try {
        await markRequestFailed(env, requestClaim.record.request_id, responseError);
      } catch (stateError) {
        console.error(JSON.stringify({
          message: "prototype review failure state could not be recorded",
          request_id: requestClaim.record.request_id,
          error: stateError instanceof Error ? stateError.message : "unknown_error"
        }));
      }
    }

    console.error(JSON.stringify({
      message: "prototype review request failed",
      path: PROTOTYPE_REVIEW_PATH,
      request_id: requestClaim?.record?.request_id || null,
      error: responseError.message
    }));

    return prototypeErrorResponse(request, responseError);
  }
}

async function handleRoiLead(request, env) {
  if (!hasAllowedSiteContext(request)) {
    return json({ ok: false, error: "forbidden_origin" }, {
      status: 403,
      origin: getAllowedCorsOrigin(request)
    });
  }

  let requestClaim = null;
  let deliveryAccepted = false;
  try {
    const payload = await parseRequestPayload(request);
    const detail = payload?.detail || {};
    if (payload?.event_type === "roi_report_requested" && cleanText(detail.website, 200)) {
      return filteredResponse(request);
    }

    const normalized = validateRoiPayload(payload, request);
    if (normalized.event_type !== "roi_report_requested") {
      const storage = await persistLead(env, normalized);
      const forwarding = await forwardLead(env, normalized);
      return json({
        ok: true,
        id: normalized.id,
        stored: storage.stored,
        forwarded: forwarding.forwarded
      }, { origin: getAllowedCorsOrigin(request) });
    }

    if (!env.INTAKE_DB) throw new RequestError(503, "idempotency_unavailable", "Report idempotency is not configured.");
    if (!env.ROI_LEADS) throw new RequestError(503, "service_unavailable", "Report storage is not configured.");
    if (!env.ROI_REPORT_WEBHOOK_URL) {
      throw new RequestError(503, "delivery_not_configured", "Report delivery is not configured.");
    }

    requestClaim = await claimRequest(env, normalized);
    if (!requestClaim.owner) return previousRequestResponse(request, requestClaim.record, "roi");

    const rateLimit = await consumeRoiReportRateLimit(env, request);
    if (rateLimit.limited) throw new RequestError(429, "rate_limited", "Too many report requests. Please try again later.");

    let storage;
    try {
      storage = await persistLead(env, normalized);
    } catch (_error) {
      throw new RequestError(500, "storage_failed", "The report request could not be stored.");
    }

    let forwarding;
    try {
      forwarding = await forwardLead(env, normalized);
    } catch (_error) {
      throw new RequestError(502, "delivery_state_unknown", "Delivery could not be confirmed. This request will not be forwarded again automatically.");
    }
    if (!forwarding.forwarded) throw new RequestError(502, "delivery_failed", "The report could not be delivered.");

    deliveryAccepted = true;
    const deliveredRecord = await markRequestDelivered(env, normalized.request_id);

    console.log(JSON.stringify({
      message: "ROI report accepted",
      request_id: normalized.request_id,
      submission_id: normalized.id,
      storage_key: storage.key,
      forwarded: forwarding.forwarded
    }));
    return roiSuccessResponse(request, deliveredRecord);
  } catch (error) {
    const responseError = error instanceof RequestError
      ? error
      : new RequestError(500, "storage_failed", "The report request could not be stored.");
    if (requestClaim?.owner && !deliveryAccepted && responseError.code !== "delivery_state_unknown") {
      try {
        await markRequestFailed(env, requestClaim.record.request_id, responseError);
      } catch (stateError) {
        console.error(JSON.stringify({
          message: "ROI report failure state could not be recorded",
          request_id: requestClaim.record.request_id,
          error: stateError instanceof Error ? stateError.message : "unknown_error"
        }));
      }
    }
    console.error(JSON.stringify({
      message: "ROI intake request failed",
      request_id: requestClaim?.record?.request_id || null,
      error: responseError.message
    }));
    return json({ ok: false, error: responseError.code, message: responseError.message }, {
      status: responseError.status,
      origin: getAllowedCorsOrigin(request)
    });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = getRequestOrigin(request);
    const originAllowed = !origin || ALLOWED_ORIGINS.has(origin);
    const allowOrigin = originAllowed ? origin || SITE_ORIGIN : SITE_ORIGIN;

    if (request.method === "OPTIONS") {
      if (!origin || !ALLOWED_ORIGINS.has(origin)) {
        return json({ ok: false, error: "forbidden_origin" }, {
          status: 403,
          origin: SITE_ORIGIN
        });
      }

      return new Response(null, {
        status: 204,
        headers: corsHeaders(allowOrigin)
      });
    }

    if (request.method === "GET") {
      if (url.pathname === PROTOTYPE_NO_JS_FORM_PATH) {
        return prototypeNoJsFormResponse(request);
      }
      return json({
        ok: true,
        service: "why57-roi-intake",
        path: url.pathname,
        has_storage: Boolean(env.ROI_LEADS),
        has_idempotency_db: Boolean(env.INTAKE_DB),
        ...(url.pathname === PROTOTYPE_REVIEW_PATH ? {
          prototype_review: {
            rate_limit_configured: Boolean(env.PROTOTYPE_REVIEW_RATE_LIMIT_SALT),
            forwarding_configured: Boolean(env.PROTOTYPE_REVIEW_FORWARD_WEBHOOK_URL),
            max_body_bytes: MAX_BODY_BYTES
          }
        } : {}),
        timestamp: new Date().toISOString()
      }, {
        origin: allowOrigin
      });
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "method_not_allowed" }, {
        status: 405,
        origin: allowOrigin
      });
    }

    if (url.pathname === CONVERSION_RECEIPT_PATH) {
      return handleConversionReceipt(request, env);
    }

    if (url.pathname === PROTOTYPE_REVIEW_PATH) {
      return handlePrototypeReview(request, env);
    }

    if (url.pathname !== "/") {
      return json({ ok: false, error: "not_found" }, {
        status: 404,
        origin: allowOrigin
      });
    }

    return handleRoiLead(request, env);
  }
};
