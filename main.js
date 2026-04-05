/* ─── Cursor spotlight ─────────────────────────────────── */
function trackEvent(eventName, detail = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...detail
  });

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, detail);
  }
}

const spotlightEl = document.getElementById('spotlightCursor');
if (spotlightEl) {
  document.addEventListener('mousemove', (e) => {
    spotlightEl.style.setProperty('--cx', e.clientX + 'px');
    spotlightEl.style.setProperty('--cy', e.clientY + 'px');
  });
}

/* ─── Scroll reveal (Intersection Observer) ──────────────── */
const reveals = document.querySelectorAll('.fade-up');
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);
reveals.forEach((el) => io.observe(el));

/* ─── Mobile nav ──────────────────────────────────────────── */
const burger   = document.getElementById('navBurger');
const navLinks = document.getElementById('navLinks');

function closeNav() {
  navLinks?.classList.remove('open');
  burger?.classList.remove('open');
  burger?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

burger?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

// Close on link click
navLinks?.querySelectorAll('a').forEach((a) => {
  a.addEventListener('click', closeNav);
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeNav();
});


/* ─── Nav shadow on scroll ────────────────────────────────── */
const navEl = document.getElementById('nav');
const onScroll = () => {
  navEl?.classList.toggle('nav--scrolled', window.scrollY > 10);
};
window.addEventListener('scroll', onScroll, { passive: true });

/* ─── Smooth anchor scroll ────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ─── Stat counter animation ──────────────────────────────── */
const statNums = document.querySelectorAll('.stat-n, .big-num, .result-row-item .metric-n, .cs-glass-num');
const countIO  = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el    = e.target;
      
      const txt = el.textContent.trim();
      const parts = [];
      let re = /([0-9.,]+)/g;
      let lastIdx = 0;
      let match;
      
      while ((match = re.exec(txt)) !== null) {
        if (match.index > lastIdx) parts.push({ type: 'str', val: txt.substring(lastIdx, match.index) });
        parts.push({ type: 'num', end: parseFloat(match[1].replace(/,/g, '')), origStr: match[1] });
        lastIdx = re.lastIndex;
      }
      if (lastIdx < txt.length) parts.push({ type: 'str', val: txt.substring(lastIdx) });

      // Only animate if we found numbers
      if (!parts.some(p => p.type === 'num' && !isNaN(p.end))) {
        countIO.unobserve(el);
        return;
      }
      
      let start = 0;
      const dur = 1400;
      const step = (ts) => {
        if (!start) start = ts;
        const pct = Math.min((ts - start) / dur, 1);
        const ease = 1 - Math.pow(1 - pct, 3);
        
        let out = '';
        for (const p of parts) {
          if (p.type === 'str') {
            out += p.val;
          } else if (isNaN(p.end)) {
            out += p.origStr; // fallback for unparseable chunks
          } else {
            const currentNum = p.end < 50 ? (ease * p.end).toFixed(p.end % 1 !== 0 ? 1 : 0) : Math.round(ease * p.end);
            out += p.end >= 1000 ? currentNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : currentNum;
          }
        }
        
        el.textContent = out;
        if (pct < 1) requestAnimationFrame(step);
      };
      
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
statNums.forEach((el) => countIO.observe(el));

/* ─── Guided intake ─────────────────────────────────────── */
const intakePlanner = document.getElementById('intakePlanner');
if (intakePlanner) {
  const intakeQuestions = Array.from(intakePlanner.querySelectorAll('.intake-question'));
  const intakeSummary = document.getElementById('intakeSummary');
  const intakeBack = document.getElementById('intakeBack');
  const intakeReset = document.getElementById('intakeReset');
  const intakeProgressLabel = document.getElementById('intakeProgressLabel');
  const intakeProgressFill = document.getElementById('intakeProgressFill');
  const intakePrimaryLink = document.getElementById('intakePrimaryLink');
  const intakeSecondaryLink = document.getElementById('intakeSecondaryLink');
  const intakeRecommendationTitle = document.getElementById('intakeRecommendationTitle');
  const intakeRecommendationCopy = document.getElementById('intakeRecommendationCopy');
  const intakePainTag = document.getElementById('intakePainTag');
  const intakeTeamTag = document.getElementById('intakeTeamTag');
  const intakeGoalTag = document.getElementById('intakeGoalTag');

  const intakeLabels = {
    pain: {
      manual_work: 'Manual work',
      disconnected_tools: 'Disconnected tools',
      reviews: 'Review growth',
      client_experience: 'Client experience'
    },
    team: {
      solo: 'Solo or founder-led',
      small: '2 to 10 people',
      mid: '11 to 50 people',
      large: '50 plus people'
    },
    goal: {
      automate: 'Automate a workflow',
      replace: 'Replace spreadsheets',
      portal: 'Launch a portal',
      reviews: 'Grow reviews'
    }
  };

  const intakeState = {
    step: 0,
    pain: null,
    team: null,
    goal: null
  };

  function getIntakeRecommendation() {
    if (intakeState.pain === 'reviews' || intakeState.goal === 'reviews') {
      return {
        title: 'Request a 57Seconds demo',
        copy: 'Your answers sound like a reputation problem, not a generic software problem. The strongest next move is a focused conversation around agent-triggered review growth and rollout strategy.',
        primaryLabel: 'Request a Demo',
        primaryHref: 'https://calendar.app.google/93NLV73sQd1DXuUB6',
        primaryType: 'booking',
        secondaryLabel: 'See Review Results',
        secondaryHref: '#results'
      };
    }

    if (intakeState.goal === 'portal' || intakeState.pain === 'client_experience') {
      return {
        title: 'Book a scoped strategy call',
        copy: 'This looks like a custom build conversation. We should map user roles, client experience, and the smallest portal worth launching before estimating anything deeper.',
        primaryLabel: 'Book a Strategy Call',
        primaryHref: 'https://calendar.app.google/93NLV73sQd1DXuUB6',
        primaryType: 'booking',
        secondaryLabel: 'See Our Process',
        secondaryHref: '#process'
      };
    }

    if (
      intakeState.team === 'solo' ||
      intakeState.team === 'small' ||
      intakeState.goal === 'automate' ||
      intakeState.pain === 'manual_work'
    ) {
      return {
        title: 'Start with the ROI calculator',
        copy: 'You likely have a focused automation opportunity with a strong payback story. Run the estimate first, then bring the numbers into a call so we can scope the smartest first release.',
        primaryLabel: 'Try the ROI Calculator',
        primaryHref: 'https://roi.why57.com/?utm_source=why57&utm_medium=intake_primary&utm_campaign=main_site_referral',
        primaryType: 'roi',
        secondaryLabel: 'Book a Strategy Call',
        secondaryHref: 'https://calendar.app.google/93NLV73sQd1DXuUB6'
      };
    }

    return {
      title: 'Talk through the operating system',
      copy: 'This feels bigger than a single automation. A short strategy call is the fastest way to sort out whether you need an integration layer, a custom ops platform, or a staged hybrid approach.',
      primaryLabel: 'Book a Strategy Call',
      primaryHref: 'https://calendar.app.google/93NLV73sQd1DXuUB6',
      primaryType: 'booking',
      secondaryLabel: 'See the Results',
      secondaryHref: '#results'
    };
  }

  function updateIntakeView() {
    const totalSteps = intakeQuestions.length;

    intakeQuestions.forEach((question, index) => {
      const active = index === intakeState.step;
      question.hidden = !active;
      question.classList.toggle('is-active', active);
    });

    const summaryReady = Boolean(intakeState.pain && intakeState.team && intakeState.goal);

    if (intakeSummary) {
      intakeSummary.hidden = !summaryReady;
    }

    if (summaryReady) {
      intakeQuestions.forEach((question) => {
        question.hidden = true;
      });

      const recommendation = getIntakeRecommendation();

      intakeRecommendationTitle.textContent = recommendation.title;
      intakeRecommendationCopy.textContent = recommendation.copy;
      intakePainTag.textContent = intakeLabels.pain[intakeState.pain];
      intakeTeamTag.textContent = intakeLabels.team[intakeState.team];
      intakeGoalTag.textContent = intakeLabels.goal[intakeState.goal];

      intakePrimaryLink.textContent = recommendation.primaryLabel;
      intakePrimaryLink.href = recommendation.primaryHref;
      intakePrimaryLink.dataset.intent = recommendation.primaryType;
      intakePrimaryLink.dataset.ctaLocation = 'intake_primary';
      intakePrimaryLink.toggleAttribute('data-roi-link', recommendation.primaryType === 'roi');
      if (recommendation.primaryType === 'roi') {
        intakePrimaryLink.dataset.baseHref = recommendation.primaryHref;
      } else {
        delete intakePrimaryLink.dataset.baseHref;
      }

      intakeSecondaryLink.textContent = recommendation.secondaryLabel;
      intakeSecondaryLink.href = recommendation.secondaryHref;
      if (recommendation.secondaryHref.startsWith('http')) {
        intakeSecondaryLink.setAttribute('target', '_blank');
        intakeSecondaryLink.setAttribute('rel', 'noopener');
      } else {
        intakeSecondaryLink.removeAttribute('target');
        intakeSecondaryLink.removeAttribute('rel');
      }

      trackEvent('intake_completed', {
        pain: intakeState.pain,
        team: intakeState.team,
        goal: intakeState.goal,
        recommendation: recommendation.primaryType
      });
    }

    if (intakeProgressLabel) {
      intakeProgressLabel.textContent = summaryReady
        ? 'Recommendation ready'
        : `Step ${intakeState.step + 1} of ${totalSteps}`;
    }

    if (intakeProgressFill) {
      const pct = summaryReady
        ? 100
        : ((intakeState.step + 1) / totalSteps) * 100;
      intakeProgressFill.style.width = `${pct}%`;
    }

    if (intakeBack) {
      intakeBack.hidden = intakeState.step === 0 && !summaryReady;
      intakeBack.textContent = summaryReady ? 'Edit Answers' : 'Back';
    }
    if (intakeReset) {
      intakeReset.hidden = !summaryReady;
    }
  }

  intakePlanner.querySelectorAll('.intake-option').forEach((option) => {
    option.addEventListener('click', () => {
      const { group, value } = option.dataset;
      intakeState[group] = value;

      intakePlanner.querySelectorAll(`.intake-option[data-group="${group}"]`).forEach((candidate) => {
        candidate.classList.toggle('is-selected', candidate === option);
      });

      if (intakeState.step < intakeQuestions.length - 1) {
        intakeState.step += 1;
      }

      trackEvent('intake_option_selected', {
        group,
        value,
        step: intakeState.step
      });

      updateIntakeView();
    });
  });

  intakeBack?.addEventListener('click', () => {
    if (Boolean(intakeState.pain && intakeState.team && intakeState.goal)) {
      intakeState.goal = null;
      intakeState.step = intakeQuestions.length - 1;
      intakePlanner.querySelectorAll('.intake-option[data-group="goal"]').forEach((option) => {
        option.classList.remove('is-selected');
      });
      updateIntakeView();
      return;
    }

    intakeState.step = Math.max(0, intakeState.step - 1);
    updateIntakeView();
  });

  intakeReset?.addEventListener('click', () => {
    intakeState.step = 0;
    intakeState.pain = null;
    intakeState.team = null;
    intakeState.goal = null;
    intakePlanner.querySelectorAll('.intake-option').forEach((option) => {
      option.classList.remove('is-selected');
    });
    updateIntakeView();
  });

  intakePrimaryLink?.addEventListener('click', () => {
    trackEvent('intake_primary_clicked', {
      intent: intakePrimaryLink.dataset.intent || 'roi'
    });
  });

  intakeSecondaryLink?.addEventListener('click', () => {
    trackEvent('intake_secondary_clicked', {
      href: intakeSecondaryLink.getAttribute('href')
    });
  });

  updateIntakeView();
}

/* ─── Service + result drill-downs ───────────────────────── */
function bindDisclosureButtons(buttonSelector, cardSelector, detailSelector, eventName) {
  document.querySelectorAll(buttonSelector).forEach((button, index) => {
    const card = button.closest(cardSelector);
    const detail = card?.querySelector(detailSelector);
    const heading = card?.querySelector('h3');

    if (detail) {
      const detailId = detail.id || `${eventName}-${index + 1}`;
      detail.id = detailId;
      button.setAttribute('aria-controls', detailId);
    }

    if (heading && detail) {
      const labelId = heading.id || `${detail.id}-label`;
      heading.id = labelId;
      detail.setAttribute('aria-labelledby', labelId);
    }

    button.addEventListener('click', () => {
      const card = button.closest(cardSelector);
      const detail = card?.querySelector(detailSelector);
      if (!card || !detail) return;

      const open = button.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll(cardSelector).forEach((candidate) => {
        if (candidate === card) return;
        candidate.classList.remove('is-open');
        const candidateButton = candidate.querySelector(buttonSelector);
        const candidateDetail = candidate.querySelector(detailSelector);
        candidateButton?.setAttribute('aria-expanded', 'false');
        if (candidateDetail) candidateDetail.hidden = true;
      });

      card.classList.toggle('is-open', !open);
      button.setAttribute('aria-expanded', String(!open));
      detail.hidden = open;

      trackEvent(eventName, {
        label: card.querySelector('h3')?.textContent?.trim() || 'card',
        open: !open
      });
    });
  });
}

bindDisclosureButtons('.svc-toggle', '.svc-card', '.svc-detail', 'service_detail_toggled');
bindDisclosureButtons('.result-toggle', '.result-card', '.result-breakdown', 'result_breakdown_toggled');

/* ─── Manual carousels ───────────────────────────────────── */
function bindManualCarousel({
  windowId,
  trackSelector,
  prevId,
  nextId,
  statusId,
  eventName
}) {
  const carouselWindow = document.getElementById(windowId);
  if (!carouselWindow) return;

  const track = carouselWindow.querySelector(trackSelector);
  const slides = Array.from(track?.children || []);
  const prev = document.getElementById(prevId);
  const next = document.getElementById(nextId);
  const status = document.getElementById(statusId);
  let index = 0;

  function getMetrics() {
    if (!track || !slides.length) {
      return { stepWidth: 0, visibleCount: 1, maxIndex: 0 };
    }

    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = Number.parseFloat(window.getComputedStyle(track).gap || '0');
    const stepWidth = slideWidth + gap;
    const visibleCount = Math.max(1, Math.floor((carouselWindow.getBoundingClientRect().width + gap) / stepWidth));
    const maxIndex = Math.max(0, slides.length - visibleCount);

    return { stepWidth, visibleCount, maxIndex };
  }

  function updateCarousel(shouldTrack = false) {
    const { stepWidth, visibleCount, maxIndex } = getMetrics();
    index = Math.min(index, maxIndex);

    if (track) {
      track.style.transform = `translateX(-${index * stepWidth}px)`;
    }

    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === maxIndex;
    if (status) {
      const start = index + 1;
      const end = Math.min(index + visibleCount, slides.length);
      status.textContent = visibleCount > 1
        ? `${start}-${end} / ${slides.length}`
        : `${start} / ${slides.length}`;
    }

    if (shouldTrack) {
      trackEvent(eventName, {
        index: index + 1,
        title: slides[index]?.querySelector('h3')?.textContent?.trim() || 'slide'
      });
    }
  }

  prev?.addEventListener('click', () => {
    if (index === 0) return;
    index -= 1;
    updateCarousel(true);
  });

  next?.addEventListener('click', () => {
    const { maxIndex } = getMetrics();
    if (index >= maxIndex) return;
    index += 1;
    updateCarousel(true);
  });

  carouselWindow.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev?.click();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next?.click();
    }
  });

  window.addEventListener('resize', () => {
    updateCarousel();
  });

  updateCarousel();
}

