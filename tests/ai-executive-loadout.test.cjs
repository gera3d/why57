const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const repositoryRoot = path.resolve(__dirname, '..');
const homepage = fs.readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');
const cookbook = fs.readFileSync(path.join(repositoryRoot, 'ai-execution-cookbook.html'), 'utf8');
const cookbookLoadout = fs.readFileSync(path.join(repositoryRoot, 'cookbook-loadout.js'), 'utf8');
const fullLoadoutManifest = fs.readFileSync(path.join(repositoryRoot, 'skills', 'ai-executive-loadout', 'SKILL.md'), 'utf8');

test('CookBook landing page presents guided execution skills and outcome-led starting routes', () => {
  assert.doesNotMatch(homepage, /id="ai-executive"/);
  assert.match(cookbook, /id="ai-executive"/);
  assert.match(cookbook, /id="aiExecutiveLoadoutUrl"/);
  assert.match(cookbook, /https:\/\/why57\.com\/skills\/ai-executive-loadout\/SKILL\.md/);
  assert.match(cookbook, /href="skills\/ai-executive-loadout\/SKILL\.md"[^>]+id="aiExecutiveLoadoutSource"/);
  assert.match(cookbook, /data-route="demand"/);
  assert.match(cookbook, /data-route="customer"/);
  assert.match(cookbook, /data-route="operations"/);
  assert.match(cookbook, /id="aiExecutiveRoutePrompt"/);
  assert.match(cookbook, /Turn social insight into qualified conversations/);
  assert.match(cookbook, /The AI Executive CookBook/);
  assert.match(cookbook, /Give your AI a job/);
  assert.match(cookbook, /Keep the decision/);
  assert.match(cookbook, /Configure your AI for the work that needs to move/);
  assert.match(cookbook, /id="aiExecutiveRouteSkill"/);
  assert.match(cookbook, /Each recipe gives you the human guide/);
  assert.match(cookbook, /Each skill gives your AI reusable instructions for one job/);
  assert.match(cookbook, /id="aiExecutiveRouteInput"/);
  assert.match(cookbook, /id="aiExecutiveInstall"/);
  assert.match(cookbook, /og:image" content="https:\/\/why57\.com\/images\/ai-executive-os-social-card\.png/);
  assert.match(cookbook, /twitter:card" content="summary_large_image/);
  assert.match(cookbook, /10<\/span> detailed recipes/);
  assert.doesNotMatch(cookbook, /id="aiExecutiveFocusPrompt"/);
  assert.match(cookbook, /href="#recipes"/);
  assert.match(cookbook, /cookbook-loadout\.js\?v=2/);
  assert.equal(fs.existsSync(path.join(repositoryRoot, 'skills', 'ai-executive-loadout', 'SKILL.md')), true);
  assert.equal(fs.existsSync(path.join(repositoryRoot, 'images', 'ai-executive-os-social-card.png')), true);
});

test('CookBook controls copy a direct manifest URL and guided starting instructions without deleting skills', () => {
  assert.match(cookbookLoadout, /const allSkillsUrl = 'https:\/\/why57\.com\/skills\/ai-executive-loadout\/SKILL\.md'/);
  assert.match(cookbookLoadout, /ai_executive_all_skills_url_copied/);
  assert.match(cookbookLoadout, /actionLabel: 'Copy the demand prompt'/);
  assert.match(cookbookLoadout, /Keep only the skill needed for the current step active; leave the rest installed and idle/);
  assert.match(cookbookLoadout, /Set up a guided execution workstream in the AI environment I already use\. I am leading it/);
  assert.match(cookbookLoadout, /Keep the context tight so you do not waste tokens on unrelated skills or records/);
  assert.match(cookbookLoadout, /ai_executive_route_prompt_copied/);
  assert.match(cookbookLoadout, /Do not scrape broadly, connect accounts, read DMs, auto-like, auto-comment, auto-DM, publish/);
});

test('full loadout manifest names every skill source and protects unrelated skills', () => {
  for (const skill of ['relationship-map', 'voice-kit', 'feedback-prioritization', 'social-content-strategy', 'signal-to-conversation', 'call-decision-system', 'proof-library', 'outreach-planner', 'ai-skill-stack', 'daily-ai-workflow', 'browser-harness-benchmark']) {
    assert.match(fullLoadoutManifest, new RegExp(`https://why57\\.com/skills/${skill}/SKILL\\.md`));
  }
  assert.match(fullLoadoutManifest, /Do not delete, move, rename, or overwrite unrelated skills/);
  assert.match(fullLoadoutManifest, /Do not run the installed skills now/);
  assert.match(fullLoadoutManifest, /This is a user-led setup for an existing AI harness/);
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
