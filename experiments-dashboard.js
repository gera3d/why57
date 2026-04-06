/**
 * experiments-dashboard.js
 * Renders A/B experiment cards in the dashboard Experiments tab.
 *
 * DATA STRATEGY:
 *   Phase 1 (now):   Reads the static EXPERIMENT_REGISTRY below and queries GA4 for
 *                    experiment_impression + conversion events. Shows real enrolled user
 *                    counts and conversion rates once experiments are live.
 *   Phase 2 (later): When BigQuery export is enabled, swap GA4_SOURCE to 'bigquery' and
 *                    point BQ_DATASET to your analytics export. Richer per-variant SQL
 *                    queries unlock more dimensions (device, source, new vs returning).
 *
 * SETUP REQUIRED (one-time, per experiment):
 *   In GA4 → Admin → Custom Definitions → Custom Dimensions, register:
 *     - experiment_name   (Event scope, event: experiment_impression)
 *     - variant_name      (Event scope, event: experiment_impression)
 *   This lets the GA4 Data API break results down by experiment + variant.
 *
 * ADDING AN EXPERIMENT:
 *   1. Create the experiment in Firebase Console → A/B Testing
 *   2. Add an entry to EXPERIMENT_REGISTRY below
 *   3. Set status to 'running' when you start it
 *   4. The card auto-populates with GA4 data
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   EXPERIMENT REGISTRY
   Source of truth for experiment metadata.
   Stats come from GA4 — this is just names, hypotheses, dates.
═══════════════════════════════════════════════════════════ */
const EXPERIMENT_REGISTRY = [
  {
    id:           'hero_headline',
    name:         'Hero Headline Framing',
    status:       'draft',                 // 'draft' | 'running' | 'completed'
    startDate:    null,
    endDate:      null,
    hypothesis:   'A loss-averse reframe ("Stop losing revenue to manual processes") will drive more visitors into the intake form than the current gain-focused headline.',
    primaryMetric: 'intake_completed',
    primaryMetricLabel: 'Intake Completed',
    guardrails:   ['bounce_rate', 'session_duration'],
    control:      { label: 'Control', description: '"We build software that pays for itself."' },
    variant:      { label: 'Variant A', description: '"Stop losing revenue to manual processes."' },
    trafficSplit: 50,    // % to variant; remainder goes to control
    firebaseExpId: null, // set this to the numeric ID from Firebase Console URL once created
    rcParams:     ['hero_headline', 'hero_headline_sub'],
    notes:        'Run for minimum 14 days. Target: statistical significance at p < 0.05.',
  },
  {
    id:           'cta_copy',
    name:         'CTA Copy Test',
    status:       'draft',
    startDate:    null,
    endDate:      null,
    hypothesis:   '"See If You\'re a Fit" leverages the mutual-fit framework and will increase qualified bookings over the generic "Book a Free Call".',
    primaryMetric: 'main_site_booking_clicked',
    primaryMetricLabel: 'Booking Click',
    guardrails:   ['bounce_rate'],
    control:      { label: 'Control', description: '"Book a Free Call"' },
    variant:      { label: 'Variant A', description: '"See If You\'re a Fit"' },
    trafficSplit: 50,
    firebaseExpId: null,
    rcParams:     ['hero_cta_primary', 'nav_cta'],
    notes:        'Also updates fitBook, roiBook, ctaBook buttons for consistent messaging.',
  },
  {
    id:           'intake_position',
    name:         'Intake Form Position',
    status:       'draft',
    startDate:    null,
    endDate:      null,
    hypothesis:   'Placing the intake form above the fold (as the hero) removes friction and increases intake completion vs. requiring a scroll.',
    primaryMetric: 'intake_completed',
    primaryMetricLabel: 'Intake Completed',
    guardrails:   ['bounce_rate', 'session_duration'],
    control:      { label: 'Control', description: 'Intake appears after hero value prop (below fold)' },
    variant:      { label: 'Variant A', description: 'Intake is the hero — first thing visible above fold' },
    trafficSplit: 50,
    firebaseExpId: null,
    rcParams:     ['intake_above_fold'],
    notes:        'High-risk / high-reward. Monitor bounce rate carefully — if it rises >5% vs. control, stop early.',
  },
  {
    id:           'price_signal',
    name:         'Price Signal Near CTA',
    status:       'running',
    startDate:    '2026-04-05',
    endDate:      null,
    hypothesis:   'Surfacing "Most projects: $5k–$25k · Fixed price" near the CTA reduces pricing anxiety and increases booking clicks from qualified visitors.',
    primaryMetric: 'main_site_booking_clicked',
    primaryMetricLabel: 'Booking Click',
    guardrails:   ['bounce_rate'],
    control:      { label: 'Control', description: 'No price signal (current — pricing only in FAQ)' },
    variant:      { label: 'Variant A', description: '"Most projects: $5k–$25k · Fixed price, scoped upfront." shown below CTA' },
    trafficSplit: 50,
    firebaseExpId: '1',
    rcParams:     ['show_price_signal', 'price_signal_text'],
    notes:        'NNG research: pricing is #1 most-needed info on vendor sites. Low risk, high potential.',
  },
  {
    id:           'social_proof_placement',
    name:         'Social Proof Above Fold',
    status:       'draft',
    startDate:    null,
    endDate:      null,
    hypothesis:   'Moving the stats row (9,000+ reviews, 10x ROI) above the headline builds immediate credibility before visitors read the pitch.',
    primaryMetric: 'intake_completed',
    primaryMetricLabel: 'Intake Completed',
    guardrails:   ['bounce_rate'],
    control:      { label: 'Control', description: 'Stats row below headline (current position)' },
    variant:      { label: 'Variant A', description: 'Stats row above headline — first content visible' },
    trafficSplit: 50,
    firebaseExpId: null,
    rcParams:     ['social_proof_above_fold'],
    notes:        'Pairs well with the hero headline test. Run separately first to isolate effect.',
  },
  {
    id:           'hero_lead_service',
    name:         '57Seconds as Hero Use Case',
    status:       'draft',
    startDate:    null,
    endDate:      null,
    hypothesis:   'Leading with 57Seconds (9,000 reviews proof) instead of generic custom software positions the most concrete, quantifiable win first — increasing intake for call-heavy service businesses.',
    primaryMetric: 'intake_completed',
    primaryMetricLabel: 'Intake Completed',
    guardrails:   ['bounce_rate', 'roi_calculator_clicked'],
    control:      { label: 'Control', description: 'Generic "Custom Software Development" hero (current)' },
    variant:      { label: 'Variant A', description: '57Seconds review growth hero with 9,000+ reviews proof point' },
    trafficSplit: 50,
    firebaseExpId: null,
    rcParams:     ['hero_lead_service', 'hero_badge_text'],
    notes:        'Best tested on Sonoma County + Marin pages where service businesses dominate. Target those pages first.',
  },
];

