const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const repositoryRoot = path.resolve(__dirname, "..");
const analyticsSource = fs.readFileSync(path.join(repositoryRoot, "analytics.js"), "utf8");
const workerSource = fs.readFileSync(
  path.join(repositoryRoot, "cloudflare", "why57-roi-intake", "worker.js"),
  "utf8"
);

function createRuntime({
  url = "https://why57.com/",
  referrer = "",
  cookie = "",
  storedFirstTouch = ""
} = {}) {
  const documentListeners = new Map();
  const dispatchedEvents = [];
  const appendedScripts = [];
  const cookieWrites = [];
  const storage = new Map();
  let cookieValue = cookie;

  if (storedFirstTouch) storage.set("why57_first_touch", storedFirstTouch);

  const document = {
    body: { dataset: {} },
    createElement() {
      return {};
    },
    dispatchEvent(event) {
      dispatchedEvents.push(event);
      const listener = documentListeners.get(event.type);
      if (listener) listener(event);
      return true;
    },
    head: {
      appendChild(script) {
        appendedScripts.push(script);
      }
    },
    readyState: "loading",
    referrer,
    title: "Why57 test page",
    addEventListener(name, listener) {
      documentListeners.set(name, listener);
    }
  };

  Object.defineProperty(document, "cookie", {
    get() {
      return cookieValue;
    },
    set(value) {
      cookieWrites.push(value);
      cookieValue = value.split(";", 1)[0];
    }
  });

  const window = {
    dataLayer: [],
    history: {
      state: null,
      replaceState(state, _title, nextUrl) {
        this.state = state;
        window.location = new URL(nextUrl, window.location.href);
      }
    },
    localStorage: {
      getItem(key) {
        return storage.get(key) || null;
      },
      setItem(key, value) {
        storage.set(key, value);
      }
    },
    location: new URL(url)
  };

  class CustomEvent {
    constructor(type, init = {}) {
      this.type = type;
      this.detail = init.detail;
    }
  }

  const context = vm.createContext({
    console,
    CustomEvent,
    document,
    Object,
    URL,
    window
  });

  vm.runInContext(analyticsSource, context, { filename: "analytics.js" });

  return {
    appendedScripts,
    cookieWrites,
    dispatchedEvents,
    documentListeners,
    storage,
    window
  };
}

function publicContentFiles() {
  const rootHtml = fs.readdirSync(repositoryRoot)
    .filter((name) => name.endsWith(".html") && name !== "dashboard.html")
    .map((name) => path.join(repositoryRoot, name));
  const caseStudyDirectory = path.join(repositoryRoot, "case-studies");
  const caseStudies = fs.readdirSync(caseStudyDirectory)
    .filter((name) => name.endsWith(".html"))
    .map((name) => path.join(caseStudyDirectory, name));

  return [...rootHtml, ...caseStudies];
}

test("legacy internal campaign parameters are removed without removing unrelated parameters", () => {
  const runtime = createRuntime({
    url: "https://why57.com/?utm_source=why57&utm_medium=site_nav&utm_campaign=main_site_referral&keep=1",
    referrer: "https://roi.why57.com/results"
  });

  assert.equal(runtime.window.location.search, "?keep=1");
  assert.equal(runtime.window.why57Analytics.strippedLegacyCampaign, true);
  assert.equal(runtime.window.why57Analytics.firstTouch.source, "(direct)");
});

test("legitimate external campaign parameters are preserved as first touch", () => {
  const runtime = createRuntime({
    url: "https://why57.com/?utm_source=partner&utm_medium=referral&utm_campaign=summer&gclid=external-click"
  });

  assert.match(runtime.window.location.search, /utm_source=partner/);
  assert.equal(runtime.window.why57Analytics.strippedLegacyCampaign, false);
  assert.equal(runtime.window.why57Analytics.firstTouch.utm_source, "partner");
  assert.equal(runtime.window.why57Analytics.firstTouch.utm_campaign, "summer");
  assert.equal(runtime.window.why57Analytics.firstTouch.gclid, "external-click");
  assert.match(runtime.cookieWrites[0], /Domain=\.why57\.com/);
});

