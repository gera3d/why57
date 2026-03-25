/* ─── Cursor spotlight ─────────────────────────────────── */
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
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ─── Stat counter animation ──────────────────────────────── */
const statNums = document.querySelectorAll('.stat-n');
const countIO  = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el    = e.target;
      const raw   = el.textContent.replace(/[^0-9.]/g, '');
      const end   = parseFloat(raw);
      const suffix = el.textContent.replace(/[0-9.]/g, '');
      if (isNaN(end)) return;
      let start = 0;
      const dur = 1400;
      const step = (ts) => {
        if (!start) start = ts;
        const pct = Math.min((ts - start) / dur, 1);
        const ease = 1 - Math.pow(1 - pct, 3);
        el.textContent = (end < 50 ? (ease * end).toFixed(end % 1 !== 0 ? 1 : 0) : Math.round(ease * end)) + suffix;
        if (pct < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
statNums.forEach((el) => countIO.observe(el));
