const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repositoryRoot = path.resolve(__dirname, '..');
const homepage = fs.readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');
const cookbook = fs.readFileSync(path.join(repositoryRoot, 'ai-execution-cookbook.html'), 'utf8');
const voiceBreakdown = fs.readFileSync(path.join(repositoryRoot, 'put-your-actual-voice-back-into-ai-draft.html'), 'utf8');
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
  assert.match(cookbook, /See the skill broken down/);
  assert.match(cookbook, /put-your-actual-voice-back-into-ai-draft\.html/);
  assert.match(cookbook, /Copy install instruction/);
  assert.match(cookbook, /one real writing sample and a current job/);
  assert.match(cookbook, /first draft · pattern notes · corrected Voice Kit for the next job/);
  assert.doesNotMatch(cookbook, /Author Writing Sheet/);
  assert.doesNotMatch(cookbook, /approved Voice Kit/);
  assert.match(cookbook, /id="coming-soon"/);
  assert.match(cookbook, /Proof Library/);
  assert.match(cookbook, /Secure Setup/);
  assert.match(cookbook, /Coming next/);
  assert.match(cookbook, /Each one stays here until it has a clear job, a human-readable skill breakdown, and a real install path/);
  assert.doesNotMatch(cookbook, /cb-legacy-catalog|10 detailed recipes|11 installable skills|Not a waitlist for a vague “AI platform/);
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

test('Voice Kit starts with one clear use path, then explains the method, optional install, and evidence', () => {
  assert.match(voiceBreakdown, /Give your AI something you wrote\.\s*<em>Get a draft that starts closer to you\.<\/em>/);
  assert.match(voiceBreakdown, /Copy Voice Kit/);
  assert.match(voiceBreakdown, /one past email, post, transcript, or paragraph—and the job in front of you/);
  assert.match(voiceBreakdown, /id="how-to-use"/);
  assert.match(voiceBreakdown, /You do not need to set up a whole system to find out if this is useful\./);
  assert.match(voiceBreakdown, /id="example"/);
  assert.match(voiceBreakdown, /A real piece of writing \+ today’s job\./);
  assert.match(voiceBreakdown, /A draft, plus a few choices you can inspect\./);
  assert.match(voiceBreakdown, /id="two-contexts"/);
  assert.match(voiceBreakdown, /One document holds the real words\. The other holds what the AI learned from them\./);
  assert.match(voiceBreakdown, /Source Corpus/);
  assert.match(voiceBreakdown, /Voice Guide/);
  assert.match(voiceBreakdown, /Illustrative working context, not a claim that Voice Kit creates permanent private files in every AI/);
  assert.match(voiceBreakdown, /id="install"/);
  assert.match(voiceBreakdown, /If the first run helps, make the method available for repeat work\./);
  assert.match(voiceBreakdown, /Install Voice Kit for repeat work/);
  assert.match(voiceBreakdown, /See how Voice Kit works, the research behind it, and its limits/);
  assert.match(voiceBreakdown, /Read the full research record and source notes/);
  assert.match(voiceBreakdown, /vk-details-section vk-detail-group/);
  assert.match(voiceBreakdown, /#sources\{order:7\}/);
  assert.match(voiceBreakdown, /#follow\{order:8\}/);
  assert.match(voiceBreakdown, /ai-execution-cookbook\.html#platforms/);
  assert.match(voiceBreakdown, /Read the exact Voice Kit instruction before you copy it/);
  assert.match(voiceBreakdown, /It keeps the context small, drafts before it overthinks, and gives you something you can correct\./);
  assert.match(voiceBreakdown, /Why this is a reasonable way to start\./);
  assert.match(voiceBreakdown, /Read the full research record/);
  assert.match(voiceBreakdown, /Real source\. Current writing job\. Visible judgment\./);
  assert.match(voiceBreakdown, /id="follow"/);
  assert.match(voiceBreakdown, /id="cookbookSignupForm"/);
  assert.match(voiceBreakdown, /name="site_source" value="why57_voice_kit_skill"/);
  assert.match(voiceBreakdown, /cookbook-signup\.js/);
  assert.match(voiceBreakdown, /Draft first, show the observed patterns alongside the draft/);
  assert.match(voiceBreakdown, /LaMP: When Large Language Models Meet Personalization/);
  assert.match(voiceBreakdown, /Catch Me If You Can\? Not Yet/);
  assert.match(voiceBreakdown, /Aligning LLMs by Predicting Preferences from User Writing Samples/);
  assert.match(voiceBreakdown, /do not guarantee a business result/);
  assert.doesNotMatch(voiceBreakdown, /Build a sheet before a draft\./);
  assert.doesNotMatch(voiceBreakdown, /prompt-source-menu/);
  assert.doesNotMatch(voiceBreakdown, /calendar\.app\.google/);
  assert.doesNotMatch(voiceBreakdown, /Choose your path/);
  assert.doesNotMatch(voiceBreakdown, /Fast start · any AI chat/);
  assert.doesNotMatch(voiceBreakdown, /Repeat work · skills-capable AI/);
});

test('Voice Kit breakdown keeps its local routes, anchors, and signup wiring intact', () => {
  const allIds = [...voiceBreakdown.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const ids = new Set(allIds);
  assert.equal(ids.size, allIds.length, 'Voice Kit page must not contain duplicate ids');
  const anchorTargets = [...voiceBreakdown.matchAll(/\bhref="#([^"]+)"/g)].map((match) => match[1]);
  for (const target of anchorTargets) {
    assert.equal(ids.has(target), true, `Missing Voice Kit anchor target: #${target}`);
  }

  for (const id of [
    'cookbookSignupForm', 'cookbookEmail', 'cookbookConsent', 'cookbookRequestId',
    'cookbookFormStartedAt', 'cookbookPageUrl', 'cookbookReferrer', 'cookbookSessionId',
    'cookbookUtmSource', 'cookbookUtmMedium', 'cookbookUtmCampaign', 'cookbookSignupError',
    'cookbookSignupSubmit', 'cookbookSignupSuccess'
  ]) {
    assert.equal(ids.has(id), true, `Voice Kit signup is missing #${id}`);
  }

  for (const localFile of [
    'ai-execution-cookbook.html', 'privacy.html', 'cookbook-signup.js', 'skills/voice-kit/SKILL.md'
  ]) {
    assert.equal(fs.existsSync(path.join(repositoryRoot, localFile)), true, `Missing Voice Kit dependency: ${localFile}`);
  }
});

test('CookBook navigation reaches only current visible sections', () => {
  const ids = new Set([...cookbook.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const anchors = [...cookbook.matchAll(/\bhref="#([^"]+)"/g)].map((match) => match[1]);

  for (const target of anchors) {
    assert.equal(ids.has(target), true, `Missing CookBook anchor target: #${target}`);
  }
  assert.doesNotMatch(cookbook, /href="#(?:start-here|customer-work|operating-system|browser-work)"/);
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
  assert.match(cookbookLoadout, /Use it with real samples I selected or am authorized to use/);
  assert.match(cookbookLoadout, /Start by drafting the current request/);
  assert.match(cookbookLoadout, /show the observed patterns alongside the draft/);
  assert.match(cookbookLoadout, /Do not send, publish, or change an account/);
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
