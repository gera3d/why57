(() => {
  const form = document.getElementById('prototypeReviewForm');
  if (!form) return;

  const errorSummary = document.getElementById('prototypeReviewError');
  const successState = document.getElementById('prototypeReviewSuccess');
  const reference = document.getElementById('prototypeReviewReference');
  const submitButton = document.getElementById('prototypeSubmit');
  const startedAt = document.getElementById('prototypeFormStartedAt');
  const pageUrl = document.getElementById('prototypePageUrl');
  const referrer = document.getElementById('prototypeReferrer');
  const sessionId = document.getElementById('prototypeSessionId');
  const utmSource = document.getElementById('prototypeUtmSource');
  const utmMedium = document.getElementById('prototypeUtmMedium');
  const utmCampaign = document.getElementById('prototypeUtmCampaign');
  const defaultSubmitLabel = submitButton?.textContent || 'Send My Prototype';

  function getSessionId() {
    try {
      const key = 'why57_prototype_review_session';
      let value = window.sessionStorage.getItem(key);
      if (!value) {
        value = typeof window.crypto?.randomUUID === 'function'
          ? window.crypto.randomUUID()
          : `session-${Date.now()}`;
        window.sessionStorage.setItem(key, value);
      }
      return value;
    } catch (_error) {
      return '';
    }
  }

  function setContextFields() {
    const params = new URLSearchParams(window.location.search);
    if (startedAt) startedAt.value = String(Date.now());
    if (pageUrl) pageUrl.value = window.location.href.slice(0, 1000);
    if (referrer) referrer.value = document.referrer.slice(0, 1000);
    if (sessionId) sessionId.value = getSessionId();
    if (utmSource) utmSource.value = (params.get('utm_source') || '').slice(0, 120);
    if (utmMedium) utmMedium.value = (params.get('utm_medium') || '').slice(0, 120);
    if (utmCampaign) utmCampaign.value = (params.get('utm_campaign') || '').slice(0, 160);
  }

  function errorElementFor(field) {
    const describedBy = (field.getAttribute('aria-describedby') || '').split(/\s+/);
    const errorId = describedBy.find((id) => id.endsWith('Error'));
    return errorId ? document.getElementById(errorId) : null;
  }

  function friendlyValidationMessage(field) {
    const label = form.querySelector(`label[for="${field.id}"]`)?.textContent
      ?.replace('*', '')
      .trim() || 'This field';

    if (field.type === 'checkbox' && field.validity.valueMissing) return 'Consent is required before we can review and respond.';
    if (field.validity.valueMissing) return `${label} is required.`;
    if (field.validity.typeMismatch && field.type === 'email') return 'Enter a valid email address.';
    if (field.validity.typeMismatch && field.type === 'url') return 'Enter a full URL beginning with http:// or https://.';
    if (field.validity.tooShort) return `${label} needs a little more detail.`;
    if (field.validity.tooLong) return `${label} is longer than we can accept.`;
    return field.validationMessage || `${label} needs attention.`;
  }

  function showFieldError(field, message) {
    const error = errorElementFor(field);
    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');
    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
  }

  function clearFieldError(field) {
    const error = errorElementFor(field);
    field.classList.remove('is-invalid');
    field.removeAttribute('aria-invalid');
    if (error) {
      error.textContent = '';
      error.hidden = true;
    }
  }

  function showFormError(message, shouldFocus = true) {
    if (!errorSummary) return;
    errorSummary.textContent = message;
    errorSummary.hidden = false;
    if (shouldFocus) errorSummary.focus();
  }

  function clearFormError() {
    if (!errorSummary) return;
    errorSummary.hidden = true;
  }

  function setSubmitting(isSubmitting) {
    if (!submitButton) return;
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? 'Sending…' : defaultSubmitLabel;
    form.setAttribute('aria-busy', String(isSubmitting));
  }

  function applyServerFieldErrors(fields = {}) {
    Object.entries(fields).forEach(([name, message]) => {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLElement && 'validity' in field) {
        showFieldError(field, String(message));
      }
    });
  }

  form.addEventListener('invalid', (event) => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) return;
    showFieldError(field, friendlyValidationMessage(field));
    showFormError('Please check the highlighted fields before sending your prototype.', false);
  }, true);

  form.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener('input', () => {
      if (field.validity.valid) clearFieldError(field);
    });
    field.addEventListener('change', () => {
      if (field.validity.valid) clearFieldError(field);
    });
  });

  if (typeof window.fetch === 'function') {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearFormError();
      setSubmitting(true);

      const payload = Object.fromEntries(new FormData(form).entries());

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) {
          applyServerFieldErrors(result.fields);
          const message = response.status === 429
            ? 'We have received several requests from this connection. Please wait an hour and try again.'
            : response.status >= 500
              ? 'The review service is temporarily unavailable. Your answers are still here—please try again in a few minutes.'
              : 'Please check the highlighted fields and try again.';
          throw new Error(message);
        }

        form.hidden = true;
        if (successState) successState.hidden = false;
        if (reference && result.id) reference.textContent = `Reference ${String(result.id).slice(0, 8).toUpperCase()}`;

        const analyticsDetail = {
          form_id: 'prototype_review',
          tool: String(payload.tool || 'unknown'),
          current_users: String(payload.current_users || 'unknown'),
          target_date: String(payload.target_date || 'unknown'),
          submission_transport: 'enhanced',
          submission_id: result.id || undefined
        };

        if (typeof window.trackEvent === 'function') {
          window.trackEvent('prototype_review_submitted', analyticsDetail);
        } else if (typeof window.gtag === 'function') {
          window.gtag('event', 'prototype_review_submitted', analyticsDetail);
        }

        window.dispatchEvent(new CustomEvent('why57:prototype_review_submitted', {
          detail: analyticsDetail
        }));

        successState?.focus();
        window.history.replaceState({}, '', `${window.location.pathname}?prototype_review=thanks#send-prototype`);
      } catch (error) {
        showFormError(error instanceof Error ? error.message : 'We could not send your prototype. Please try again.');
      } finally {
        setSubmitting(false);
      }
    });
  }

  setContextFields();
})();
