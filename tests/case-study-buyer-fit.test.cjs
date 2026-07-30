const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repositoryRoot = path.resolve(__dirname, "..");
const caseStudies = [
  {
    file: "health-for-california-review-engine.html",
    fit: "great service is happening but the proof keeps disappearing",
    ctaLocation: "hfc_case_fit_call",
    artifact: "one sample customer interaction",
    visual: "endpoint-slope"
  },
  {
    file: "drivesavers-seo-overhaul.html",
    fit: "digital activity is high but accountability is fragmented",
    ctaLocation: "drivesavers_case_fit_call",
    artifact: "one recent inquiry path",
    visual: "evidence-small-multiples"
  },
  {
    file: "nuvolum-deployment-platform.html",
    fit: "custom delivery is valuable but repeated setup is limiting capacity",
    ctaLocation: "nuvolum_case_fit_call",
    artifact: "the current launch checklist",
    visual: "capacity-facets"
  },
  {
    file: "dent-experts-storm-ops-flow.html",
    fit: "field work gets rebuilt at every office handoff",
    ctaLocation: "dent_experts_case_fit_call",
    artifact: "one representative job or claim",
    visual: "shared-record-map"
  },
  {
    file: "ux-owl-sonoma-attorneys.html",
    fit: "marketing exists but the qualified-lead feedback loop does not",
    ctaLocation: "ux_owl_case_fit_call",
    artifact: "current analytics",
    visual: "lift-range"
  }
];

function readCaseStudy(file) {
  return fs.readFileSync(path.join(repositoryRoot, "case-studies", file), "utf8");
}

test("every named case study translates proof into a buyer decision", () => {
  for (const study of caseStudies) {
    const html = readCaseStudy(study.file);
    const fitSection = html.match(/<section class="section(?: section--alt)?" id="fit">([\s\S]*?)<\/section>/)?.[1];
    const approachSection = html.match(/<section class="section(?: section--alt)?" id="approach">([\s\S]*?)<\/section>/)?.[1];
    const resultsSection = html.match(/<section class="section(?: section--alt)?" id="results">([\s\S]*?)<\/section>/)?.[1];

    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${study.file} needs one clear headline`);
    assert.ok(fitSection, `${study.file} needs a buyer-fit section`);
    assert.match(fitSection, /Does This Sound Familiar\?/, `${study.file} should frame the buyer question in a natural voice`);
    assert.match(fitSection, new RegExp(study.fit), `${study.file} should name the right customer situation`);
    assert.equal(
      (fitSection.match(/class="case-fit-panel/g) || []).length,
      2,
      `${study.file} should show both likely-fit and not-yet conditions`
    );
    assert.match(fitSection, /Likely fit/);
    assert.match(fitSection, /Probably not yet/);
    assert.match(fitSection, new RegExp(study.artifact), `${study.file} should name evidence to bring`);
    assert.ok(approachSection, `${study.file} needs a differentiated approach section`);
    assert.equal(
      (approachSection.match(/class="case-decision-card"/g) || []).length,
      3,
      `${study.file} should explain three consequential decisions`
    );
    assert.match(approachSection, /You may be thinking:/, `${study.file} should resolve its primary objection in a natural voice`);
    assert.ok(resultsSection, `${study.file} needs a result section`);
    assert.equal(
      (resultsSection.match(/class="case-result-card"/g) || []).length,
      3,
      `${study.file} should separate result types`
    );
    assert.match(resultsSection, /case-evidence-note/, `${study.file} should retain a public-facing evidence qualifier`);
    assert.match(
      html,
      new RegExp(`href="https:\\/\\/calendar\\.app\\.google\\/93NLV73sQd1DXuUB6"[^>]+data-cta-location="${study.ctaLocation}"`),
      `${study.file} should use the current fit-call destination and analytics hook`
    );
    assert.match(html, /href="\.\.\/style\.css\?v=8"/, `${study.file} should receive the current case-study styles`);
    assert.equal((html.match(/class="case-proof-item"/g) || []).length, 3, `${study.file} should keep proof above the fold selective`);
    assert.match(html, /What We Changed/, `${study.file} should use Gera's direct problem-to-action voice`);
    assert.match(html, /What Changed/, `${study.file} should frame results in plain language`);
    assert.match(html, /Does This Sound Familiar\?/, `${study.file} should ask the buyer a direct fit question`);
    assert.match(html, /The practical lesson/, `${study.file} should end the story with a practical takeaway`);
    assert.match(html, /You may be thinking:/, `${study.file} should surface the buyer's obvious objection naturally`);
    assert.match(html, new RegExp(`data-visual="${study.visual}"`), `${study.file} should include its evidence-matched visual`);
    assert.match(html, /case-data-visual-head/, `${study.file} should give its visual an on-page explanation`);
    assert.match(html, /"dateModified": "2026-07-30"/, `${study.file} should update Article structured data`);
    assert.match(
      html,
      new RegExp(`"url": "https:\\/\\/why57\\.com\\/case-studies\\/${study.file.replace(".", "\\.")}"`),
      `${study.file} should expose its canonical URL in Article structured data`
    );
    for (const heroMetric of html.matchAll(/<span class="cs-glass-num[^"]*"([^>]*)>/g)) {
      assert.match(heroMetric[1], /data-static-number/, `${study.file} should never animate evidence-sensitive hero metrics through false intermediate values`);
    }
  }
});

