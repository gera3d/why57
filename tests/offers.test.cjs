const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repositoryRoot = path.resolve(__dirname, '..');
const pricing = fs.readFileSync(path.join(repositoryRoot, 'pricing.html'), 'utf8');
const audit = fs.readFileSync(path.join(repositoryRoot, 'operations-automation-audit.html'), 'utf8');
const home = fs.readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');
const sitemap = fs.readFileSync(path.join(repositoryRoot, 'sitemap.xml'), 'utf8');
const leadCapture = fs.readFileSync(path.join(repositoryRoot, 'lead-capture.js'), 'utf8');

function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&copy;', ' ')
    .replaceAll('&ndash;', '–')
    .replaceAll('&mdash;', '—')
    .replace(/\s+/g, ' ')
    .trim();
}

function jsonLd(html) {
  const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  assert.equal(matches.length, 1);
  return JSON.parse(matches[0][1]);
}

test('pricing and audit pages use the guarded Thread-1 form contract', () => {
  for (const [file, html, source] of [
    ['pricing.html', pricing, 'pricing_page'],
    ['operations-automation-audit.html', audit, 'operations_automation_audit']
  ]) {
    assert.match(html, new RegExp(`data-lead-form data-lead-source="${source}" hidden`), file);
    assert.match(html, /enabled: why57LocalLeadTest/, file);
    assert.match(html, /endpoint: why57LocalLeadTest[\s\S]*127\.0\.0\.1:8787\/v1\/leads[\s\S]*why57-roi-intake\.gera-695\.workers\.dev\/v1\/leads/, file);
    assert.match(html, /<script src="lead-capture\.js"><\/script>/, file);
    assert.match(html, /name="name"[^>]*required/, file);
    assert.match(html, /name="email"[^>]*required/, file);
    assert.match(html, /name="interest"/, file);
  }
});

test('public offer copy uses only owner-approved numbers', () => {
  const allowed = new Set(['57', '5,000', '25,000', '5k', '25k', '1,500', '2,500', '1.5k', '2.5k', '10', '2026']);

  for (const [file, html] of [['pricing.html', pricing], ['operations-automation-audit.html', audit]]) {
    const numbers = visibleText(html).match(/\b\d+(?:[,.]\d+)*(?:k|x|%)?\b/gi) || [];
    const unsupported = [...new Set(numbers.filter((value) => !allowed.has(value.toLowerCase())))];
    assert.deepEqual(unsupported, [], `${file} contains unsupported visible numbers: ${unsupported.join(', ')}`);
    assert.doesNotMatch(visibleText(html), /Health for California|DriveSavers|Nuvolum|UX Owl|Dent Experts|testimonial|five-star/i);
  }
});

test('offer terms, tiers, and structured data stay aligned', () => {
  assert.match(pricing, /\$5,000–\$25,000 fixed price/);
  assert.match(pricing, /Focused workflow/);
  assert.match(pricing, /Connected operations/);
  assert.match(pricing, /Internal operations tool/);

  assert.match(audit, /\$1,500–\$2,500/);
  assert.match(audit, /10 business days/);
  assert.match(audit, /credited toward any build/i);

  const pricingSchema = JSON.stringify(jsonLd(pricing));
  const auditSchema = JSON.stringify(jsonLd(audit));
  assert.match(pricingSchema, /"minPrice":"5000"/);
  assert.match(pricingSchema, /"maxPrice":"25000"/);
  assert.match(auditSchema, /"minPrice":"1500"/);
  assert.match(auditSchema, /"maxPrice":"2500"/);
  assert.match(auditSchema, /10 business days/);
});

test('offer pages are discoverable from the site and sitemap', () => {
  assert.match(home, /href="pricing\.html"/);
  assert.match(home, /href="operations-automation-audit\.html"/);
  assert.match(sitemap, /https:\/\/why57\.com\/pricing\.html/);
  assert.match(sitemap, /https:\/\/why57\.com\/operations-automation-audit\.html/);
});

test('same-site offer links do not use internal campaign parameters', () => {
  for (const [file, html] of [['pricing.html', pricing], ['operations-automation-audit.html', audit]]) {
    const hrefs = [...html.matchAll(/href="([^"]+)"/gi)].map((match) => match[1]);
    const internalCampaignLinks = hrefs.filter((href) =>
      !/^https?:\/\//i.test(href) && /[?&]utm_(?:source|medium|campaign|content|term)=/i.test(href)
    );
    assert.deepEqual(internalCampaignLinks, [], `${file} contains internal UTM links`);
  }
});

test('lead confirmations distinguish test delivery from a dry run', () => {
  assert.match(leadCapture, /result\.delivery_mode === 'test'/);
  assert.match(leadCapture, /Email delivery was limited to the approved test inbox/);
  assert.match(leadCapture, /Dry run accepted\. No email, alert, or spreadsheet delivery was sent/);
});