/* ═══════════════════════════════════════════════════════════
   STATS ENGINE — frequentist z-test (matches Firebase's method)
═══════════════════════════════════════════════════════════ */

/**
 * Two-proportion z-test.
 * Returns { lift, pValue, significant, ciLow, ciHigh, confidencePct }
 */
function zTest(controlUsers, controlConverted, variantUsers, variantConverted) {
  if (!controlUsers || !variantUsers || controlUsers < 2 || variantUsers < 2) {
    return { lift: null, pValue: null, significant: false, confidencePct: 0 };
  }

  const p1 = controlConverted / controlUsers;
  const p2 = variantConverted / variantUsers;

  if (p1 === 0 && p2 === 0) {
    return { lift: null, pValue: null, significant: false, confidencePct: 0 };
  }

  const pooled = (controlConverted + variantConverted) / (controlUsers + variantUsers);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / controlUsers + 1 / variantUsers));

  if (se === 0) return { lift: null, pValue: null, significant: false, confidencePct: 0 };

  const z = (p2 - p1) / se;
  const pValue = 2 * (1 - normalCDF(Math.abs(z)));  // two-tailed

  const lift = p1 > 0 ? ((p2 - p1) / p1) * 100 : null;

  // 95% CI on lift
  const seDiff = Math.sqrt((p1 * (1 - p1)) / controlUsers + (p2 * (1 - p2)) / variantUsers);
  const ciLow  = p1 > 0 ? (((p2 - p1) - 1.96 * seDiff) / p1) * 100 : null;
  const ciHigh = p1 > 0 ? (((p2 - p1) + 1.96 * seDiff) / p1) * 100 : null;

  // Express confidence as percentage for the UI bar
  const confidencePct = Math.min(100, Math.max(0, (1 - pValue) * 100));

  return {
    lift:          lift !== null ? Math.round(lift * 10) / 10 : null,
    pValue:        Math.round(pValue * 1000) / 1000,
    significant:   pValue < 0.05,
    confidencePct: Math.round(confidencePct),
    ciLow:         ciLow !== null ? Math.round(ciLow * 10) / 10 : null,
    ciHigh:        ciHigh !== null ? Math.round(ciHigh * 10) / 10 : null,
    controlRate:   Math.round(p1 * 10000) / 100,   // as percentage, 2 decimal places
    variantRate:   Math.round(p2 * 10000) / 100,
  };
}

