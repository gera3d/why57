const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { createD1 } = require("./helpers.cjs");
const REQUEST_ID_PATTERN_FOR_TEST = /^[A-Za-z0-9_-]{8,120}$/;

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
    request_id: "qa-prototype-0001",
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

function reportPayload(overrides = {}) {
  return {
    event_type: "roi_report_requested",
    context: { session_id: "qa-session" },
    detail: {
      request_id: "qa-report-0001",
      email: "qa@example.com",
      consent: true,
      consent_version: "roi-report-v1-2026-07-15",
      form_elapsed_ms: 2000,
      result_summary: "QA result",
      ...overrides
    }
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
  const response = await worker.default.fetch(jsonRequest("/", reportPayload()), {
    INTAKE_DB: createD1(),
    ROI_LEADS: kv
  });

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
      ...reportPayload(),
      context: {
        session_id: "qa-session",
        first_touch_source: "partner",
        first_touch_medium: "referral"
      },
      detail: {
        ...reportPayload().detail,
        email: "QA@Example.com",
        recommended_plan: { title: "Start focused" }
      }
    }), {
      INTAKE_DB: createD1(),
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
    const response = await worker.default.fetch(jsonRequest("/", reportPayload()), {
      INTAKE_DB: createD1(),
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
        INTAKE_DB: createD1(),
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
    { INTAKE_DB: createD1(), ROI_LEADS: kv }
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
        INTAKE_DB: createD1(),
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

test("ROI retries return the prior delivered outcome without a second write or forward", async () => {
  const worker = await loadWorker();
  const kv = createKv();
  const d1 = createD1();
  const env = {
    INTAKE_DB: d1,
    ROI_LEADS: kv,
    ROI_REPORT_WEBHOOK_URL: "https://example.com/report"
  };
  const originalFetch = global.fetch;
  let deliveryAttempts = 0;
  global.fetch = async () => {
    deliveryAttempts += 1;
    return new Response(null, { status: 204 });
  };

  try {
    const firstPayload = reportPayload({ form_elapsed_ms: 2000 });
    firstPayload.sent_at = "2026-07-16T20:00:00.000Z";
    const retryPayload = reportPayload({ form_elapsed_ms: 9200 });
    retryPayload.sent_at = "2026-07-16T20:00:07.200Z";

    const first = await worker.default.fetch(jsonRequest("/", firstPayload), env);
    const second = await worker.default.fetch(jsonRequest("/", retryPayload), env);
    const firstBody = await first.json();
    const secondBody = await second.json();

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(deliveryAttempts, 1);
    assert.equal(kv.writes.filter(([key]) => key.startsWith("lead:")).length, 1);
    assert.equal(secondBody.replayed, true);
    assert.equal(secondBody.id, firstBody.id);
    assert.equal(secondBody.receipt, firstBody.receipt);
    assert.equal(secondBody.request_id, "qa-report-0001");
  } finally {
    global.fetch = originalFetch;
  }
});

test("prototype retries and downstream failures are terminal for one request ID", async () => {
  const worker = await loadWorker();
  const kv = createKv();
  const d1 = createD1();
  const env = {
    INTAKE_DB: d1,
    ROI_LEADS: kv,
    PROTOTYPE_REVIEW_FORWARD_WEBHOOK_URL: "https://example.com/prototype-review"
  };
  const originalFetch = global.fetch;
  let deliveryAttempts = 0;
  global.fetch = async () => {
    deliveryAttempts += 1;
    return new Response(null, { status: 500 });
  };

  try {
    const first = await worker.default.fetch(jsonRequest("/prototype-review", validPrototypePayload()), env);
    const second = await worker.default.fetch(jsonRequest("/prototype-review", validPrototypePayload()), env);
    assert.equal(first.status, 502);
    assert.equal(second.status, 502);
    assert.equal((await second.json()).error, "delivery_failed");
    assert.equal(deliveryAttempts, 1);
    assert.equal(kv.writes.filter(([key]) => key.startsWith("prototype_review:")).length, 1);
  } finally {
    global.fetch = originalFetch;
  }
});

test("a reused request ID with different payload is rejected", async () => {
  const worker = await loadWorker();
  const kv = createKv();
  const d1 = createD1();
  const env = {
    INTAKE_DB: d1,
    ROI_LEADS: kv,
    ROI_REPORT_WEBHOOK_URL: "https://example.com/report"
  };
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(null, { status: 204 });

  try {
    assert.equal((await worker.default.fetch(jsonRequest("/", reportPayload()), env)).status, 200);
    const conflict = await worker.default.fetch(jsonRequest("/", reportPayload({ email: "other@example.com" })), env);
    assert.equal(conflict.status, 409);
    assert.equal((await conflict.json()).error, "idempotency_conflict");
  } finally {
    global.fetch = originalFetch;
  }
});

test("prototype honeypots are filtered without storage, delivery, receipt, or conversion eligibility", async () => {
  const worker = await loadWorker();
  const kv = createKv();
  const d1 = createD1();
  let deliveryAttempts = 0;
  const originalFetch = global.fetch;
  global.fetch = async () => {
    deliveryAttempts += 1;
    return new Response(null, { status: 204 });
  };

  try {
    const response = await worker.default.fetch(
      jsonRequest("/prototype-review", validPrototypePayload({ website: "bot.example" })),
      {
        INTAKE_DB: d1,
        ROI_LEADS: kv,
        PROTOTYPE_REVIEW_FORWARD_WEBHOOK_URL: "https://example.com/prototype-review"
      }
    );
    const body = await response.json();
    assert.equal(response.status, 202);
    assert.equal(body.filtered, true);
    assert.equal(body.stored, false);
    assert.equal(body.forwarded, false);
    assert.equal(body.receipt, undefined);
    assert.equal(deliveryAttempts, 0);
    assert.equal(kv.writes.length, 0);
    assert.equal(d1.database.prepare("SELECT COUNT(*) AS count FROM intake_requests").get().count, 0);
  } finally {
    global.fetch = originalFetch;
  }
});

test("conversion receipts are server-authoritative and consumable exactly once", async () => {
  const worker = await loadWorker();
  const kv = createKv();
  const d1 = createD1();
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(null, { status: 204 });

  try {
    const delivered = await worker.default.fetch(
      jsonRequest("/prototype-review", validPrototypePayload()),
      {
        INTAKE_DB: d1,
        ROI_LEADS: kv,
        PROTOTYPE_REVIEW_FORWARD_WEBHOOK_URL: "https://example.com/prototype-review"
      }
    );
    const deliveredBody = await delivered.json();
    const firstClaim = await worker.default.fetch(
      jsonRequest("/conversion-receipt", { receipt: deliveredBody.receipt }),
      { INTAKE_DB: d1 }
    );
    const secondClaim = await worker.default.fetch(
      jsonRequest("/conversion-receipt", { receipt: deliveredBody.receipt }),
      { INTAKE_DB: d1 }
    );
    const forgedClaim = await worker.default.fetch(
      jsonRequest("/conversion-receipt", { receipt: "f".repeat(64) }),
      { INTAKE_DB: d1 }
    );

    assert.equal(firstClaim.status, 200);
    assert.equal((await firstClaim.json()).claimed, true);
    assert.equal(secondClaim.status, 200);
    assert.equal((await secondClaim.json()).claimed, false);
    assert.equal(forgedClaim.status, 404);
    assert.equal((await forgedClaim.json()).error, "invalid_receipt");
  } finally {
    global.fetch = originalFetch;
  }
});

test("the hosted no-JS form issues a request ID and redirects only with a delivered receipt", async () => {
  const worker = await loadWorker();
  const formResponse = await worker.default.fetch(
    new Request("https://why57-roi-intake.example/prototype-review/form"),
    {}
  );
  const html = await formResponse.text();
  const requestId = html.match(/name="request_id" value="([^"]+)"/)?.[1];
  assert.equal(formResponse.status, 200);
  assert.match(requestId, REQUEST_ID_PATTERN_FOR_TEST);
  assert.match(html, /name="consent"[^>]+required/);
  assert.match(html, /name="blocker"[^>]+required/);

  const formBody = new URLSearchParams(validPrototypePayload({ request_id: requestId, consent: "yes" }));
  const request = new Request("https://why57-roi-intake.example/prototype-review", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: "https://why57-roi-intake.example/prototype-review/form"
    },
    body: formBody
  });
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(null, { status: 204 });
  try {
    const response = await worker.default.fetch(request, {
      INTAKE_DB: createD1(),
      ROI_LEADS: createKv(),
      PROTOTYPE_REVIEW_FORWARD_WEBHOOK_URL: "https://example.com/prototype-review"
    });
    assert.equal(response.status, 303);
    assert.match(response.headers.get("location"), /prototype-review-thank-you\.html\?receipt=[a-f0-9]{64}$/);
    assert.doesNotMatch(response.headers.get("location"), /submission=/);
  } finally {
    global.fetch = originalFetch;
  }
});
