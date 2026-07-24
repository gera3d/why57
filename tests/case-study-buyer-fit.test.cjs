const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repositoryRoot = path.resolve(__dirname, "..");
const caseStudies = [
  {
    file: "health-for-california-review-engine.html",
    fit: "great service is happening, but it is not being captured",
    cta: "Talk through your review workflow",
    capabilities: ["Workflow design", "Automation + integration", "Operating visibility"]
  },
  {
    file: "drivesavers-seo-overhaul.html",
    fit: "your digital work is creating activity, but not a shared operating system",
    cta: "Map your connected growth system",
    capabilities: ["Conversion architecture", "Search foundation", "Growth operations"]
  },
  {
    file: "nuvolum-deployment-platform.html",
    fit: "custom delivery is limiting your capacity",
    cta: "Map your delivery bottleneck",
    capabilities: ["Product architecture", "Delivery automation", "QA + handoff"]
  },
  {
    file: "dent-experts-storm-ops-flow.html",
    fit: "field work gets rebuilt at every handoff",
    cta: "Map your field workflow",
    capabilities: ["Field-first product design", "Workflow + evidence", "Integrations + operations views"]
  },
  {
    file: "ux-owl-sonoma-attorneys.html",
    fit: "you are spending on marketing without a clear feedback loop",
    cta: "Map your lead journey",
    capabilities: ["Positioning + conversion pages", "Campaign + referral workflows", "Attribution + decisions"]
  }
];

function readCaseStudy(file) {
  return fs.readFileSync(path.join(repositoryRoot, "case-studies", file), "utf8");
}

test("every named case study translates proof into a buyer decision", () => {
  for (const study of caseStudies) {
    const html = readCaseStudy(study.file);
    const fitSection = html.match(/<section class="section section--alt" id="fit">([\s\S]*?)<\/section>/)?.[1];

    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${study.file} needs one clear headline`);
    assert.ok(fitSection, `${study.file} needs a buyer-fit section`);
    assert.match(fitSection, /Could This Work for You\?/, `${study.file} should frame the buyer question`);
    assert.match(fitSection, new RegExp(study.fit), `${study.file} should name the right customer situation`);
    assert.equal(
      (fitSection.match(/class="cs-capability-card"/g) || []).length,
      3,
      `${study.file} should show three concrete 57 capabilities`
    );
    assert.equal(
      (fitSection.match(/What 57 brings/g) || []).length,
      3,
      `${study.file} should identify 57's role in every capability card`
    );
    for (const capability of study.capabilities) {
      assert.match(fitSection, new RegExp(`<h3>${capability.replace(/[+]/g, "\\+")}<\\/h3>`));
    }
    assert.match(fitSection, new RegExp(`>${study.cta} <span>→<\\/span><\\/a>`));
    assert.match(
      fitSection,
      /href="https:\/\/calendly\.com\/yrc-strategies\/intro-call" target="_blank" rel="noopener"/,
      `${study.file} should retain a safe, direct next step`
    );
    assert.match(html, /href="\.\.\/style\.css\?v=5"/, `${study.file} should receive the current buyer-fit styles`);
  }
});

test("buyer-fit layout protects spacing and mobile readability", () => {
  const css = fs.readFileSync(path.join(repositoryRoot, "style.css"), "utf8");

  assert.match(
    css,
    /\.cs-capability-grid\{\s*display:grid;\s*grid-template-columns:repeat\(3,minmax\(0,1fr\)\);\s*gap:14px;\s*\}/,
    "desktop should present capabilities as a scan-friendly three-card row"
  );
  assert.match(
    css,
    /\.cs-fit-cta\{\s*display:flex;\s*width:fit-content;\s*margin-top:26px;\s*\}/,
    "the next-step CTA should remain separated from the capability cards"
  );
  assert.match(
    css,
    /@media\(max-width:960px\)\{[\s\S]*?\.cs-capability-grid\{grid-template-columns:1fr;\}/,
    "capability cards should stack before the layout gets cramped"
  );
  assert.match(
    css,
    /@media\(max-width:480px\)\{[\s\S]*?\.cs-fit-cta\{width:100%;justify-content:center;\}/,
    "the next step should stay easy to tap on a narrow screen"
  );
});