test("case-study layout protects hierarchy and mobile readability", () => {
  const css = fs.readFileSync(path.join(repositoryRoot, "style.css"), "utf8");

  assert.match(
    css,
    /\.case-decision-grid\{[\s\S]*?grid-template-columns:repeat\(3,minmax\(0,1fr\)\);/,
    "desktop should present consequential decisions as a scan-friendly three-card row"
  );
  assert.match(
    css,
    /\.case-fit-grid\{[\s\S]*?grid-template-columns:1\.15fr \.85fr;/,
    "fit and not-yet conditions should be easy to compare"
  );
  assert.match(
    css,
    /@media\(max-width:960px\)\{[\s\S]*?\.case-split,[\s\S]*?\.case-fit-grid\{grid-template-columns:1fr;gap:22px;\}/,
    "case-study split layouts should stack before the layout gets cramped"
  );
  assert.match(
    css,
    /@media\(max-width:480px\)\{[\s\S]*?\.case-mechanism\{grid-template-columns:1fr;\}/,
    "workflow stages should become a single readable column on a narrow screen"
  );
  assert.match(css, /\.case-data-visual\{/, "case-study visuals should share a consistent visual system");
  assert.match(css, /\.case-facet-grid\{[\s\S]*?grid-template-columns:repeat\(2,minmax\(0,1fr\)\);/, "data facets should compare on desktop");
  assert.match(css, /@media\(max-width:480px\)\{[\s\S]*?\.case-facet-grid\{grid-template-columns:1fr;/, "data facets should stack on mobile");
  assert.match(css, /@media\(max-width:960px\)\{[\s\S]*?\.case-system-map\{grid-template-columns:1fr;/, "the shared-record map should reflow on smaller screens");
});

test("evidence-sensitive case-study metrics are excluded from the number animation", () => {
  const js = fs.readFileSync(path.join(repositoryRoot, "main.js"), "utf8");
  assert.match(js, /\.cs-glass-num:not\(\[data-static-number\]\)/);
});

test("final visual polish preserves evidence boundaries and accessibility context", () => {
  const health = readCaseStudy("health-for-california-review-engine.html");
  const nuvolum = readCaseStudy("nuvolum-deployment-platform.html");
  const drivesavers = readCaseStudy("drivesavers-seo-overhaul.html");
  const dentExperts = readCaseStudy("dent-experts-storm-ops-flow.html");
  const css = fs.readFileSync(path.join(repositoryRoot, "style.css"), "utf8");

  assert.match(health, /Client wording preserved as supplied\. The measured result below spans four years\./);
  assert.match(nuvolum, /case-scale case-scale--ceiling/);
  assert.match(drivesavers, /case-facet-grid" role="group"/);
  assert.match(drivesavers, /case-facet" role="img"/);
  assert.match(dentExperts, /case-map-boundary" role="note"/);
  assert.match(dentExperts, /External system boundary/);
  assert.match(css, /\.case-scale--ceiling \.case-scale-marker\{[\s\S]*?width:2px;[\s\S]*?height:24px;/);
});
