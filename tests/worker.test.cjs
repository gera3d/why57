const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const workerSource = fs.readFileSync(
  path.join(__dirname, "..", "cloudflare", "why57-roi-intake", "worker.js"),
  "utf8"
);

async function loadWorker() {
  return import(`data:text/javascript;base64,${Buffer.from(workerSource).toString("base64")}`);
}

function createKv() {
  const values = new Map();
  const writes = [];
  return {
    values,
    writes,
    async get(key) {
      return values.get(key) || null;
    },
    async put(key, value) {
      values.set(key, value);
      writes.push([key, value]);
    }
  };
}

function jsonRequest(pathname, payload, origin = "https://why57.com") {
  const headers = { "Content-Type": "application/json" };
  if (origin) headers.Origin = origin;
  return new Request(`https://why57-roi-intake.example${pathname}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
}

function validPrototypePayload(overrides = {}) {
  return {
    name: "QA Person",
    email: "qa@example.com",
    prototype_description: "A prototype that helps a team review a workflow safely.",
    tool: "claude",
    current_users: "just_me",
    blocker: "It needs a secure production review.",
    target_date: "one_to_three_months",
    consent: true,
    form_started_at: Date.now() - 5000,
    ...overrides
  };
}

test("ROI intake rejects requests without first-party browser context", async () => {
  const worker = await loadWorker();
  const response = await worker.default.fetch(jsonRequest("/", {
    event_type: "calendar_booking_clicked"
  }, ""), { ROI_LEADS: createKv() });

  assert.equal(response.status, 403);
  assert.equal((await response.json()).error, "forbidden_origin");
});

test("ROI intake rejects unsupported events before writing storage", async () => {
  const worker = await loadWorker();
  const kv = createKv();
  const response = await worker.default.fetch(jsonRequest("/", {
    event_type: "generate_lead",
    context: { session_id: "qa-session" }
  }), { ROI_LEADS: kv });

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "unsupported_event");
  assert.equal(kv.writes.length, 0);
});

test("ROI report does not claim success when delivery is not configured", async () => {
  const worker = await loadWorker();
  const kv = createKv();
  const response = await worker.default.fetch(jsonRequest("/", {
    event_type: "roi_report_requested",
    context: { session_id: "qa-session" },
    detail: {
      request_id: "qa-report",
      email: "qa@example.com",
      consent: true,
      consent_version: "roi-report-v1-2026-07-15",
      form_elapsed_ms: 2000,
      result_summary: "QA result"
    }
  }), { ROI_LEADS: kv });

  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, "delivery_not_configured");
  assert.equal(kv.writes.length, 0);
});

test("valid ROI reports are stored as completed outcomes and forwarded", async () => {
  const worker = await loadWorker();
  const kv = createKv();
  const forwarded = [];
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    forwarded.push([url, options]);
    return new Response(null, { status: 204 });
  };

  try {
    const response = await worker.default.fetch(jsonRequest("/", {
      event_type: "roi_report_requested",
      context: {
        session_id: "qa-session",
        first_touch_source: "partner",
        first_touch_medium: "referral"
      },
      detail: {
        request_id: "qa-report",
        email: "QA@Example.com",
        consent: true,
        consent_version: "roi-report-v1-2026-07-15",
        form_elapsed_ms: 2000,
        result_summary: "QA result",
        recommended_plan: { title: "Start focused" }
      }
    }), {
      ROI_LEADS: kv,
      ROI_REPORT_WEBHOOK_URL: "https://example.com/report",
      ROI_REPORT_WEBHOOK_SECRET: "test-secret"
    });

    assert.equal(response.status, 200);
    assert.equal(forwarded.length, 1);
    assert.equal(forwarded[0][0], "https://example.com/report");
    assert.equal(forwarded[0][1].headers["X-ROI-Webhook-Secret"], "test-secret");

    const leadWrite = kv.writes.find(([key]) => key.startsWith("lead:"));
    assert.ok(leadWrite);
    const stored = JSON.parse(leadWrite[1]);
    assert.equal(stored.email, "qa@example.com");
    assert.equal(stored.first_touch_source, "partner");
    assert.equal(stored.first_touch_medium, "referral");
  } finally {
    global.fetch = originalFetch;
  }
});

test("ROI report does not claim success when delivery rejects the request", async () => {
  const worker = await loadWorker();
  const kv = createKv();
  const originalFetch = global.fetch;
  let deliveryAttempts = 0;
  global.fetch = async () => {
    deliveryAttempts += 1;
    return new Response(null, { status: 500 });
  };

  try {
    const response = await worker.default.fetch(jsonRequest("/", {
      event_type: "roi_report_requested",
      context: { session_id: "qa-session" },
      detail: {
        request_id: "qa-report",
        email: "qa@example.com",
        consent: true,
        consent_version: "roi-report-v1-2026-07-15",
        form_elapsed_ms: 2000,
        result_summary: "QA result"
      }
    }), {
      ROI_LEADS: kv,
      ROI_REPORT_WEBHOOK_URL: "https://example.com/report"
    });

    assert.equal(response.status, 502);
    assert.equal((await response.json()).error, "delivery_failed");
    assert.equal(deliveryAttempts, 1);
    assert.ok(kv.writes.some(([key]) => key.startsWith("lead:")));
  } finally {
    global.fetch = originalFetch;
  }
});

test("prototype review validates fields and stores a valid request", async () => {
  const worker = await loadWorker();
  const invalidResponse = await worker.default.fetch(jsonRequest("/prototype-review", {
    name: "Q",
    email: "not-an-email"
  }), { ROI_LEADS: createKv() });
  assert.equal(invalidResponse.status, 422);

  const kv = createKv();
  const forwarded = [];
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    forwarded.push([url, options]);
    return new Response(null, { status: 204 });
  };

  try {
    const validResponse = await worker.default.fetch(
      jsonRequest("/prototype-review", validPrototypePayload()),
      {
        ROI_LEADS: kv,
        PROTOTYPE_REVIEW_FORWARD_WEBHOOK_URL: "https://example.com/prototype-review"
      }
    );

    assert.equal(validResponse.status, 200);
    assert.equal(forwarded.length, 1);
    assert.ok(kv.writes.some(([key]) => key.startsWith("prototype_review:")));
    const body = await validResponse.json();
    assert.equal(body.ok, true);
    assert.equal(body.stored, true);
    assert.equal(body.forwarded, true);
  } finally {
    global.fetch = originalFetch;
  }
});

test("prototype review does not claim success when delivery is not configured", async () => {
  const worker = await loadWorker();
  const kv = createKv();
  const response = await worker.default.fetch(
    jsonRequest("/prototype-review", validPrototypePayload()),
    { ROI_LEADS: kv }
  );

  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, "delivery_not_configured");
  assert.equal(kv.writes.length, 0);
});

test("prototype review does not claim success when delivery rejects the request", async () => {
  const worker = await loadWorker();
  const kv = createKv();
  const originalFetch = global.fetch;
  let deliveryAttempts = 0;
  global.fetch = async () => {
    deliveryAttempts += 1;
    return new Response(null, { status: 500 });
  };

  try {
    const response = await worker.default.fetch(
      jsonRequest("/prototype-review", validPrototypePayload()),
      {
        ROI_LEADS: kv,
        PROTOTYPE_REVIEW_FORWARD_WEBHOOK_URL: "https://example.com/prototype-review"
      }
    );

    assert.equal(response.status, 502);
    assert.equal((await response.json()).error, "delivery_failed");
    assert.equal(deliveryAttempts, 1);
    assert.ok(kv.writes.some(([key]) => key.startsWith("prototype_review:")));
  } finally {
    global.fetch = originalFetch;
  }
});