test("an existing first-touch record is not overwritten", () => {
  const original = encodeURIComponent(JSON.stringify({
    captured_at: "2026-01-01T00:00:00.000Z",
    source: "original_source",
    medium: "referral",
    landing_page: "/original"
  }));
  const runtime = createRuntime({
    url: "https://why57.com/?utm_source=new_source&utm_medium=cpc&utm_campaign=new_campaign",
    cookie: `why57_first_touch=${original}`
  });

  assert.equal(runtime.window.why57Analytics.firstTouch.source, "original_source");
  assert.equal(runtime.cookieWrites.length, 0);
});

test("calendar clicks fire one micro-conversion with CTA, page, and offer context", () => {
  const runtime = createRuntime();
  runtime.documentListeners.get("DOMContentLoaded")();

  const link = {
    dataset: { ctaLocation: "prototype_hero", offer: "prototype_review" },
    href: "https://calendar.app.google/booking-id",
    id: "",
    textContent: "Show Me What You Built",
    closest(selector) {
      return selector === "a[href]" ? this : null;
    }
  };
  runtime.documentListeners.get("click")({ target: link });

  const eventCommands = runtime.window.dataLayer.filter((command) => command[0] === "event");
  assert.equal(eventCommands.length, 1);
  assert.equal(eventCommands[0][1], "calendar_booking_clicked");
  assert.equal(eventCommands[0][2].conversion_stage, "micro");
  assert.equal(eventCommands[0][2].cta_location, "prototype_hero");
  assert.equal(eventCommands[0][2].offer, "prototype_review");
  assert.equal(eventCommands[0][2].page_type, "home");
});

test("tracked content pages use the shared entry point and contain no legacy internal ROI campaign", () => {
  for (const file of publicContentFiles()) {
    const html = fs.readFileSync(file, "utf8");
    const relativeFile = path.relative(repositoryRoot, file);
    const expectedSource = relativeFile.startsWith("case-studies/") ? "../analytics.js" : "analytics.js";
    const scriptMatches = html.match(/<script src="(?:\.\.\/)?analytics\.js"><\/script>/g) || [];

    assert.equal(scriptMatches.length, 1, `${relativeFile} should load analytics.js exactly once`);
    assert.match(html, new RegExp(`<script src="${expectedSource.replace(".", "\\.")}"></script>`));
    assert.doesNotMatch(html, /utm_source=why57|utm_medium=site_nav|utm_campaign=main_site_referral/);
  }
});

test("the no-JS prototype thank-you path uses only the shared GA4 bootstrap", () => {
  const html = fs.readFileSync(path.join(repositoryRoot, "prototype-review-thank-you.html"), "utf8");

  assert.equal((html.match(/<script src="analytics\.js"><\/script>/g) || []).length, 1);
  assert.doesNotMatch(html, /googletagmanager\.com\/gtag\/js/);
  assert.doesNotMatch(html, /gtag\(['"]config['"]/);
  assert.match(html, /gtag\(['"]event['"], ['"]prototype_review_submitted['"]/);
});

test("the ROI context worker stores clicks as events and completed outcomes as leads", async () => {
  const workerModule = await import(`data:text/javascript;base64,${Buffer.from(workerSource).toString("base64")}`);

  async function storedKeyFor(eventType) {
    const writes = [];
    const request = new Request("https://why57-roi-intake.example/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://why57.com"
      },
      body: JSON.stringify({
        event_type: eventType,
        context: { session_id: "qa-session" },
        detail: eventType === "roi_report_requested" ? {
          conversion_stage: "complete",
          request_id: "qa-request",
          email: "qa@example.com",
          consent: true,
          consent_version: "roi-report-v1-2026-07-15",
          form_elapsed_ms: 2000,
          result_summary: "QA summary"
        } : { conversion_stage: "micro" }
      })
    });
    const env = {
      ROI_REPORT_RATE_LIMIT_SALT: "qa-rate-limit-salt",
      ROI_REPORT_WEBHOOK_URL: "https://example.com/report",
      ROI_LEADS: {
        async get() {
          return null;
        },
        async put(...args) {
          writes.push(args);
        }
      },
      async fetch() {}
    };

    const originalFetch = global.fetch;
    global.fetch = async () => new Response(null, { status: 200 });

    try {
      const response = await workerModule.default.fetch(request, env);
      assert.equal(response.status, 200);
      return writes.map(([key]) => key).find((key) => !key.startsWith("latest:") && !key.startsWith("rate:"));
    } finally {
      global.fetch = originalFetch;
    }
  }

  assert.match(await storedKeyFor("calendar_booking_clicked"), /^event:/);
  assert.match(await storedKeyFor("roi_report_requested"), /^lead:/);
});
