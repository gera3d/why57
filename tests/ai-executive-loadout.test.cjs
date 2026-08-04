const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repositoryRoot = path.resolve(__dirname, '..');
const homepage = fs.readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');
const cookbook = fs.readFileSync(path.join(repositoryRoot, 'ai-execution-cookbook.html'), 'utf8');
const voiceBreakdown = fs.readFileSync(path.join(repositoryRoot, 'put-your-actual-voice-back-into-ai-draft.html'), 'utf8');
const cookbookLoadout = fs.readFileSync(path.join(repositoryRoot, 'cookbook-loadout.js'), 'utf8');
const cookbookExecutiveStyles = fs.readFileSync(path.join(repositoryRoot, 'cookbook-executive.css'), 'utf8');

const canonicalVoiceKitUrl = 'https://raw.githubusercontent.com/gera3d/ai-executive-cookbook/master/skills/executive-cookbook-voice-kit/SKILL.md';

test('CookBook offers one honest, ready-to-install skill', () => {
  assert.doesNotMatch(homepage, /id="voice-kit"/);
  assert.match(cookbook, /id="voice-kit"/);
  assert.match(cookbook, /Voice Kit is the only ready-to-install module today/);
  assert.match(cookbook, /id="coming-soon"/);
  assert.match(cookbook, /Proof Library/);
  assert.match(cookbook, /Secure Setup/);
  assert.match(cookbook, /Each one stays here until it has a clear job, a human-readable skill breakdown, and a real install path/);
  assert.match(cookbook, /https:\/\/github\.com\/gera3d\/ai-executive-cookbook\/tree\/master\/skills\/executive-cookbook-voice-kit/);
  assert.match(cookbook, /cookbook-loadout\.js\?v=8/);
  assert.match(cookbookExecutiveStyles, /\.cookbook-page \.cb-live-install\{/);
  assert.match(cookbookExecutiveStyles, /\.cookbook-page \.cb-roadmap-grid\{display:grid;grid-template-columns:repeat\(3,minmax\(0,1fr\)\);/);
});

test('Voice Kit copy and direct file link use the canonical public source', () => {
  assert.match(cookbookLoadout, new RegExp(canonicalVoiceKitUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(voiceBreakdown, new RegExp(canonicalVoiceKitUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(cookbookLoadout, /Start by drafting the current request/);
  assert.match(cookbookLoadout, /Ask before creating or updating any private Corpus file/);
  assert.match(voiceBreakdown, /Install Voice Kit for repeat work/);
  assert.doesNotMatch(cookbookLoadout, /raw\.githubusercontent\.com\/gera3d\/why57\/main\/skills\/voice-kit\/SKILL\.md/);
  assert.doesNotMatch(voiceBreakdown, /raw\.githubusercontent\.com\/gera3d\/why57\/main\/skills\/voice-kit\/SKILL\.md/);
});

test('Voice Kit keeps its page anchors and locally loaded signup dependencies intact', () => {
  const ids = new Set([...voiceBreakdown.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  for (const target of [...voiceBreakdown.matchAll(/\bhref="#([^"]+)"/g)].map((match) => match[1])) {
    assert.equal(ids.has(target), true, `Missing Voice Kit anchor target: #${target}`);
  }
  for (const localFile of ['ai-execution-cookbook.html', 'privacy.html', 'cookbook-signup.js']) {
    assert.equal(fs.existsSync(path.join(repositoryRoot, localFile)), true, `Missing Voice Kit dependency: ${localFile}`);
  }
});
