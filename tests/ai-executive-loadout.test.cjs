const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repositoryRoot = path.resolve(__dirname, '..');
const homepage = fs.readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');
const cookbook = fs.readFileSync(path.join(repositoryRoot, 'ai-execution-cookbook.html'), 'utf8');
const cookbookLoadout = fs.readFileSync(path.join(repositoryRoot, 'cookbook-loadout.js'), 'utf8');
const cookbookExecutiveStyles = fs.readFileSync(path.join(repositoryRoot, 'cookbook-executive.css'), 'utf8');
const fullLoadoutManifest = fs.readFileSync(path.join(repositoryRoot, 'skills', 'ai-executive-loadout', 'SKILL.md'), 'utf8');
const fullLoadoutMetadata = fs.readFileSync(path.join(repositoryRoot, 'skills', 'ai-executive-loadout', 'agents', 'openai.yaml'), 'utf8');

const packageSources = {
  'demand-conversation-package': ['signal-to-conversation', 'proof-library', 'social-content-strategy', 'voice-kit'],
  'customer-decision-package': ['call-decision-system', 'feedback-prioritization', 'proof-library'],
  'relationship-reconnect-package': ['relationship-map', 'outreach-planner', 'voice-kit']
};

test('CookBook puts the full install first, then gives visitors real skill packages', () => {
  assert.doesNotMatch(homepage, /id="packages"/);
  assert.match(cookbook, /id="install"/);
  assert.match(cookbook, /id="packages"/);
  assert.match(cookbook, /id="aiExecutiveLoadoutUrl"/);
  assert.match(cookbook, /Copy full install link/);
  assert.match(cookbook, /https:\/\/why57\.com\/skills\/ai-executive-loadout\/SKILL\.md/);
  assert.match(cookbook, /href="#recipes"[^>]+id="aiExecutiveLoadoutSource"/);
  assert.match(cookbook, /data-package="demand"/);
  assert.match(cookbook, /data-package="customer"/);
  assert.match(cookbook, /data-package="relationships"/);
  assert.match(cookbook, /id="aiExecutivePackageUrl"/);
  assert.match(cookbook, /id="aiExecutivePackageSource"/);
  assert.match(cookbook, /Turn a live market problem into a credible contribution/);
  assert.match(cookbook, /Turn real relationship evidence into a careful next move/);
  assert.match(cookbook, /Signal to Conversation/);
  assert.match(cookbook, /Open package breakdown &amp; install/);
  assert.match(cookbook, /The AI Executive CookBook/);
  assert.match(cookbook, /Give your AI a job/);
  assert.match(cookbook, /Keep the decision/);
  assert.match(cookbook, /You do not need the full library first/);
  assert.match(cookbook, /class="cookbook-page cb-page"/);
  assert.match(cookbook, /style\.css\?v=8/);
  assert.match(cookbook, /cookbook-executive\.css\?v=2/);
  assert.match(cookbook, /cookbook-loadout\.js\?v=5/);
  assert.match(cookbook, /id="aiExecutivePackageFlow"/);
  assert.match(cookbook, /It does not run all of them or change anything outside your AI/);
  assert.match(cookbook, /og:image" content="https:\/\/why57\.com\/images\/ai-executive-os-social-card\.png/);
  assert.match(cookbook, /twitter:card" content="summary_large_image/);
  assert.match(cookbook, /10<\/span> detailed recipes/);
  assert.doesNotMatch(cookbook, /data-route=/);
  assert.doesNotMatch(cookbook, /id="aiExecutiveRoutePrompt"/);
  assert.doesNotMatch(cookbook, /href="skills\/ai-executive-loadout\/SKILL\.md"[^>]+id="aiExecutiveLoadoutSource"/);
  assert.equal(fs.existsSync(path.join(repositoryRoot, 'skills', 'ai-executive-loadout', 'SKILL.md')), true);
  assert.equal(fs.existsSync(path.join(repositoryRoot, 'images', 'ai-executive-os-social-card.png')), true);
});

