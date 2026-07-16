async (page) => {
  const origin = page.url().split('/').slice(0, 3).join('/');
  const workerOrigin = 'https://why57-roi-intake.gera-695.workers.dev';
  const prototypeReceipt = 'a'.repeat(64);
  const noJsReceipt = 'b'.repeat(64);
  const context = page.context();

  await context.addInitScript(() => {
    window.__why57CollectedEvents = [];
    window.gtag = (...args) => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(args);
      if (args[0] === 'event') window.__why57CollectedEvents.push(args[1]);
    };
  });

  await context.route('https://www.googletagmanager.com/**', (route) => route.abort());

  const collectedCount = async (target, eventName) => target.evaluate(
    (name) => window.__why57CollectedEvents.filter((event) => event === name).length,
    eventName
  );

  const fillPrototype = async (target) => {
    await target.locator('#prototypeName').fill('Local QA');
    await target.locator('#prototypeEmail').fill('qa@example.com');
    await target.locator('#prototypeTool').selectOption('claude');
    await target.locator('#prototypeDescription').fill('A local browser fixture for reviewing the delivery and analytics contract.');
    await target.locator('#prototypeReviewDetails').evaluate((element) => { element.open = true; });
    await target.locator('#prototypeUsers').selectOption('testers_1_10');
    await target.locator('#prototypeTargetDate').selectOption('one_to_three_months');
    await target.locator('#prototypeBlocker').fill('We need to verify the production delivery boundary safely.');
    await target.locator('#prototypeConsent').check();
  };

  const runEnhancedCase = async ({ mode, expectedCount }) => {
    const target = await context.newPage();
    let receiptClaims = 0;
    let submissions = 0;

    await target.route(`${workerOrigin}/**`, async (route) => {
      const requestPath = route.request().url().slice(workerOrigin.length).split('?')[0];
      if (requestPath === '/conversion-receipt') {
        receiptClaims += 1;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true,
            claimed: receiptClaims === 1,
            event_type: 'prototype_review_submitted',
            submission_id: 'local-prototype-submission',
            reference: 'LOCALQA01'
          })
        });
      }

      if (requestPath === '/prototype-review') {
        submissions += 1;
        if (mode === 'delivery_failure') {
          return route.fulfill({
            status: 502,
            contentType: 'application/json',
            body: JSON.stringify({ ok: false, error: 'delivery_failed' })
          });
        }
        if (mode === 'honeypot') {
          return route.fulfill({
            status: 202,
            contentType: 'application/json',
            body: JSON.stringify({ ok: true, stored: false, forwarded: false, filtered: true })
          });
        }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true,
            id: 'local-prototype-submission',
            stored: true,
            forwarded: true,
            receipt: prototypeReceipt
          })
        });
      }

      return route.fulfill({ status: 404, body: 'Not found' });
    });

    await target.setViewportSize({ width: 390, height: 844 });
    await target.goto(`${origin}/ai-app-prototype-to-production.html#send-prototype`, { waitUntil: 'domcontentloaded' });
    await fillPrototype(target);
    if (mode === 'honeypot') {
      await target.locator('#prototypeWebsite').evaluate((input) => { input.value = 'bot.example'; });
    }
    await target.locator('#prototypeSubmit').click();

    if (mode === 'success') {
      await target.locator('#prototypeReviewSuccess').waitFor({ state: 'visible' });
      if (receiptClaims !== 1) throw new Error(`enhanced success claimed ${receiptClaims} receipts`);
    } else {
      await target.locator('#prototypeReviewError').waitFor({ state: 'visible' });
      if (receiptClaims !== 0) throw new Error(`${mode} unexpectedly claimed a receipt`);
    }

    const count = await collectedCount(target, 'prototype_review_submitted');
    if (count !== expectedCount) throw new Error(`${mode} collected ${count} prototype conversions`);
    if (submissions !== 1) throw new Error(`${mode} made ${submissions} submission requests`);
    await target.close();
  };

  await runEnhancedCase({ mode: 'success', expectedCount: 1 });
  await runEnhancedCase({ mode: 'delivery_failure', expectedCount: 0 });
  await runEnhancedCase({ mode: 'honeypot', expectedCount: 0 });

  const thankYou = await context.newPage();
  let validReceiptClaims = 0;
  await thankYou.route(`${workerOrigin}/conversion-receipt`, async (route) => {
    const { receipt } = JSON.parse(route.request().postData() || '{}');
    if (receipt !== noJsReceipt) {
      return route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'receipt_not_found' })
      });
    }
    validReceiptClaims += 1;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        claimed: validReceiptClaims === 1,
        event_type: 'prototype_review_submitted',
        submission_id: 'local-no-js-submission',
        reference: 'LOCALQA02'
      })
    });
  });

  await thankYou.goto(`${origin}/prototype-review-thank-you.html?receipt=${'f'.repeat(64)}`, { waitUntil: 'domcontentloaded' });
  await thankYou.waitForTimeout(100);
  if (await collectedCount(thankYou, 'prototype_review_submitted') !== 0) {
    throw new Error('forged receipt collected a prototype conversion');
  }

  await thankYou.goto(`${origin}/prototype-review-thank-you.html?receipt=${noJsReceipt}`, { waitUntil: 'domcontentloaded' });
  await thankYou.locator('#thanksReference').filter({ hasText: 'LOCALQA02' }).waitFor();
  if (await collectedCount(thankYou, 'prototype_review_submitted') !== 1) {
    throw new Error('valid no-JS receipt did not collect exactly one conversion');
  }

  await thankYou.reload({ waitUntil: 'domcontentloaded' });
  await thankYou.waitForTimeout(100);
  if (await collectedCount(thankYou, 'prototype_review_submitted') !== 0) {
    throw new Error('consumed no-JS receipt collected again after reload');
  }
  if (validReceiptClaims !== 2) throw new Error(`expected two receipt validation attempts, received ${validReceiptClaims}`);
  await thankYou.close();

  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await mobile.goto(`${origin}/ai-app-prototype-to-production.html#send-prototype`, { waitUntil: 'domcontentloaded' });
  const mobileState = await mobile.evaluate(() => {
    const formCard = document.querySelector('.review-form-card').getBoundingClientRect();
    const reviewCopy = document.querySelector('.review-copy').getBoundingClientRect();
    const details = document.querySelector('#prototypeReviewDetails');
    const requiredNames = [...document.querySelectorAll('#prototypeReviewForm [required]')].map((field) => field.name);
    return {
      formBeforeCopy: formCard.top < reviewCopy.top,
      detailsClosed: !details.open,
      requiredNames,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth
    };
  });
  const required = ['name', 'email', 'tool', 'prototype_description', 'current_users', 'target_date', 'blocker', 'consent'];
  if (!mobileState.formBeforeCopy) throw new Error('390px prototype form is not ordered before review copy');
  if (!mobileState.detailsClosed) throw new Error('390px progressive review context starts expanded');
  if (mobileState.scrollWidth > mobileState.viewportWidth + 1) throw new Error('390px prototype page has horizontal overflow');
  for (const name of required) {
    if (!mobileState.requiredNames.includes(name)) throw new Error(`required safety/lead field weakened: ${name}`);
  }
  await mobile.close();

  return 'Prototype funnel smoke passed: enhanced success exactly once; delivery failure and honeypot fail closed; forged receipt rejected; no-JS receipt exactly once; 390x844 progressive form contract preserved.';
}
