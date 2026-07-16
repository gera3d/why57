(() => {
  const form = document.getElementById('prototypeReviewForm');
  if (!form) return;

  const errorSummary = document.getElementById('prototypeReviewError');
  const successState = document.getElementById('prototypeReviewSuccess');
  const reference = document.getElementById('prototypeReviewReference');
  const submitButton = document.getElementById('prototypeSubmit');
  const startedAt = document.getElementById('prototypeFormStartedAt');
  const requestId = document.getElementById('prototypeRequestId');
  const pageUrl = document.getElementById('prototypePageUrl');
  const referrer = document.getElementById('prototypeReferrer');
  const sessionId = document.getElementById('prototypeSessionId');
  const utmSource = document.getElementById('prototypeUtmSource');
  const utmMedium = document.getElementById('prototypeUtmMedium');
  const utmCampaign = document.getElementById('prototypeUtmCampaign');
  const progressiveDetails = document.getElementById('prototypeReviewDetails');
  const receiptEndpoint = `${new URL(form.action).origin}/conversion-receipt`;
  const defaultSubmitLabel = submitButton?.textContent || 'Send My Prototype';

  function createRequestId() {
    if (typeof window.crypto?.randomUUID === 'function') return window.crypto.randomUUID();
    if (typeof window.crypto?.getRandomValues === 'function') {
      const values = new Uint32Array(4);
      window.crypto.getRandomValues(values);
      return `prototype-${Array.from(values, (value) => value.toString(16).padStart(8, '0')).join('')}`;
    }
    return `prototype-${Date.now()}`;
  }

  function rotateRequestId() {
    if (requestId) requestId.value = createRequestId();
  }

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
    if (requestId && !requestId.value) rotateRequestId();
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
    if (progressiveDetails?.contains(field)) progressiveDetails.open = true;
    showFieldError(field, friendlyValidationMessage(field));
    showFormError('Please check the highlighted fields before sending your prototype.', false);
  }, true);

  async function claimConversionReceipt(receipt) {
    if (!/^[a-f0-9]{64}$/.test(String(receipt || ''))) {
      throw new Error('The review service did not return a valid delivery receipt. Your answers are still here—please try again.');
    }

    const response = await fetch(receiptEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ receipt })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok || result.event_type !== 'prototype_review_submitted') {
      throw new Error('Delivery was confirmed, but the analytics receipt could not be validated. Please retry with the same request.');
    }
    return result;
  }

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
      let rotateAfterError = false;

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
          rotateAfterError = !['delivery_state_unknown', 'request_processing'].includes(result.error);
          const message = result.error === 'request_processing'
            ? 'This request is already being processed. Do not submit it again; check your email in a moment.'
            : response.status === 429
            ? 'We have received several requests from this connection. Please wait an hour and try again.'
            : response.status >= 500
              ? 'The review service is temporarily unavailable. Your answers are still here—please try again in a few minutes.'
              : 'Please check the highlighted fields and try again.';
          throw new Error(message);
        }

        if (result.stored !== true || result.forwarded !== true) {
          rotateAfterError = true;
          throw new Error('The review service did not confirm storage and delivery. Your answers are still here—please try again.');
        }

        const receipt = await claimConversionReceipt(result.receipt);

        form.hidden = true;
        if (successState) successState.hidden = false;
        if (reference && receipt.reference) reference.textContent = `Reference ${receipt.reference}`;

        const analyticsDetail = {
          form_id: 'prototype_review',
          tool: String(payload.tool || 'unknown'),
          current_users: String(payload.current_users || 'unknown'),
          target_date: String(payload.target_date || 'unknown'),
          submission_transport: 'enhanced',
          submission_id: receipt.submission_id || result.id || undefined
        };

        if (receipt.claimed === true) {
          if (typeof window.trackEvent === 'function') {
            window.trackEvent('prototype_review_submitted', analyticsDetail);
          } else if (typeof window.gtag === 'function') {
            window.gtag('event', 'prototype_review_submitted', analyticsDetail);
          }

          window.dispatchEvent(new CustomEvent('why57:prototype_review_submitted', {
            detail: analyticsDetail
          }));
        }

        successState?.focus();
        window.history.replaceState({}, '', `${window.location.pathname}?prototype_review=thanks#send-prototype`);
      } catch (error) {
        if (rotateAfterError) rotateRequestId();
        showFormError(error instanceof Error ? error.message : 'We could not send your prototype. Please try again.');
      } finally {
        setSubmitting(false);
      }
    });
  }

  setContextFields();
  if (progressiveDetails && window.matchMedia('(max-width: 640px)').matches) {
    progressiveDetails.open = false;
  }
})();
