(() => {
  "use strict";

  const form = document.getElementById("cookbookSignupForm");
  if (!form) return;

  const email = document.getElementById("cookbookEmail");
  const consent = document.getElementById("cookbookConsent");
  const requestId = document.getElementById("cookbookRequestId");
  const startedAt = document.getElementById("cookbookFormStartedAt");
  const pageUrl = document.getElementById("cookbookPageUrl");
  const referrer = document.getElementById("cookbookReferrer");
  const sessionId = document.getElementById("cookbookSessionId");
  const utmSource = document.getElementById("cookbookUtmSource");
  const utmMedium = document.getElementById("cookbookUtmMedium");
  const utmCampaign = document.getElementById("cookbookUtmCampaign");
  const errorState = document.getElementById("cookbookSignupError");
  const successState = document.getElementById("cookbookSignupSuccess");
  const submitButton = document.getElementById("cookbookSignupSubmit");
  const defaultSubmitLabel = submitButton?.textContent || "Follow the cookbook";

  function createRequestId() {
    if (typeof window.crypto?.randomUUID === "function") return window.crypto.randomUUID();
    if (typeof window.crypto?.getRandomValues === "function") {
      const values = new Uint32Array(4);
      window.crypto.getRandomValues(values);
      return `cookbook-${Array.from(values, (value) => value.toString(16).padStart(8, "0")).join("")}`;
    }
    return `cookbook-${Date.now()}`;
  }

  function getSessionId() {
    try {
      const key = "why57_cookbook_session";
      let value = window.sessionStorage.getItem(key);
      if (!value) {
        value = createRequestId();
        window.sessionStorage.setItem(key, value);
      }
      return value;
    } catch (_error) {
      return "";
    }
  }

  function populateContext() {
    const parameters = new URLSearchParams(window.location.search);
    if (requestId && !requestId.value) requestId.value = createRequestId();
    if (startedAt) startedAt.value = String(Date.now());
    if (pageUrl) pageUrl.value = window.location.href.slice(0, 1000);
    if (referrer) referrer.value = document.referrer.slice(0, 1000);
    if (sessionId) sessionId.value = getSessionId();
    if (utmSource) utmSource.value = (parameters.get("utm_source") || "").slice(0, 120);
    if (utmMedium) utmMedium.value = (parameters.get("utm_medium") || "").slice(0, 120);
    if (utmCampaign) utmCampaign.value = (parameters.get("utm_campaign") || "").slice(0, 160);
  }

  function showError(message) {
    if (!errorState) return;
    errorState.textContent = message;
    errorState.hidden = false;
    errorState.focus();
  }

  function clearError() {
    if (errorState) errorState.hidden = true;
  }

  function setSubmitting(isSubmitting) {
    if (!submitButton) return;
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? "Saving your place…" : defaultSubmitLabel;
    form.setAttribute("aria-busy", String(isSubmitting));
  }

  function rotateRequestId() {
    if (requestId) requestId.value = createRequestId();
  }

  function showSuccess() {
    form.hidden = true;
    if (successState) {
      successState.hidden = false;
      successState.focus();
    }
  }

  function hasSuccessQuery() {
    return new URLSearchParams(window.location.search).get("signup") === "success";
  }

  populateContext();
  if (hasSuccessQuery()) showSuccess();

  email?.addEventListener("input", () => {
    email.removeAttribute("aria-invalid");
    clearError();
  });
  consent?.addEventListener("change", () => {
    consent.removeAttribute("aria-invalid");
    clearError();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError();

    if (!form.checkValidity()) {
      if (email?.validity.valueMissing || email?.validity.typeMismatch) {
        email.setAttribute("aria-invalid", "true");
        email.focus();
        showError("Enter a valid email address to follow the cookbook.");
      } else if (consent?.validity.valueMissing) {
        consent.setAttribute("aria-invalid", "true");
        consent.focus();
        showError("Please confirm that you want cookbook updates before signing up.");
      }
      return;
    }

    if (typeof window.fetch !== "function") {
      form.removeAttribute("novalidate");
      form.submit();
      return;
    }

    setSubmitting(true);
    const payload = Object.fromEntries(new FormData(form).entries());
    let shouldRotateRequestId = false;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok || result.stored !== true || result.forwarded !== true) {
        shouldRotateRequestId = !["delivery_state_unknown", "request_processing"].includes(result.error);
        const message = result.error === "request_processing"
          ? "Your signup is already being processed. Please wait a moment before trying again."
          : response.status === 429
            ? "We have received several signup requests from this connection. Please try again in an hour."
            : response.status >= 500
              ? "The signup service is temporarily unavailable. Your address was not added—please try again in a few minutes."
              : "Please check your email address and consent, then try again.";
        throw new Error(message);
      }

      window.why57Analytics?.track("cookbook_signup_submitted", {
        form_id: "cookbook_signup",
        offer: "ai_execution_cookbook",
        conversion_stage: "signup"
      });
      showSuccess();
    } catch (error) {
      showError(error instanceof Error ? error.message : "We could not save your signup. Please try again.");
      if (shouldRotateRequestId) rotateRequestId();
    } finally {
      setSubmitting(false);
    }
  });
})();
