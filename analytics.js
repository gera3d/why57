(() => {
  "use strict";

  const MEASUREMENT_ID = "G-358H0FHG50";
  const FIRST_TOUCH_KEY = "why57_first_touch";
  const FIRST_TOUCH_MAX_AGE_SECONDS = 60 * 60 * 24 * 730;
  const LINKED_DOMAINS = ["why57.com", "roi.why57.com"];
  const INTERNAL_HOSTS = new Set(["why57.com", "www.why57.com", "roi.why57.com"]);
  const LEGACY_INTERNAL_SOURCES = new Set(["why57", "why57.com", "www.why57.com", "roi.why57.com"]);
  const LEGACY_INTERNAL_MEDIA = new Set([
    "site_nav",
    "footer_link",
    "section_cta",
    "mobile_sticky",
    "intake_primary"
  ]);
  const CAMPAIGN_PARAMETERS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_id",
    "utm_source_platform",
    "utm_term",
    "utm_content",
    "gclid",
    "dclid",
    "gbraid",
    "wbraid",
    "msclkid",
    "fbclid"
  ];

  function compactObject(value) {
    return Object.fromEntries(
      Object.entries(value).filter(([, item]) => item !== "" && item !== null && item !== undefined)
    );
  }

  function safeUrl(value, base = window.location.href) {
    if (!value) return null;

    try {
      return new URL(value, base);
    } catch (_error) {
      return null;
    }
  }

  function stripLegacyInternalCampaign() {
    const url = new URL(window.location.href);
    const source = (url.searchParams.get("utm_source") || "").toLowerCase();
    const medium = (url.searchParams.get("utm_medium") || "").toLowerCase();
    const campaign = (url.searchParams.get("utm_campaign") || "").toLowerCase();
    const isLegacyInternalCampaign = LEGACY_INTERNAL_SOURCES.has(source) && (
      campaign === "main_site_referral" || LEGACY_INTERNAL_MEDIA.has(medium)
    );

    if (!isLegacyInternalCampaign) return false;

    url.searchParams.delete("utm_source");
    url.searchParams.delete("utm_medium");
    url.searchParams.delete("utm_campaign");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    return true;
  }

  function readCookie(name) {
    const prefix = `${name}=`;
    const item = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
    return item ? item.slice(prefix.length) : "";
  }

  function parseStoredValue(value) {
    if (!value) return null;

    try {
      const parsed = JSON.parse(decodeURIComponent(value));
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (_error) {
      return null;
    }
  }

  function readFirstTouch() {
    const cookieValue = parseStoredValue(readCookie(FIRST_TOUCH_KEY));
    if (cookieValue) return cookieValue;

    try {
      return parseStoredValue(window.localStorage.getItem(FIRST_TOUCH_KEY));
    } catch (_error) {
      return null;
    }
  }

  function writeFirstTouch(firstTouch) {
    const value = encodeURIComponent(JSON.stringify(firstTouch));
    const hostname = window.location.hostname.toLowerCase();
    const sharedDomain = hostname === "why57.com" || hostname.endsWith(".why57.com")
      ? "; Domain=.why57.com"
      : "";
    const secure = window.location.protocol === "https:" ? "; Secure" : "";

    document.cookie = `${FIRST_TOUCH_KEY}=${value}; Path=/; Max-Age=${FIRST_TOUCH_MAX_AGE_SECONDS}; SameSite=Lax${sharedDomain}${secure}`;

    try {
      window.localStorage.setItem(FIRST_TOUCH_KEY, value);
    } catch (_error) {
      // The shared first-party cookie remains the cross-subdomain source of truth.
    }
  }

  function getCampaignValues(url) {
    return Object.fromEntries(
      CAMPAIGN_PARAMETERS
        .map((name) => [name, url.searchParams.get(name)])
        .filter(([, value]) => value)
    );
  }

  function deriveSourceAndMedium(campaign, referrerHost) {
    if (campaign.utm_source || campaign.utm_medium) {
      return {
        source: campaign.utm_source || "(not set)",
        medium: campaign.utm_medium || "(not set)"
      };
    }

    if (campaign.gclid || campaign.dclid || campaign.gbraid || campaign.wbraid) {
      return { source: "google", medium: "cpc" };
    }

    if (campaign.msclkid) return { source: "bing", medium: "cpc" };
    if (campaign.fbclid) return { source: "facebook", medium: "referral" };
    if (referrerHost) return { source: referrerHost, medium: "referral" };
    return { source: "(direct)", medium: "(none)" };
  }

  function createFirstTouch() {
    const url = new URL(window.location.href);
    const referrer = safeUrl(document.referrer);
    const referrerHost = referrer && !INTERNAL_HOSTS.has(referrer.hostname.toLowerCase())
      ? referrer.hostname.toLowerCase()
      : "";
    const campaign = getCampaignValues(url);
    const attribution = deriveSourceAndMedium(campaign, referrerHost);

    return compactObject({
      captured_at: new Date().toISOString(),
      landing_page: `${url.pathname}${url.hash}`,
      referrer_host: referrerHost,
      source: attribution.source,
      medium: attribution.medium,
      ...campaign
    });
  }

  function firstTouchEventParameters(firstTouch) {
    if (!firstTouch) return {};

    return compactObject({
      first_touch_source: firstTouch.source,
      first_touch_medium: firstTouch.medium,
      first_touch_campaign: firstTouch.utm_campaign,
      first_touch_campaign_id: firstTouch.utm_id,
      first_touch_source_platform: firstTouch.utm_source_platform,
      first_touch_content: firstTouch.utm_content,
      first_touch_term: firstTouch.utm_term,
      first_touch_landing_page: firstTouch.landing_page,
      first_touch_referrer_host: firstTouch.referrer_host,
      first_touch_date: firstTouch.captured_at?.slice(0, 10)
    });
  }

  function pageContext() {
    const path = window.location.pathname;
    let pageType = "landing_page";

    if (path === "/" || path.endsWith("/index.html")) pageType = "home";
    if (path.includes("/case-studies/")) pageType = "case_study";
    if (path.endsWith("ai-app-prototype-to-production.html")) pageType = "prototype_service";
    if (path.endsWith("privacy.html") || path.endsWith("terms.html")) pageType = "legal";
    if (path.endsWith("404.html")) pageType = "not_found";

    return {
      page_path: path,
      page_title: document.title,
      page_type: document.body?.dataset.pageType || pageType
    };
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, 100);
  }

  function ctaLocation(link) {
    if (link.dataset.ctaLocation) return link.dataset.ctaLocation;
    if (link.dataset.roiLink) return `roi_${link.dataset.roiLink}`;
    if (link.id) return link.id;

    const section = link.closest("section[id], footer[id], nav[id]");
    return section?.id ? `${section.id}_cta` : "unlabeled_cta";
  }

  function offerForLink(link, destination) {
    if (link.dataset.offer) return link.dataset.offer;
    if (destination.hostname === "roi.why57.com") return "roi_calculator";
    if (window.location.pathname.endsWith("ai-app-prototype-to-production.html")) return "prototype_review";
    if (/demo/i.test(link.textContent || "")) return "57seconds_demo";
    return "strategy_call";
  }

  function ctaContext(link, destination) {
    return {
      cta_location: ctaLocation(link),
      cta_text: normalizeText(link.textContent),
      offer: offerForLink(link, destination),
      destination_host: destination.hostname,
      destination_path: destination.pathname
    };
  }

  const strippedLegacyCampaign = stripLegacyInternalCampaign();
  const storedFirstTouch = readFirstTouch();
  const firstTouch = storedFirstTouch || createFirstTouch();
  if (!storedFirstTouch) writeFirstTouch(firstTouch);

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("set", "linker", {
    domains: LINKED_DOMAINS,
    accept_incoming: true,
    decorate_forms: true
  });
  window.gtag("set", firstTouchEventParameters(firstTouch));
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);

  const googleTag = document.createElement("script");
  googleTag.async = true;
  googleTag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(googleTag);

  function track(eventName, detail = {}) {
    const parameters = compactObject({
      ...pageContext(),
      ...firstTouchEventParameters(firstTouch),
      ...detail
    });

    window.gtag("event", eventName, parameters);
    document.dispatchEvent(new CustomEvent("why57:analytics", {
      detail: { eventName, parameters }
    }));
  }

  function bindCtaTracking() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest?.("a[href]");
      if (!link) return;

      const destination = safeUrl(link.href);
      if (!destination) return;

      if (destination.hostname === "calendar.app.google") {
        track("calendar_booking_clicked", {
          ...ctaContext(link, destination),
          conversion_stage: "micro"
        });
        return;
      }

      if (destination.hostname === "roi.why57.com") {
        track("roi_calculator_clicked", {
          ...ctaContext(link, destination),
          conversion_stage: "micro"
        });
      }
    });
  }

  window.why57Analytics = Object.freeze({
    measurementId: MEASUREMENT_ID,
    linkedDomains: [...LINKED_DOMAINS],
    firstTouch: { ...firstTouch },
    strippedLegacyCampaign,
    track
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindCtaTracking, { once: true });
  } else {
    bindCtaTracking();
  }
})();