/** Cumulative distribution function for standard normal (Abramowitz & Stegun approximation) */
function normalCDF(z) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const pdf  = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  const cdf  = 1 - pdf * poly;
  return z >= 0 ? cdf : 1 - cdf;
}

/* ═══════════════════════════════════════════════════════════
   GA4 DATA API — fetch experiment event counts
═══════════════════════════════════════════════════════════ */

/**
 * Runs a GA4 runReport request.
 * Returns parsed { rows, rowCount } or null on error.
 */
async function ga4Report(token, propertyId, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
  try {
    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
        signal:  controller.signal,
      }
    );
    if (!res.ok) return null;
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetches experiment_impression event counts broken down by
 * experiment_name and variant_name custom event parameters.
 *
 * NOTE: requires experiment_name and variant_name to be registered
 * as GA4 custom dimensions (event scope). If not registered, returns null.
 */
async function fetchImpressionData(token, propertyId, days) {
  const startDate = `${days}daysAgo`;
  return ga4Report(token, propertyId, {
    dateRanges:  [{ startDate, endDate: 'today' }],
    dimensions:  [
      { name: 'customEvent:experiment_name' },
      { name: 'customEvent:variant_name' },
    ],
    metrics: [
      { name: 'eventCount' },
      { name: 'totalUsers' },
    ],
    dimensionFilter: {
      filter: {
        fieldName:    'eventName',
        stringFilter: { value: 'experiment_impression', matchType: 'EXACT' },
      },
    },
    limit: 1000,
  });
}

/**
 * Fetches conversion counts per experiment variant.
 * Uses the experiment_name dimension to segment conversions.
 */
async function fetchConversionData(token, propertyId, days, conversionEvent) {
  const startDate = `${days}daysAgo`;
  return ga4Report(token, propertyId, {
    dateRanges: [{ startDate, endDate: 'today' }],
    dimensions: [
      { name: 'customEvent:experiment_name' },
      { name: 'customEvent:variant_name' },
    ],
    metrics: [{ name: 'totalUsers' }],
    dimensionFilter: {
      andGroup: {
        expressions: [
          {
            filter: {
              fieldName:    'eventName',
              stringFilter: { value: conversionEvent, matchType: 'EXACT' },
            },
          },
          {
            not: {
              filter: {
                fieldName:    'customEvent:experiment_name',
                stringFilter: { value: '(not set)', matchType: 'EXACT' },
              },
            },
          },
        ],
      },
    },
    limit: 1000,
  });
}

/**
 * Parses GA4 runReport response rows into a nested map:
 * { experimentName: { variantName: count } }
 */
function parseGA4Rows(report) {
  if (!report || !report.rows) return {};
  const map = {};
  report.rows.forEach(row => {
    const expName  = row.dimensionValues?.[0]?.value || '(not set)';
    const variant  = row.dimensionValues?.[1]?.value || '(not set)';
    const count    = parseInt(row.metricValues?.[0]?.value || '0', 10);
    if (expName === '(not set)' || variant === '(not set)') return;
    if (!map[expName]) map[expName] = {};
    map[expName][variant] = (map[expName][variant] || 0) + count;
  });
  return map;
}

/* ═══════════════════════════════════════════════════════════
   RENDER — build experiment cards
═══════════════════════════════════════════════════════════ */

function fmtPct(n) {
  if (n === null || n === undefined) return '—';
  return n.toFixed(1) + '%';
}

