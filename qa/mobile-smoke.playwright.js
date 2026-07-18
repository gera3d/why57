async (page) => {
  const origin = page.url().split('/').slice(0, 3).join('/');
  const paths = [
    '/',
    '/ai-app-prototype-to-production.html',
    '/government-capabilities.html',
    '/sonoma-county-software-development.html',
    '/case-studies/review-request-workflow.html'
  ];
  const results = [];

  await page.setViewportSize({ width: 390, height: 844 });

  for (const path of paths) {
    const pageErrors = [];
    const onPageError = (error) => pageErrors.push(error.message);
    page.on('pageerror', onPageError);

    const response = await page.goto(`${origin}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const state = await page.evaluate(() => {
      const burger = document.getElementById('navBurger');
      const visible = (element) => {
        if (!element) return false;
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      };
      const primaryCta = [...document.querySelectorAll(
        'a[href^="https://calendar.app.google/"], a[data-roi-link], a.btn-primary'
      )].find(visible);

      return {
        title: document.title.trim(),
        h1Count: document.querySelectorAll('h1').length,
        viewportWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyVisible: visible(document.body),
        primaryCtaVisible: visible(primaryCta),
        primaryCtaNamed: Boolean(primaryCta?.textContent.trim() || primaryCta?.getAttribute('aria-label')),
        burgerReady: burger ? visible(burger) && burger.getAttribute('aria-expanded') === 'false' : true
      };
    });

    page.off('pageerror', onPageError);
    const failures = [];
    if (!response || response.status() >= 400) failures.push(`HTTP ${response?.status() ?? 'no response'}`);
    if (!state.title) failures.push('empty title');
    if (state.h1Count !== 1) failures.push(`${state.h1Count} h1 elements`);
    if (!state.bodyVisible) failures.push('body not visible');
    if (!state.primaryCtaVisible || !state.primaryCtaNamed) failures.push('primary CTA not visible/named');
    if (!state.burgerReady) failures.push('mobile navigation trigger not ready');
    if (state.scrollWidth > state.viewportWidth + 1) {
      failures.push(`horizontal overflow ${state.scrollWidth}px > ${state.viewportWidth}px`);
    }
    if (pageErrors.length) failures.push(`page errors: ${pageErrors.join(' | ')}`);

    if (failures.length) throw new Error(`${path}: ${failures.join('; ')}`);
    results.push(`${path} (${state.viewportWidth}x844, scroll ${state.scrollWidth}px)`);
  }

  return `Mobile smoke passed:\n${results.join('\n')}`;
}
