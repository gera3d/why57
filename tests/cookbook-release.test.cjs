const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repositoryRoot = path.resolve(__dirname, '..');
const homepage = fs.readFileSync(path.join(repositoryRoot, 'ai-execution-cookbook.html'), 'utf8');
const voiceBreakdown = fs.readFileSync(path.join(repositoryRoot, 'put-your-actual-voice-back-into-ai-draft.html'), 'utf8');
const releaseScript = fs.readFileSync(path.join(repositoryRoot, 'cookbook-release.js'), 'utf8');

test('CookBook pages display the canonical GitHub release details and an honest Star link', () => {
  for (const page of [homepage, voiceBreakdown]) {
    assert.match(page, /cookbook-release\.css\?v=1/);
    assert.match(page, /data-cookbook-skill-release="executive-cookbook-voice-kit"/);
    assert.match(page, /See what changed/);
    assert.match(page, /☆ Star the CookBook/);
    assert.match(page, /https:\/\/github\.com\/gera3d\/ai-executive-cookbook/);
    assert.match(page, /cookbook-release\.js/);
  }
});

test('CookBook release panel reads the public manifest and fails closed when metadata is unavailable', () => {
  assert.match(releaseScript, /raw\.githubusercontent\.com\/gera3d\/ai-executive-cookbook\/master\/version\.json/);
  assert.match(releaseScript, /data-cookbook-skill-release/);
  assert.match(releaseScript, /Published source updated/);
  assert.match(releaseScript, /Version details unavailable/);
  assert.doesNotMatch(releaseScript, /token|authorization|secret/i);
});
