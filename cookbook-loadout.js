(() => {
  "use strict";

  const aiExecutiveLoadoutUrl = document.getElementById('aiExecutiveLoadoutUrl');
  const aiExecutiveInstallStatus = document.getElementById('aiExecutiveInstallStatus');
  const aiExecutiveLoadoutSource = document.getElementById('aiExecutiveLoadoutSource');
  const aiExecutiveRoutes = Array.from(document.querySelectorAll('.executive-route'));
  const aiExecutiveRouteSkill = document.getElementById('aiExecutiveRouteSkill');
  const aiExecutiveRouteTitle = document.getElementById('aiExecutiveRouteTitle');
  const aiExecutiveRouteDescription = document.getElementById('aiExecutiveRouteDescription');
  const aiExecutiveRouteInput = document.getElementById('aiExecutiveRouteInput');
  const aiExecutiveRouteOutput = document.getElementById('aiExecutiveRouteOutput');
  const aiExecutiveRouteBoundary = document.getElementById('aiExecutiveRouteBoundary');
  const aiExecutiveRoutePrompt = document.getElementById('aiExecutiveRoutePrompt');
  const aiExecutiveRouteStatus = document.getElementById('aiExecutiveRouteStatus');
  const aiExecutiveLoadoutLink = document.querySelector('[data-analytics-event="ai_executive_loadout_opened"]');

  if (!aiExecutiveLoadoutUrl && !aiExecutiveRoutes.length) return;

  const allSkillsUrl = 'https://why57.com/skills/ai-executive-loadout/SKILL.md';

  const track = (eventName, detail = {}) => {
    window.why57Analytics?.track(eventName, detail);
  };

  const copyText = async (value) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand('copy');
    area.remove();
    if (!copied) throw new Error('Copy unavailable');
  };

  const setStatus = (element, message) => {
    if (element) element.textContent = message;
  };

  const routes = {
    demand: {
      skill: 'Signal to Conversation',
      title: 'Find the conversation worth earning.',
      description: 'Bring a small set of public posts or threads you chose. Your AI uses that tight context to find the problem, the proof gap, and one useful conversation move.',
      input: '5–15 selected LinkedIn, X, or Reddit posts or threads.',
      output: 'A source-linked action packet with the problem, proof needed, next action, owner, and approval point.',
      boundary: 'Scrape accounts, read DMs, or automate replies and outreach.',
      actionLabel: 'Copy the demand prompt',
      prompt: 'Set up a guided execution workstream in the AI environment I already use. I am leading it. The job is to turn attention from LinkedIn, X, or Reddit into qualified conversations. Start with $signal-to-conversation using only 5–15 public posts or threads I explicitly supply, or content I own. Return a source-linked Demand-to-Conversation Action Packet: the live problems, exact audience language, one clear point of view, the proof needed, one helpful post or reply direction, a specific next-conversation CTA, the action owner, and the approval point. Do not scrape broadly, connect accounts, read DMs, auto-like, auto-comment, auto-DM, publish, or treat engagement as buying intent. Ask for my approval before using $social-content-strategy, $voice-kit, $proof-library, or $outreach-planner. Keep only the skill needed for the current step active; leave the rest installed and idle. Keep the context tight so you do not waste tokens on unrelated skills or records.'
    },
    customer: {
      skill: 'Call Decision System',
      title: 'Make the offer decision your customers are pointing to.',
      description: 'Bring a bounded set of customer calls and feedback. Your AI separates direct evidence from assumptions so you can decide what to improve, test, or stop.',
      input: 'Selected call transcripts, feedback, and the decision you need to make.',
      output: 'A decision action packet with recurring problems, proof gap, next test, owner, and approval point.',
      boundary: 'Change the roadmap, contact customers, or publish anything without your approval.',
      actionLabel: 'Copy the customer prompt',
      prompt: 'Set up a guided execution workstream in the AI environment I already use. I am leading it. The job is to turn a bounded set of customer calls and feedback into a sharper offer. Start with $call-decision-system and $feedback-prioritization using only the records I authorize. Return an evidence-backed Decision Action Packet: recurring problems, direct customer language, unknowns, the proof gap, one proposed offer or message test, the action owner, and the approval point. Do not infer demand from one comment, change the roadmap, contact customers, or publish anything. Ask for my approval before using $proof-library or $voice-kit. Keep only the skill needed for the current step active; leave the rest installed and idle. Keep the context tight so you do not waste tokens on unrelated skills or records.'
    },
    operations: {
      skill: 'AI Skill Stack',
      title: 'Make one useful AI job reliable before you scale it.',
      description: 'Choose one recurring task that already produces value. Your AI defines the input, output, owner, review point, and stop condition—then only makes that proven work easier to repeat.',
      input: 'One recurring task, current inputs, a useful output, and the person who reviews it.',
      output: 'A lean operating card with the trigger, skill, owner, review point, and stop condition.',
      boundary: 'Create a large automation system or act in external accounts on its own.',
      actionLabel: 'Copy the operations prompt',
      prompt: 'Set up a guided execution workstream in the AI environment I already use. I am leading it. The job is to make one useful AI job repeatable. Start with $ai-skill-stack. Help me choose one recurring task with clear inputs, a useful output, a named owner, a review point, and a stop condition. Do not create a large automation system or activate every installed skill. After I approve a tested skill, use $daily-ai-workflow for that one job. Use $browser-harness-benchmark only to evaluate a browser workflow safely, never to operate an account or take external action. Keep only the skill needed for the current step active; leave the rest installed and idle. Keep the context tight so you do not waste tokens on unrelated skills or records.'
    }
  };

  let activeRoute = 'demand';

  const renderRoute = (routeName) => {
    const route = routes[routeName];
    if (!route) return;
    activeRoute = routeName;
    aiExecutiveRoutes.forEach((button) => {
      const selected = button.dataset.route === routeName;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    if (aiExecutiveRouteSkill) aiExecutiveRouteSkill.textContent = route.skill;
    if (aiExecutiveRouteTitle) aiExecutiveRouteTitle.textContent = route.title;
    if (aiExecutiveRouteDescription) aiExecutiveRouteDescription.textContent = route.description;
    if (aiExecutiveRouteInput) aiExecutiveRouteInput.textContent = route.input;
    if (aiExecutiveRouteOutput) aiExecutiveRouteOutput.textContent = route.output;
    if (aiExecutiveRouteBoundary) aiExecutiveRouteBoundary.textContent = route.boundary;
    if (aiExecutiveRoutePrompt) aiExecutiveRoutePrompt.textContent = route.actionLabel;
  };

  aiExecutiveLoadoutUrl?.addEventListener('click', async () => {
    try {
      await copyText(allSkillsUrl);
      setStatus(aiExecutiveInstallStatus, 'Skills link copied. Paste it into your compatible AI to install the suite.');
      track('ai_executive_all_skills_url_copied', { location: 'cookbook_ai_executive_full_suite' });
    } catch (_error) {
      setStatus(aiExecutiveInstallStatus, 'Copy did not work here. Open the install manifest and copy the URL from your browser.');
    }
  });

  aiExecutiveLoadoutSource?.addEventListener('click', () => {
    track('ai_executive_all_skills_manifest_opened', { location: 'cookbook_ai_executive_full_suite' });
  });

  aiExecutiveLoadoutLink?.addEventListener('click', () => {
    track('ai_executive_loadout_opened', { location: 'cookbook_ai_executive_loadout' });
  });

  aiExecutiveRoutes.forEach((button) => {
    button.addEventListener('click', () => {
      renderRoute(button.dataset.route);
      setStatus(aiExecutiveRouteStatus, 'Business job selected. Install the skills if you are new here. Otherwise, copy the prompt and begin.');
      track('ai_executive_route_selected', { route: button.dataset.route, location: 'cookbook_ai_executive_routes' });
    });
  });

  aiExecutiveRoutePrompt?.addEventListener('click', async () => {
    const route = routes[activeRoute];
    try {
      await copyText(route.prompt);
      setStatus(aiExecutiveRouteStatus, 'Starting prompt copied. Paste it into your compatible AI after the skills are installed.');
      track('ai_executive_route_prompt_copied', { route: activeRoute, location: 'cookbook_ai_executive_routes' });
    } catch (_error) {
      setStatus(aiExecutiveRouteStatus, 'Copy did not work here. Select the text in the prompt from the page source or use the install manifest first.');
    }
  });

  renderRoute(activeRoute);
})();
