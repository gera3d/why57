(() => {
  const COOKIE_NAME = "why57_roi_context";
  const BOOKING_URL = "https://calendar.app.google/93NLV73sQd1DXuUB6";
  const LEAD_CAPTURE_ENDPOINT = "https://why57-roi-intake.gera-695.workers.dev/";
  const RECOMMENDATION_LABELS = {
    stay: "Stay with SaaS for now",
    hybrid: "Hybrid approach",
    custom: "Custom software"
  };
  const PROJECT_TYPE_LABELS = {
    workflow_automation: "workflow automation",
    internal_ops_tool: "internal operations tooling",
    custom_crm: "a custom CRM",
    customer_portal: "a customer portal",
    reporting_dashboard: "a reporting dashboard"
  };

  function readCookie(name) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? match[1] : null;
  }

  function parseContext() {
    const encoded = readCookie(COOKIE_NAME);
    if (!encoded) return null;

    try {
      return JSON.parse(decodeURIComponent(encoded));
    } catch (_error) {
      return null;
    }
  }

  function titleCase(value) {
    return String(value || "")
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function recommendationLabel(value) {
    return RECOMMENDATION_LABELS[value] || titleCase(value || "custom software");
  }

  function projectTypeLabel(value) {
    return PROJECT_TYPE_LABELS[value] || titleCase(value || "workflow automation");
  }

  function hasMeaningfulContext(context) {
    if (!context || typeof context !== "object") return false;

    return Boolean(
      context.recommendation ||
      context.project_type ||
      Number.isFinite(Number(context.readiness_score)) ||
      Number.isFinite(Number(context.break_even_months))
    );
  }

  function pushEvent(eventName, detail = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...detail
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, detail);
    }
  }

  function compactObject(value) {
    return Object.fromEntries(
      Object.entries(value).filter(([, item]) => item !== "" && item !== null && item !== undefined)
    );
  }

  function sendLeadCapture(eventType, context, detail = {}) {
    if (!LEAD_CAPTURE_ENDPOINT || !context) return;

    const payload = {
      event_type: eventType,
      sent_at: new Date().toISOString(),
      context,
      detail: compactObject({
        site_source: "why57.com",
        page_url: window.location.href,
        referrer: document.referrer || "",
        ...detail
      })
    };

    const body = JSON.stringify(payload);

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(LEAD_CAPTURE_ENDPOINT, blob);
        return;
      }
    } catch (_error) {
      // Fall back to fetch if sendBeacon is blocked.
    }

    fetch(LEAD_CAPTURE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body,
      keepalive: true,
      mode: "cors",
      credentials: "omit"
    }).catch(() => {
      // Best-effort only. Booking should never fail because analytics is down.
    });
  }

  function annotateBookingLinks(context) {
    document.querySelectorAll(`a[href="${BOOKING_URL}"]`).forEach((link) => {
      if (!context) return;

      link.dataset.roiSessionId = context.session_id || "";
      link.dataset.roiRecommendation = context.recommendation || "";
      link.dataset.roiScore = String(context.readiness_score || "");
      link.dataset.roiProjectType = context.project_type || "";
      link.dataset.roiBreakEvenMonths = String(context.break_even_months || "");
    });
  }

  function bindBookingTracking(context) {
    document.querySelectorAll(`a[href="${BOOKING_URL}"]`).forEach((link) => {
      link.addEventListener("click", () => {
        const detail = {
          cta_location: link.id || link.dataset.ctaLocation || "booking_link",
          recommendation: context?.recommendation || "",
          readiness_score: context?.readiness_score || 0,
          break_even_months: context?.break_even_months || 0,
          project_type: context?.project_type || "",
          session_id: context?.session_id || ""
        };

        pushEvent("main_site_booking_clicked", detail);
        sendLeadCapture("main_site_booking_clicked", context, {
          cta_location: detail.cta_location
        });
      });
    });
  }

  function bindCalculatorTracking() {
    document.querySelectorAll("[data-roi-link]").forEach((link) => {
      link.addEventListener("click", () => {
        pushEvent("roi_calculator_clicked", {
          cta_location: link.dataset.roiLink || "main_site"
        });
      });
    });
  }

  function renderContext(context) {
    if (!hasMeaningfulContext(context)) return;

    const label = document.getElementById("roiBridgeLabel");
    const title = document.getElementById("roiBridgeTitle");
    const copy = document.getElementById("roiBridgeCopy");
    const metrics = document.getElementById("roiBridgeMetrics");
    const recommendation = document.getElementById("roiMetricRecommendation");
    const score = document.getElementById("roiMetricScore");
    const breakEven = document.getElementById("roiMetricBreakEven");

    if (label) label.textContent = "From Your ROI Calculator";
    if (title) title.textContent = "You already have the numbers. Let's turn them into a build plan.";
    if (copy) {
      const rec = recommendationLabel(context.recommendation);
      const months = context.break_even_months ? `${context.break_even_months} months` : "a practical payback window";
      const projectType = projectTypeLabel(context.project_type);
      copy.textContent = `Your latest calculator result points to ${rec.toLowerCase()} for ${projectType}, with an estimated break-even timeline of ${months}. Bring that context into the call and we can pressure-test the scope together.`;
    }
    if (recommendation) recommendation.textContent = recommendationLabel(context.recommendation || "hybrid");
    if (score) score.textContent = context.readiness_score != null ? String(context.readiness_score) : "Not available";
    if (breakEven) {
      breakEven.textContent = context.break_even_months
        ? `${context.break_even_months} months`
        : "Not available";
    }
    if (metrics) metrics.hidden = false;
  }

  const context = parseContext();
  if (context) {
    window.__why57RoiContext = context;
    pushEvent("roi_context_loaded", {
      session_id: context.session_id,
      recommendation: context.recommendation,
      readiness_score: context.readiness_score,
      break_even_months: context.break_even_months,
      project_type: context.project_type
    });
  }

  renderContext(context);
  annotateBookingLinks(context);
  bindBookingTracking(context);
  bindCalculatorTracking();
})();