test('CookBook package UI has page-scoped install and flow styles', () => {
  assert.match(cookbookExecutiveStyles, /\.cookbook-page \.cb-full-install\{/);
  assert.match(cookbookExecutiveStyles, /\.cookbook-page \.executive-routes\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\);gap:10px;\}/);
  assert.match(cookbookExecutiveStyles, /\.cookbook-page \.executive-route\{display:grid;align-content:start;gap:9px;min-height:191px;/);
  assert.match(cookbookExecutiveStyles, /\.cookbook-page \.executive-route\.is-active\{border-color:rgba\(224,76,40,.68\);/);
  assert.match(cookbookExecutiveStyles, /\.cookbook-page \.executive-package-flow\{display:grid;/);
  assert.match(cookbookExecutiveStyles, /\.cookbook-page \.executive-result-facts div\{display:grid;grid-template-columns:82px minmax\(0,1fr\);/);
});

test('CookBook controls copy direct full and package installer links', () => {
  assert.match(cookbookLoadout, /const allSkillsUrl = 'https:\/\/why57\.com\/skills\/ai-executive-loadout\/SKILL\.md'/);
  assert.match(cookbookLoadout, /installUrl: 'https:\/\/why57\.com\/skills\/demand-conversation-package\/SKILL\.md'/);
  assert.match(cookbookLoadout, /installUrl: 'https:\/\/why57\.com\/skills\/customer-decision-package\/SKILL\.md'/);
  assert.match(cookbookLoadout, /installUrl: 'https:\/\/why57\.com\/skills\/relationship-reconnect-package\/SKILL\.md'/);
  assert.match(cookbookLoadout, /ai_executive_all_skills_url_copied/);
  assert.match(cookbookLoadout, /ai_executive_package_url_copied/);
  assert.match(cookbookLoadout, /ai_executive_package_selected/);
  assert.match(cookbook, /Copy package install link/);
  assert.match(cookbookLoadout, /install only these skills/);
  assert.doesNotMatch(cookbookLoadout, /ai_executive_route_prompt_copied/);
});

test('full loadout manifest names every skill source and protects unrelated skills', () => {
  assert.match(fullLoadoutManifest, /The AI Executive CookBook — Full Skill Installer/);
  assert.match(fullLoadoutMetadata, /AI Executive CookBook Installer/);
  for (const skill of ['relationship-map', 'voice-kit', 'feedback-prioritization', 'social-content-strategy', 'signal-to-conversation', 'call-decision-system', 'proof-library', 'outreach-planner', 'ai-skill-stack', 'daily-ai-workflow', 'browser-harness-benchmark']) {
    assert.match(fullLoadoutManifest, new RegExp(`https://why57\\.com/skills/${skill}/SKILL\\.md`));
  }
  assert.match(fullLoadoutManifest, /Do not delete, move, rename, or overwrite unrelated skills/);
  assert.match(fullLoadoutManifest, /Do not run the installed skills now/);
  assert.match(fullLoadoutManifest, /This is a user-led setup for an existing AI harness/);
});

test('downloadable full skill archive matches the current installer', () => {
  const archivePath = path.join(repositoryRoot, 'downloads', 'ai-executive-cookbook-skills.zip');
  const archiveInstaller = childProcess.execFileSync('unzip', ['-p', archivePath, 'skills/ai-executive-loadout/SKILL.md'], { encoding: 'utf8' });
  const archiveMetadata = childProcess.execFileSync('unzip', ['-p', archivePath, 'skills/ai-executive-loadout/agents/openai.yaml'], { encoding: 'utf8' });
  assert.equal(archiveInstaller, fullLoadoutManifest);
  assert.equal(archiveMetadata, fullLoadoutMetadata);
});

test('each package installer names only genuine skills, links to their local sources, and stops after setup', () => {
  for (const [packageName, skills] of Object.entries(packageSources)) {
    const packagePath = path.join(repositoryRoot, 'skills', packageName, 'SKILL.md');
    const manifest = fs.readFileSync(packagePath, 'utf8');
    assert.match(manifest, /Install only these/);
    assert.match(manifest, /Do not delete, move, rename, or overwrite unrelated skills/);
    assert.match(manifest, /Do not run any skill during installation/);
    for (const skill of skills) {
      assert.match(manifest, new RegExp(`https://why57\\.com/skills/${skill}/SKILL\\.md`));
      assert.equal(fs.existsSync(path.join(repositoryRoot, 'skills', skill, 'SKILL.md')), true);
    }
  }
});

test('Signal to Conversation works from a bounded social source set and preserves owner approval', () => {
  const signalSkill = fs.readFileSync(path.join(repositoryRoot, 'skills', 'signal-to-conversation', 'SKILL.md'), 'utf8');
  assert.match(signalSkill, /LinkedIn, X, or Reddit/);
  assert.match(signalSkill, /Five to fifteen public/);
  assert.match(signalSkill, /Do not ask for account credentials/);
  assert.match(signalSkill, /Demand-to-Conversation Action Packet/);
  assert.match(signalSkill, /Execution handoff/);
  assert.match(signalSkill, /Do not draft, post, reply, DM, schedule, or send unless the owner explicitly advances/);
  assert.equal(fs.existsSync(path.join(repositoryRoot, 'skills', 'signal-to-conversation', 'agents', 'openai.yaml')), true);
});
