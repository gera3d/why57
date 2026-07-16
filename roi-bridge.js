(() => {
  const COOKIE_NAME = "why57_roi_context";
  const BOOKING_URL = "https://calendar.app.google/93NLV73sQd1DXuUB6";
  const ROI_CONTEXT_ENDPOINT = "https://why57-roi-intake.gera-695.workers.dev/";
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
  const LEGACY_INTERNAL_MEDIA = new Set([
    "site_nav",
    "footer_link",
    "section_cta",
    "mobile_sticky",
    "intake_primary"
  ]);

  function readCookie(name) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? match[1] : null;
  }

  function parseContext() {
    const encoded = readCookie(COOKIE_NAME);
    if (!encoded) return null;

    try {
      const context = JSON.parse(decodeURIComponent(encoded));
      const source = String(context?.utm_source || "").toLowerCase();
      const medium = String(context?.utm_medium || "").toLowerCase();
      const campaign = String(context?.utm_campaign || "").toLowerCase();
      const legacyInternalAttribution = ["why57", "why57.com", "www.why57.com"].includes(source) && (
        campaign === "main_site_referral" || LEGACY_INTERNAL_MEDIA.has(medium)
      );

      if (!legacyInternalAttribution) return context;

      const sanitized = { ...context };
      delete sanitized.utm_source;
      delete sanitized.utm_medium;
      delete sanitized.utm_campaign;
      return sanitized;
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

  function compactObject(value) {
    return Object.fromEntries(
      Object.entries(value).filter(([, item]) => item !== "" && item !== null && item !== undefined)
    );
  }

  function sendRoiContextEvent(eventType, context, detail = {}) {
    if (!ROI_CONTEXT_ENDPOINT || !context) return;

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
        navigator.sendBeacon(ROI_CONTEXT_ENDPOINT, blob);
        return;
      }
    } catch (_error) {
      // Fall back to fetch if sendBeacon is blocked.
    }

    fetch(ROI_CONTEXT_ENDPOINT, {
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

  function bindAnalyticsContextForwarding(context) {
    document.addEventListener("why57:analytics", (event) => {
      const eventName = event.detail?.eventName;
      const parameters = event.detail?.parameters || {};
      if (eventName !== "calendar_booking_clicked") return;

      sendRoiContextEvent(eventName, context, {
        cta_location: parameters.cta_location,
        offer: parameters.offer,
        page_path: parameters.page_path,
        conversion_stage: "micro",
        first_touch: window.why57Analytics?.firstTouch
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
    window.why57Analytics?.track("roi_context_loaded", {
      session_id: context.session_id,
      recommendation: context.recommendation,
      readiness_score: context.readiness_score,
      break_even_months: context.break_even_months,
      project_type: context.project_type
    });
  }

  renderContext(context);
  annotateBookingLinks(context);
  bindAnalyticsContextForwarding(context);
})();
