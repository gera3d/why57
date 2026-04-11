/**
 * experiments.js
 * Applies Firebase Remote Config variant values to the DOM for why57.com A/B tests.
 *
 * ARCHITECTURE:
 *   - Listens for the `why57:rc-ready` event dispatched by firebase-config.js.
 *   - Each experiment is a self-contained apply() function that reads from window.why57RC
 *     and modifies DOM elements to reflect the active variant.
 *   - GA4 events are fired for each experiment enrollment (used to compute conversion rates).
 *   - Falls back gracefully if any element is missing (works across all pages).
 *
 * ADDING A NEW EXPERIMENT:
 *   1. Add parameter(s) to firebase-config.js DEFAULT_CONFIG and window.why57RC builder.
 *   2. Create a new applyExpXxx() function below.
 *   3. Call it inside applyAllExperiments().
 *   4. Add the parameter to Firebase Remote Config + set up the experiment in Console.
 *   5. Update experiments/rc-active.json and push via CLI.
 */

// ─── GA4 event helper (matches main.js pattern) ───────────────────────────
function trackExperiment(experimentName, variant, extraParams = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'experiment_impression', {
      experiment_name: experimentName,
      variant_name:    variant,
      ...extraParams,
    });
  }
}

// ─── Experiment 1: Hero headline framing ──────────────────────────────────
// Tests loss-averse reframe vs. current gain-frame headline.
// Control:  "We build software that pays for itself."
// Variant:  e.g. "Stop losing revenue to manual processes."
function applyExpHeroHeadline(rc) {
  const el = document.querySelector('.hero-headline');
  if (!el) return;

  const control = "We build software that pays for itself.";
  const headline = rc.hero_headline;

  if (headline && headline !== control) {
    // Replace the text while preserving the <span class="text-orange"> structure
    const orangeMatch = headline.match(/^(.+?)\s+([^.]+\.)$/);
    if (orangeMatch) {
      el.innerHTML = `${orangeMatch[1]} <span class="text-orange">${orangeMatch[2]}</span>`;
    } else {
      el.textContent = headline;
    }
    trackExperiment('hero_headline', 'variant', { headline_text: headline });
  } else {
    trackExperiment('hero_headline', 'control');
  }

  // Apply sub-headline variant if it differs from the control value
  const CONTROL_SUB = "Automation. Client portals. Review engines. Operations platforms. Purpose-built for businesses in Sonoma County, the Bay Area, and beyond.";
  const subEl = document.querySelector('.hero-sub');
  if (subEl && rc.hero_headline_sub && rc.hero_headline_sub !== CONTROL_SUB) {
    subEl.textContent = rc.hero_headline_sub;
  }
}

// ─── Experiment 2: CTA copy ───────────────────────────────────────────────
// Tests "Book a Free Call" vs. variants like "See If You're a Fit" or "Get a Project Plan".
// Updates nav + hero CTAs together for consistent messaging.
function applyExpCtaCopy(rc) {
  const control = "Book a Free Call";
  const navControl = "Book a Call";
  const heroCta = rc.hero_cta_primary;
  const navCta  = rc.nav_cta;

  const isVariant = heroCta && heroCta !== control;
  const variant   = isVariant ? 'variant' : 'control';

  // Hero CTA
  const heroBtn = document.getElementById('heroBook');
  if (heroBtn && heroCta) heroBtn.textContent = heroCta;

  // Nav CTA
  const navBtn = document.getElementById('navBook');
  if (navBtn && navCta) navBtn.textContent = navCta;

  // All other booking CTAs that share the same intent
  ['fitBook', 'roiBook', 'ctaBook'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn && heroCta) btn.textContent = heroCta;
  });

  trackExperiment('cta_copy', variant, { cta_text: heroCta });
}

// ─── Experiment 3: Intake form position ──────────────────────────────────
// Tests showing the intake form above the fold (as the hero) vs. current (after value prop).
// Control:  intake appears after hero content
// Variant:  intake moves to the top of .hero-content, replacing the headline section
function applyExpIntakePosition(rc) {
  if (!rc.intake_above_fold) {
    trackExperiment('intake_position', 'control');
    return;
  }

  const heroSection  = document.querySelector('.hero') || document.querySelector('main') || document.body;
  const intakeSection = document.getElementById('start-here') || document.querySelector('.intake-stage')?.closest('section');
  const heroElement   = document.querySelector('.hero-content')?.closest('section') || document.querySelector('.hero');
  if (!intakeSection || !heroElement) return;

  // Move the intake section before the hero section so it appears above fold
  heroElement.parentNode?.insertBefore(intakeSection, heroElement);
  intakeSection.style.marginBottom = '32px';

  // Reduce visual weight of the headline since intake is now primary
  const headline = document.querySelector('.hero-headline');
  if (headline) headline.style.fontSize = 'clamp(1.4rem, 2.5vw, 2rem)';

  trackExperiment('intake_position', 'variant');
}