function fmtLift(lift) {
  if (lift === null || lift === undefined) return '—';
  const sign = lift > 0 ? '+' : '';
  return sign + lift.toFixed(1) + '%';
}

function liftClass(lift, sig) {
  if (!sig || lift === null) return 'neu';
  return lift > 0 ? 'pos' : 'neg';
}

function verdictText(stats, isRunning) {
  if (!isRunning) return '';
  if (stats.lift === null) return 'No data yet';
  if (!stats.significant) return 'Inconclusive';
  return stats.lift > 0 ? 'Winner' : 'Losing';
}

function verdictClass(stats, isRunning) {
  if (!isRunning || stats.lift === null || !stats.significant) return 'neutral';
  return stats.lift > 0 ? 'winner' : 'loser';
}

function renderGuardrailIcon(status) {
  if (status === 'ok')   return '✓';
  if (status === 'warn') return '⚠';
  if (status === 'fail') return '✕';
  return '·';
}

function guardrailLabel(key) {
  const map = {
    bounce_rate:       'Bounce rate',
    session_duration:  'Avg. session duration',
    roi_calculator_clicked: 'ROI Calculator clicks',
  };
  return map[key] || key;
}

function renderExperimentCard(exp, impressions, conversions) {
  const isRunning   = exp.status === 'running';
  const isCompleted = exp.status === 'completed';
  const isDraft     = exp.status === 'draft';

  // Pull enrolled users + conversions per variant from GA4 data
  const expImpressions = impressions[exp.id] || {};
  const expConversions  = conversions[exp.id]  || {};

  const controlUsers     = expImpressions['control'] || expImpressions[exp.control.label] || 0;
  const variantUsers     = expImpressions['variant'] || expImpressions[exp.variant.label] || 0;
  const controlConverted = expConversions['control']  || expConversions[exp.control.label]  || 0;
  const variantConverted = expConversions['variant']  || expConversions[exp.variant.label]  || 0;

  const totalUsers = controlUsers + variantUsers;
  const stats = (isRunning || isCompleted)
    ? zTest(controlUsers, controlConverted, variantUsers, variantConverted)
    : { lift: null, pValue: null, significant: false, confidencePct: 0 };

  // Days running
  let daysRunning = '';
  if (exp.startDate) {
    const diff = Math.floor((Date.now() - new Date(exp.startDate)) / 86400000);
    daysRunning = `Day ${diff} of ~14`;
  }

  // Status badge
  const statusLabels = { running: 'Running', completed: 'Completed', draft: 'Draft' };
  const statusLabel  = statusLabels[exp.status] || exp.status;

  return `
<div class="exp-card" id="exp-card-${exp.id}">
  <!-- Head -->
  <div class="exp-card-head">
    <div style="flex:1;min-width:0;">
      <div class="exp-card-title">${exp.name}</div>
      <div class="exp-card-hypo">${exp.hypothesis}</div>
      <div class="exp-card-meta">
        <span>Primary metric: <strong style="color:var(--text)">${exp.primaryMetricLabel}</strong></span>
        ${daysRunning ? `<span>${daysRunning}</span>` : ''}
        ${totalUsers  ? `<span>${totalUsers.toLocaleString()} users enrolled</span>` : ''}
        ${exp.rcParams.length ? `<span>RC params: <code style="color:var(--amber);font-size:.7rem;">${exp.rcParams.join(', ')}</code></span>` : ''}
      </div>
    </div>
    <div>
      <span class="exp-status-badge ${exp.status}">
        <span class="exp-status-dot"></span>
        ${statusLabel}
      </span>
    </div>
  </div>

  <!-- Traffic split -->
  <div class="exp-split">
    <span class="exp-split-label">Traffic split</span>
    <div class="exp-split-bar">
      <div class="exp-split-seg control" style="width:${100 - exp.trafficSplit}%"></div>
      <div class="exp-split-seg variant" style="width:${exp.trafficSplit}%"></div>
    </div>
    <span class="exp-split-users">
      ${controlUsers ? `${controlUsers.toLocaleString()} control` : `${100 - exp.trafficSplit}% control`}
      &nbsp;·&nbsp;
      ${variantUsers ? `${variantUsers.toLocaleString()} variant` : `${exp.trafficSplit}% variant`}
    </span>
  </div>

  <!-- Metrics table -->
  <div class="exp-metrics">
    <div class="exp-metrics-label">Results</div>

    <!-- Header row -->
    <div class="exp-metric-row header-row">
      <span>Metric</span>
      <span style="text-align:right">Control</span>
      <span style="text-align:right">Variant</span>
      <span style="text-align:right">Lift</span>
      <span style="text-align:right">p-value</span>
      <span>Confidence</span>
      <span style="text-align:right">Status</span>
    </div>

    <!-- Primary metric row -->
    <div class="exp-metric-row">
      <span class="exp-metric-name">${exp.primaryMetricLabel} <span style="font-size:.68rem;color:var(--dim);">(primary)</span></span>
      <span class="exp-metric-val">${isDraft ? '—' : fmtPct(stats.controlRate)}</span>
      <span class="exp-metric-val">${isDraft ? '—' : fmtPct(stats.variantRate)}</span>
      <span class="exp-lift ${isDraft ? 'neu' : liftClass(stats.lift, stats.significant)}">${isDraft ? '—' : fmtLift(stats.lift)}</span>
      <span class="exp-pval">${isDraft ? '—' : (stats.pValue !== null ? stats.pValue : '—')}</span>
      <div class="exp-sig-bar" title="${stats.confidencePct}% confidence">
        <div class="exp-sig-fill ${stats.significant ? 'sig' : 'insig'}"
             style="width:${isDraft ? 0 : stats.confidencePct}%"></div>
      </div>
      <span class="exp-verdict ${isDraft ? 'neutral' : verdictClass(stats, isRunning || isCompleted)}">
        ${isDraft ? 'Draft' : verdictText(stats, isRunning || isCompleted)}
      </span>
    </div>

    ${exp.guardrails.includes('bounce_rate') ? `
    <!-- Bounce rate guardrail row — monitored manually in GA4 -->
    <div class="exp-metric-row" style="opacity:.65;">
      <span class="exp-metric-name">Bounce rate <span style="font-size:.68rem;color:var(--dim);">(guardrail)</span></span>
      <span class="exp-metric-val" style="font-size:.7rem;color:var(--dim);" colspan="5">Monitor in GA4 → stop if variant &gt;5% higher than control</span>
      <span class="exp-metric-val"></span>
      <span class="exp-lift neu"></span>
      <span class="exp-pval"></span>
      <div class="exp-sig-bar"></div>
      <span class="exp-verdict neutral" style="font-size:.68rem;">Manual</span>
    </div>` : ''}
  </div>

  ${isDraft ? `
  <!-- Draft state: show variant descriptions -->
  <div class="exp-guardrails">
    <div class="exp-guardrails-label">Variant Descriptions</div>
    <div class="exp-guardrail-row">
      <span class="exp-guardrail-icon" style="color:var(--muted);">A</span>
      <span><strong style="color:var(--muted);">${exp.control.label}:</strong> ${exp.control.description}</span>
    </div>
    <div class="exp-guardrail-row">
      <span class="exp-guardrail-icon" style="color:var(--orange);">B</span>
      <span><strong style="color:var(--muted);">${exp.variant.label}:</strong> ${exp.variant.description}</span>
    </div>
    ${exp.notes ? `<div class="exp-guardrail-row" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border);">
      <span class="exp-guardrail-icon" style="color:var(--dim);">i</span>
      <span style="color:var(--dim);font-size:.74rem;">${exp.notes}</span>
    </div>` : ''}
  </div>
  ` : ''}

  <!-- Actions -->
  <div class="exp-actions">
    ${isRunning && stats.significant && stats.lift > 0 ? `
      <a class="btn-exp-action btn-exp-rollout"
         href="https://console.firebase.google.com/project/why57-ab/config/experiment${exp.firebaseExpId ? '/results/' + exp.firebaseExpId : 's'}"
         target="_blank" rel="noopener"
         title="Open Firebase to stop the experiment, then push rc-active.json with the winning variant value">
        Roll Out Winner ↗
      </a>
    ` : ''}
    ${isRunning ? `
      <a class="btn-exp-action btn-exp-stop"
         href="https://console.firebase.google.com/project/why57-ab/config/experiment/results/${exp.firebaseExpId || ''}"
         target="_blank" rel="noopener">
        Stop Experiment ↗
      </a>
    ` : ''}
    ${isDraft ? `
      <a class="btn-exp-action btn-exp-rollout"
         href="https://console.firebase.google.com/project/why57-ab/config/experiment/create"
         target="_blank" rel="noopener">
        Start in Firebase →
      </a>
    ` : ''}
    <a class="btn-exp-action btn-exp-firebase"
       href="https://console.firebase.google.com/project/why57-ab/config/experiment${exp.firebaseExpId ? '/results/' + exp.firebaseExpId : 's'}"
       target="_blank" rel="noopener">
      Open in Firebase ↗
    </a>
  </div>
</div>`;
}

