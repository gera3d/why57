const ALLOWED_ORIGINS = new Set([
  "https://roi.why57.com",
  "https://why57.com"
]);

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 180;
const COMPLETED_OUTCOME_EVENTS = new Set([
  "prototype_review_submitted",
  "lead_submitted",
  "roi_report_requested",
  "calendar_booking_completed"
]);

function corsHeaders(origin = "*") {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json; charset=utf-8"
  };
}

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...corsHeaders(init.headers?.["Access-Control-Allow-Origin"]),
      ...(init.headers || {})
    }
  });
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== "" && item !== null && item !== undefined)
  );
}

function normalizePayload(payload = {}, request) {
  const context = payload?.context || {};
  const detail = payload?.detail || {};
  const now = new Date().toISOString();

  return compactObject({
    id: crypto.randomUUID(),
    received_at: now,
    sent_at: payload?.sent_at || now,
    event_type: payload?.event_type || "unclassified_event",
    site_source: detail.site_source || context.site_source || null,
    page_url: detail.page_url || null,
    referrer: detail.referrer || null,
    session_id: context.session_id || null,
    recommendation: context.recommendation || null,
    readiness_score: Number.isFinite(Number(context.readiness_score))
      ? Number(context.readiness_score)
      : null,
    break_even_months: Number.isFinite(Number(context.break_even_months))
      ? Number(context.break_even_months)
      : null,
    project_type: context.project_type || null,
    build_estimate_mid: Number.isFinite(Number(context.build_estimate_mid))
      ? Number(context.build_estimate_mid)
      : null,
    utm_source: context.utm_source || null,
    utm_medium: context.utm_medium || null,
    utm_campaign: context.utm_campaign || null,
    cta_location: detail.cta_location || null,
    offer: detail.offer || null,
    page_path: detail.page_path || null,
    conversion_stage: detail.conversion_stage || null,
    first_touch_source: detail.first_touch?.source || null,
    first_touch_medium: detail.first_touch?.medium || null,
    first_touch_campaign: detail.first_touch?.utm_campaign || null,
    origin: request.headers.get("origin") || null,
    raw: payload
  });
}

async function persistEvent(env, normalized) {
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

async function forwardEvent(env, normalized) {
  if (!env.ROI_FORWARD_WEBHOOK_URL) return { forwarded: false };

  const headers = {
    "Content-Type": "application/json"
  };

  if (env.ROI_FORWARD_WEBHOOK_SECRET) {
    headers["X-ROI-Webhook-Secret"] = env.ROI_FORWARD_WEBHOOK_SECRET;
  }

  const response = await fetch(env.ROI_FORWARD_WEBHOOK_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(normalized)
  });

  return {
    forwarded: response.ok,
    status: response.status
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("origin") || "";
    const originAllowed = !origin || ALLOWED_ORIGINS.has(origin);
    const allowOrigin = originAllowed ? origin || "*" : "https://why57.com";

    if (request.method === "OPTIONS") {
      if (!originAllowed) {
        return json({ ok: false, error: "forbidden_origin" }, {
          status: 403,
          headers: corsHeaders("https://why57.com")
        });
      }

      return new Response(null, {
        status: 204,
        headers: corsHeaders(allowOrigin)
      });
    }

    const url = new URL(request.url);

    if (request.method === "GET") {
      return json({
        ok: true,
        service: "why57-roi-intake",
        path: url.pathname,
        has_storage: Boolean(env.ROI_LEADS),
        timestamp: new Date().toISOString()
      }, {
        status: 200,
        headers: corsHeaders(allowOrigin)
      });
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "method_not_allowed" }, {
        status: 405,
        headers: corsHeaders(allowOrigin)
      });
    }

    if (!originAllowed) {
      return json({ ok: false, error: "forbidden_origin" }, {
        status: 403,
        headers: corsHeaders("https://why57.com")
      });
    }

    let payload;
    try {
      payload = await request.json();
    } catch (_error) {
      return json({ ok: false, error: "invalid_json" }, {
        status: 400,
        headers: corsHeaders(allowOrigin)
      });
    }

    try {
      const normalized = normalizePayload(payload, request);
      const storage = await persistEvent(env, normalized);
      const forwarding = await forwardEvent(env, normalized);

      return json({
        ok: true,
        id: normalized.id,
        stored: storage.stored,
        forwarded: forwarding.forwarded
      }, {
        status: 200,
        headers: corsHeaders(allowOrigin)
      });
    } catch (error) {
      return json({
        ok: false,
        error: "storage_failed",
        message: error instanceof Error ? error.message : "unknown_error"
      }, {
        status: 500,
        headers: corsHeaders(allowOrigin)
      });
    }
  }
};
