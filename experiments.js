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
  window.why57Analytics?.track('experiment_impression', {
    experiment_name: experimentName,
    variant_name:    variant,
    ...extraParams,
  });
}

// ─── Experiment 1: Hero headline framing ──────────────────────────────────
// Tests loss-averse reframe vs. current gain-frame headline.
// Control:  "We build software that removes real operational friction."
// Variant:  e.g. "Stop losing revenue to manual processes."
function proofSafeCopy(value, fallback) {
  if (!value) return fallback;

  const unsupportedClaimPattern = /(pays? for itself|\bproven\b|\baverage roi\b|\bguarantee(?:d|s)?\b|\b(?:always|never|every)\b|\bafter (?:each|every)\b|\bworks? for any\b|\bday one\b|\bone call\b|\bscales? without breaking\b|\bjust results\b|\bfree\b|\bno obligation\b|\bzoom\b|\bphone\b|\b\d+\s*minutes?\b|\b\d[\d,]*(?:\.\d+)?\s*(?:\+|x|%|years?|clients?|reviews?))/i;
  return unsupportedClaimPattern.test(value) ? fallback : value;
}

function applyExpHeroHeadline(rc) {
  const el = document.querySelector('.hero-headline');
  if (!el) return;

  const control = "We build software that removes real operational friction.";
  const headline = proofSafeCopy(rc.hero_headline, control);

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
  const CONTROL_SUB = "Automation, client portals, review workflows, and operations platforms scoped around a documented business process.";
  const subEl = document.querySelector('.hero-sub');
  const safeSub = proofSafeCopy(rc.hero_headline_sub, CONTROL_SUB);
  if (subEl && safeSub !== CONTROL_SUB) {
    subEl.textContent = safeSub;
  }
}

// ─── Experiment 2: CTA copy ───────────────────────────────────────────────
// Tests owner-approved fit-call wording without asserting price, duration, or meeting format.
// Updates nav + hero CTAs together for consistent messaging.
function applyExpCtaCopy(rc) {
  const control = "Request a Fit Call";
  const navControl = "Request a Call";
  const heroCta = proofSafeCopy(rc.hero_cta_primary, control);
  const navCta  = proofSafeCopy(rc.nav_cta, navControl);

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
// Price-range testing is disabled until the owner confirms the current pricing policy.
// Based on NNG research: pricing is the #1 most-needed info on vendor sites.
function applyExpPriceSignal(rc) {
  // Price signal text disabled — always treat as control.
  trackExperiment('price_signal', 'control');
}

// ─── Experiment 5: Social proof placement ────────────────────────────────
// Tests moving the proof-process row above the hero headline.
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
// Tests leading with the review workflow use case in the hero
// vs. the current generic "custom software" positioning.
// Specifically targets call-heavy businesses who immediately recognize the value.
function applyExp57SecondsHero(rc) {
  if (rc.hero_lead_service !== '57seconds') {
    trackExperiment('hero_lead_service', 'control');
    return;
  }

  // Update hero badge
  const badge = document.querySelector('.hero-badge');
  if (badge) badge.textContent = proofSafeCopy(rc.hero_badge_text, '57Seconds — Review Workflow');

  // Update hero sub-headline to lead with the implementation scope.
  const heroSub = document.querySelector('.hero-sub');
  if (heroSub) {
    heroSub.textContent = 'Configure review follow-up for eligible interactions with agent-specific requests, landing pages, and reporting.';
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
