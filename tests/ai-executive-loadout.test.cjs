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

test('CookBook launches Voice Kit honestly and reserves the rest for later releases', () => {
  assert.doesNotMatch(homepage, /id="voice-kit"/);
  assert.match(cookbook, /id="voice-kit"/);
  assert.match(cookbook, /Start with one AI skill that/);
  assert.match(cookbook, /Voice Kit is the only ready-to-install module today/);
  assert.match(cookbook, /id="voiceKitInstallCopy"/);
  assert.match(cookbook, /Read the Voice Kit guide/);
  assert.match(cookbook, /put-your-actual-voice-back-into-ai-draft\.html/);
  assert.match(cookbook, /Copy install instruction/);
  assert.match(cookbook, /id="coming-soon"/);
  assert.match(cookbook, /Proof Library/);
  assert.match(cookbook, /Secure Setup/);
  assert.match(cookbook, /Coming next/);
  assert.match(cookbook, /Not a waitlist for a vague “AI platform/);
  assert.match(cookbook, /class="cb-section cb-legacy-catalog" id="recipes"[^>]+hidden/);
  for (const skill of ['Relationship Map', 'Feedback Prioritization', 'Content Pattern Map', 'Signal to Conversation', 'Call Decision System', 'Outreach Planner', 'AI Skill Stack', 'Daily AI Workflow', 'Browser Harness Benchmark']) {
    assert.match(cookbook, new RegExp(skill));
  }
  assert.match(cookbook, /class="cookbook-page cb-page"/);
  assert.match(cookbook, /style\.css\?v=8/);
  assert.match(cookbook, /cookbook-executive\.css\?v=3/);
  assert.match(cookbook, /cookbook-loadout\.js\?v=6/);
  assert.match(cookbook, /og:image" content="https:\/\/why57\.com\/images\/ai-executive-os-social-card\.png/);
  assert.match(cookbook, /twitter:card" content="summary_large_image/);
  assert.equal(fs.existsSync(path.join(repositoryRoot, 'skills', 'voice-kit', 'SKILL.md')), true);
  assert.equal(fs.existsSync(path.join(repositoryRoot, 'images', 'ai-executive-os-social-card.png')), true);
});

test('CookBook launch UI keeps the live skill and coming-soon release list visually separate', () => {
  assert.match(cookbookExecutiveStyles, /\.cookbook-page \.cb-live-install\{/);
  assert.match(cookbookExecutiveStyles, /\.cookbook-page \.cb-launch-grid\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\);/);
  assert.match(cookbookExecutiveStyles, /\.cookbook-page \.cb-launch-card--live\{border-color:rgba\(255,121,64,.5\);/);
  assert.match(cookbookExecutiveStyles, /\.cookbook-page \.cb-roadmap-grid\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\);/);
  assert.match(cookbookExecutiveStyles, /\.cookbook-page \.cb-status--coming\{color:#c8a59b;/);
});

test('CookBook only copies a Voice Kit install instruction from the public launch page', () => {
  assert.match(cookbookLoadout, /const voiceKitUrl = 'https:\/\/why57\.com\/skills\/voice-kit\/SKILL\.md'/);
  assert.match(cookbookLoadout, /getElementById\('voiceKitInstallCopy'\)/);
  assert.match(cookbookLoadout, /Use it only with samples I selected or am authorized to use/);
  assert.match(cookbookLoadout, /do not send, publish, or change an account/);
  assert.match(cookbookLoadout, /voice_kit_install_instruction_copied/);
  assert.doesNotMatch(cookbookLoadout, /aiExecutivePackageUrl/);
  assert.doesNotMatch(cookbookLoadout, /ai_executive_all_skills_url_copied/);
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