bindManualCarousel({
  windowId: 'resultsCarousel',
  trackSelector: '.results-carousel-track',
  prevId: 'resultsCarouselPrev',
  nextId: 'resultsCarouselNext',
  statusId: 'resultsCarouselStatus',
  eventName: 'results_carousel_changed'
});

bindManualCarousel({
  windowId: 'testiCarousel',
  trackSelector: '.testi-track',
  prevId: 'testiCarouselPrev',
  nextId: 'testiCarouselNext',
  statusId: 'testiCarouselStatus',
  eventName: 'testimonial_carousel_changed'
});

/* ─── Fit toggle ─────────────────────────────────────────── */
const fitTabs = Array.from(document.querySelectorAll('.fit-tab'));
if (fitTabs.length) {
  const fitCards = Array.from(document.querySelectorAll('.fit-card'));

  function activateFitTab(tab, shouldFocus = false) {
    const target = tab.dataset.fitTarget;

    fitTabs.forEach((candidate) => {
      const active = candidate === tab;
      candidate.classList.toggle('is-active', active);
      candidate.setAttribute('aria-selected', String(active));
      candidate.tabIndex = active ? 0 : -1;
    });

    fitCards.forEach((card) => {
      const active = card.id === target;
      card.classList.toggle('is-active', active);
      card.hidden = !active;
    });

    if (shouldFocus) {
      tab.focus();
    }

    trackEvent('fit_tab_selected', { target });
  }

  fitTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activateFitTab(tab);
    });

    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End') {
        return;
      }

      event.preventDefault();

      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % fitTabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + fitTabs.length) % fitTabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = fitTabs.length - 1;

      activateFitTab(fitTabs[nextIndex], true);
    });
  });
}