/* ═══════════════════════════════════════════════════════════
   ENTRY POINT — called by switchView() in dashboard.html
═══════════════════════════════════════════════════════════ */

let _experimentsLoaded = false;

window.loadExperiments = async function loadExperiments(token, cfg) {
  // Only fetch once per session (data changes slowly)
  if (_experimentsLoaded) return;

  const container = document.getElementById('exp-cards-container');
  if (!container) return;

  // Update running count badge while data loads
  const running   = EXPERIMENT_REGISTRY.filter(e => e.status === 'running').length;
  const completed = EXPERIMENT_REGISTRY.filter(e => e.status === 'completed').length;
  const draft     = EXPERIMENT_REGISTRY.filter(e => e.status === 'draft').length;

  const badge = document.getElementById('exp-running-count');
  if (badge) badge.textContent = running || draft;

  const runningEl   = document.getElementById('exp-count-running');
  const completedEl = document.getElementById('exp-count-completed');
  const draftEl     = document.getElementById('exp-count-draft');
  if (runningEl)   runningEl.textContent   = `${running} running`;
  if (completedEl) completedEl.textContent = `${completed} completed`;
  if (draftEl)     draftEl.textContent     = `${draft} draft`;

  // Fetch GA4 data (only if authenticated + custom dimensions registered)
  let impressions = {};
  let conversions = {};

  if (token && cfg?.propertyId) {
    try {
      const [impData, ...convDataArr] = await Promise.all([
        fetchImpressionData(token, cfg.propertyId, 90),
        // Fetch conversions for each unique primary metric
        ...([...new Set(EXPERIMENT_REGISTRY.map(e => e.primaryMetric))].map(
          event => fetchConversionData(token, cfg.propertyId, 90, event)
        )),
      ]);

      impressions = parseGA4Rows(impData);

      // Merge conversion data by event type
      const convEvents = [...new Set(EXPERIMENT_REGISTRY.map(e => e.primaryMetric))];
      convDataArr.forEach((data, i) => {
        const parsed = parseGA4Rows(data);
        // Map back to experiment IDs that use this metric
        EXPERIMENT_REGISTRY
          .filter(e => e.primaryMetric === convEvents[i])
          .forEach(exp => {
            conversions[exp.id] = parsed[exp.id] || {};
          });
      });

      // Mark loaded only after a successful fetch
      _experimentsLoaded = true;
    } catch (err) {
      console.warn('[why57] Experiment GA4 fetch failed:', err.message);
      // Render with empty data — cards still show structure
      // _experimentsLoaded stays false so a refresh can retry
    }
  }

  // Render all experiment cards
  container.innerHTML = EXPERIMENT_REGISTRY.map(exp =>
    renderExperimentCard(exp, impressions, conversions)
  ).join('');
};

/* ═══════════════════════════════════════════════════════════
   EXPERIMENT LIFECYCLE — quick reference
   All start/stop actions happen in Firebase Console.
   Dashboard buttons deep-link directly to the right page.

   START:  Firebase Console → A/B Testing → Create Experiment
           Then set status: 'running' + startDate in EXPERIMENT_REGISTRY

   STOP:   Firebase Console → experiment results → Stop
           Then set status: 'completed' + endDate in EXPERIMENT_REGISTRY

   ROLL OUT WINNER:
           1. Edit experiments/rc-active.json — change the winning
              param's defaultValue to the winning variant's value
           2. firebase remoteconfig:set experiments/rc-active.json
           3. Stop the experiment in Firebase Console
           4. Set status: 'completed' in EXPERIMENT_REGISTRY
═══════════════════════════════════════════════════════════ */
