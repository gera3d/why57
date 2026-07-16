(() => {
  const config = window.WHY57_LEAD_INTAKE || {};
  const forms = Array.from(document.querySelectorAll('[data-lead-form]'));
  if (!forms.length || !config.enabled || !config.endpoint) return;

  const sessionKey = 'why57_lead_session_id_v1';

  function sessionId() {
    const existing = sessionStorage.getItem(sessionKey);
    if (existing) return existing;
    const created = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    sessionStorage.setItem(sessionKey, created);
    return created;
  }

  function attribution() {
    const params = new URLSearchParams(window.location.search);
    return {
      session_id: sessionId(),
      landing_page: window.location.href,
      page_path: window.location.pathname,
      referrer: document.referrer || undefined,
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_content: params.get('utm_content') || undefined,
      utm_term: params.get('utm_term') || undefined
    };
  }

  function submissionId(form) {
    if (form.dataset.submissionId) return form.dataset.submissionId;
    const created = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `submission-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    form.dataset.submissionId = created;
    return created;
  }

  function payloadFromForm(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    const reserved = new Set(['name', 'email', 'company', 'phone', 'message', 'interest', 'website']);
    const formContext = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => !reserved.has(key) && String(value).trim())
    );

    return {
      event_type: 'lead_submission',
      submission_id: submissionId(form),
      sent_at: new Date().toISOString(),
      source: form.dataset.leadSource || 'website_form',
      contact: {
        name: String(data.name || ''),
        email: String(data.email || ''),
        company: String(data.company || ''),
        phone: String(data.phone || '')
      },
      interest: String(data.interest || ''),
      message: String(data.message || ''),
      website: String(data.website || ''),
      page_url: window.location.href,
      referrer: document.referrer || undefined,
      context: attribution(),
      form_context: formContext
    };
  }

  function setStatus(form, message, state) {
    const status = form.querySelector('[data-lead-status]');
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  }

  forms.forEach((form) => {
    form.hidden = false;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const button = form.querySelector('button[type="submit"]');
      if (button) button.disabled = true;
      setStatus(form, 'Saving your request…', 'pending');

      try {
        const response = await fetch(config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadFromForm(form)),
          credentials: 'omit',
          mode: 'cors'
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.message || 'Request failed');

        if (result.delivery_mode === 'live') {
          setStatus(form, 'Got it — check your inbox for the booking link and next step.', 'success');
        } else if (result.delivery_mode === 'test') {
          setStatus(form, 'Test request accepted. Email delivery was limited to the approved test inbox.', 'success');
        } else {
          setStatus(form, 'Dry run accepted. No email, alert, or spreadsheet delivery was sent.', 'success');
        }
        delete form.dataset.submissionId;
        form.reset();

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'lead_form_submitted',
          lead_source: form.dataset.leadSource || 'website_form',
          lead_id: result.id
        });
      } catch (_error) {
        setStatus(form, 'That did not save. Please use the booking link or call (707) 694-5624.', 'error');
      } finally {
        if (button) button.disabled = false;
      }
    });
  });
})();