/* ─── ROI teaser ─────────────────────────────────────────── */
const roiHoursInput = document.getElementById('roiHoursInput');
const roiRateInput = document.getElementById('roiRateInput');
const roiPeopleInput = document.getElementById('roiPeopleInput');

if (roiHoursInput && roiRateInput && roiPeopleInput) {
  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  const roiHoursValue = document.getElementById('roiHoursValue');
  const roiRateValue = document.getElementById('roiRateValue');
  const roiPeopleValue = document.getElementById('roiPeopleValue');
  const roiTeaserMonthly = document.getElementById('roiTeaserMonthly');
  const roiTeaserAnnual = document.getElementById('roiTeaserAnnual');
  const roiTeaserRecommendation = document.getElementById('roiTeaserRecommendation');

  function getTeaserRecommendation(monthlyWaste) {
    if (monthlyWaste < 3000) return 'Tighten the current stack';
    if (monthlyWaste < 12000) return 'Hybrid build';
    return 'Custom software';
  }

  function updateRoiTeaser() {
    const hours = Number(roiHoursInput.value);
    const rate = Number(roiRateInput.value);
    const people = Number(roiPeopleInput.value);
    const monthlyWaste = hours * rate * people * 4.33;
    const annualWaste = monthlyWaste * 12;
    const recommendation = getTeaserRecommendation(monthlyWaste);

    roiHoursValue.textContent = String(hours);
    roiRateValue.textContent = currency.format(rate);
    roiPeopleValue.textContent = String(people);
    roiTeaserMonthly.textContent = currency.format(monthlyWaste);
    roiTeaserAnnual.textContent = currency.format(annualWaste);
    roiTeaserRecommendation.textContent = recommendation;

    document.querySelectorAll('[data-base-href]').forEach((link) => {
      const baseHref = link.dataset.baseHref;
      if (!baseHref) return;
      const url = new URL(baseHref);
      url.searchParams.set('hours_lost', String(hours));
      url.searchParams.set('hourly_cost', String(rate));
      url.searchParams.set('people', String(people));
      url.searchParams.set('recommended_path', recommendation.toLowerCase().replace(/\s+/g, '_'));
      link.href = url.toString();
    });
  }

  [roiHoursInput, roiRateInput, roiPeopleInput].forEach((input) => {
    input.addEventListener('input', updateRoiTeaser);
  });

  updateRoiTeaser();
}