// ─── Experiment 4: Price signal ───────────────────────────────────────────
// Tests showing "Most projects: $5k–$25k · Fixed price, scoped upfront." near CTAs.
// Based on NNG research: pricing is the #1 most-needed info on vendor sites.
function applyExpPriceSignal(rc) {
  // Price signal text disabled — always treat as control.
  trackExperiment('price_signal', 'control');
  return;
  if (!rc.show_price_signal) {

  const text = rc.price_signal_text || "Most projects: $5k–$25k · Fixed price, scoped upfront.";

  // Insert price signal after the hero actions
  const heroActions = document.querySelector('.hero-actions');
  if (heroActions && !document.getElementById('exp-price-signal')) {
    const pill = document.createElement('p');
    pill.id = 'exp-price-signal';
    pill.textContent = text;
    pill.style.cssText = [
      'font-size: .78rem',
      'color: rgba(237,237,239,0.45)',
      'margin-top: 12px',
      'letter-spacing: .01em',
      'line-height: 1.5',
    ].join(';');
    heroActions.insertAdjacentElement('afterend', pill);
  }

  // Also insert near the fit section CTA if it exists
  const fitBook = document.getElementById('fitBook');
  if (fitBook && fitBook.parentElement && !document.getElementById('exp-price-signal-fit')) {
    const pill2 = document.createElement('p');
    pill2.id = 'exp-price-signal-fit';
    pill2.textContent = text;
    pill2.style.cssText = 'font-size:.75rem;color:rgba(237,237,239,0.4);margin-top:10px;';
    fitBook.parentElement.insertAdjacentElement('afterend', pill2);
  }

  trackExperiment('price_signal', 'variant', { signal_text: text });
}

// ─── Experiment 5: Social proof placement ────────────────────────────────
// Tests moving the stats row (9,000+ reviews, 10x ROI, etc.) above the hero headline.
// Social proof above the fold builds trust before the visitor reads the pitch.
function applyExpSocialProofPlacement(rc) {
  if (!rc.social_proof_above_fold) {
    trackExperiment('social_proof_placement', 'control');
    return;
  }

  const heroContent = document.querySelector('.hero-content');
  const heroStats   = document.querySelector('.hero-stats');
  const heroBadge   = document.querySelector('.hero-badge');
  if (!heroContent || !heroStats) return;

  // Move stats to be the first child of hero-content (above badge + headline)
  if (heroBadge) {
    heroContent.insertBefore(heroStats, heroBadge);
  } else {
    heroContent.prepend(heroStats);
  }

  // Add a small visual separator
  heroStats.style.marginBottom = '28px';
  heroStats.style.paddingBottom = '20px';
  heroStats.style.borderBottom = '1px solid rgba(255,255,255,0.08)';

  trackExperiment('social_proof_placement', 'variant');
}

// ─── Experiment 6: 57Seconds as hero use case ────────────────────────────
// Tests leading with the review growth use case (9,000 reviews proof) in the hero
// vs. the current generic "custom software" positioning.
// Specifically targets call-heavy businesses who immediately recognize the value.
function applyExp57SecondsHero(rc) {
  if (rc.hero_lead_service !== '57seconds') {
    trackExperiment('hero_lead_service', 'control');
    return;
  }

  // Update hero badge
  const badge = document.querySelector('.hero-badge');
  if (badge) badge.textContent = rc.hero_badge_text || '57Seconds — Review Growth';

  // Update hero sub-headline to lead with the 57Seconds proof point
  const heroSub = document.querySelector('.hero-sub');
  if (heroSub) {
    heroSub.innerHTML = `
      Your best clients never leave a review.<br />
      We fix that — automatically, after every call.<br />
      <span style="color:rgba(237,237,239,0.5);font-size:.9em;">
        9,000+ reviews generated. Proven across insurance, legal, and service businesses.
      </span>
    `;
  }

  // Reorder hero stats to surface the review stat first
  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) {
    const reviewStat = [...statsEl.querySelectorAll('.stat')]
      .find(s => s.querySelector('.stat-n')?.textContent?.includes('9,000'));
    if (reviewStat) statsEl.prepend(reviewStat);
  }

  trackExperiment('hero_lead_service', 'variant', { service: '57seconds' });
}

// ─── Master apply function ────────────────────────────────────────────────
function applyAllExperiments(rc) {
  applyExpHeroHeadline(rc);
  applyExpCtaCopy(rc);
  applyExpIntakePosition(rc);
  applyExpPriceSignal(rc);
  applyExpSocialProofPlacement(rc);
  applyExp57SecondsHero(rc);
}

// ─── Entry point ─────────────────────────────────────────────────────────
// Wait for Remote Config to load, then apply experiments.
// If RC fires after DOM is already ready, apply immediately.
document.addEventListener('why57:rc-ready', (e) => {
  // Small rAF delay ensures the DOM has fully rendered before we mutate it
  requestAnimationFrame(() => applyAllExperiments(e.detail));
});

// Safety fallback: if page loads with defaults (RC not used), still fire control events
window.addEventListener('load', () => {
  if (!window.why57RC) {
    // RC never initialized — log controls for clean baseline data
    ['hero_headline', 'cta_copy', 'intake_position', 'price_signal', 'social_proof_placement', 'hero_lead_service']
      .forEach(name => trackExperiment(name, 'control', { reason: 'rc_not_initialized' }));
  }
});
