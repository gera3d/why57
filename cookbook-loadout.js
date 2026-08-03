(() => {
  "use strict";

  const aiExecutiveLoadoutUrl = document.getElementById('aiExecutiveLoadoutUrl');
  const aiExecutiveInstallStatus = document.getElementById('aiExecutiveInstallStatus');
  const aiExecutiveLoadoutSource = document.getElementById('aiExecutiveLoadoutSource');
  const aiExecutivePackages = Array.from(document.querySelectorAll('.executive-route'));
  const aiExecutivePackageName = document.getElementById('aiExecutivePackageName');
  const aiExecutivePackageTitle = document.getElementById('aiExecutivePackageTitle');
  const aiExecutivePackageDescription = document.getElementById('aiExecutivePackageDescription');
  const aiExecutivePackageFlow = document.getElementById('aiExecutivePackageFlow');
  const aiExecutivePackageSkills = document.getElementById('aiExecutivePackageSkills');
  const aiExecutivePackageUseCase = document.getElementById('aiExecutivePackageUseCase');
  const aiExecutivePackageOutput = document.getElementById('aiExecutivePackageOutput');
  const aiExecutivePackageBoundary = document.getElementById('aiExecutivePackageBoundary');
  const aiExecutivePackageUrl = document.getElementById('aiExecutivePackageUrl');
  const aiExecutivePackageSource = document.getElementById('aiExecutivePackageSource');
  const aiExecutivePackageStatus = document.getElementById('aiExecutivePackageStatus');

  if (!aiExecutiveLoadoutUrl && !aiExecutivePackageUrl && !aiExecutivePackages.length) return;

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

  const packages = {
    demand: {
      name: 'Demand to Conversation',
      title: 'Turn a live problem into a contribution worth making.',
      description: 'Start with a small, owner-selected public signal set. The package keeps the market evidence, the proof behind your claim, and the way you express it separate until each part is ready.',
      skills: 'Signal to Conversation, Proof Library, Content Pattern Map, and Voice Kit.',
      useCase: 'You need to earn a conversation by being useful, not by harvesting a list of people.',
      output: 'A source-linked action packet, proof-backed contribution direction, and a clear owner decision before anything goes public.',
      boundary: 'Source approval, claim approval, community checks, and every post, reply, or contact action.',
      flow: ['Signal to Conversation finds the real problem', 'Proof Library closes the claim gap', 'Content Pattern Map and Voice Kit shape an approved contribution'],
      installUrl: 'https://why57.com/skills/demand-conversation-package/SKILL.md'
    },
    customer: {
      name: 'Customer Decision',
      title: 'Turn customer evidence into a sharper next decision.',
      description: 'Start with the call, then test what holds across the feedback you actually authorized. The package preserves direct customer language, weakens assumptions, and makes the next decision visible.',
      skills: 'Call Decision System, Feedback Prioritization, and Proof Library.',
      useCase: 'You need to decide what to improve, test, explain more clearly, or leave alone without mistaking one loud request for demand.',
      output: 'A Call Decision Brief, a Feedback Map, and—when needed—proof cards for a bounded next test or explanation.',
      boundary: 'The product decision, any roadmap change, customer contact, record update, and external message.',
      flow: ['Call Decision System separates what customers actually said', 'Feedback Prioritization checks whether the pattern holds', 'Proof Library grounds a bounded next test or explanation'],
      installUrl: 'https://why57.com/skills/customer-decision-package/SKILL.md'
    },
    relationships: {
      name: 'Warm Reconnect',
      title: 'Turn real relationship evidence into a careful next move.',
      description: 'Start with people you already know and a small set of threads you chose. The package separates relationship evidence from a guess, builds a clear outreach plan, and applies your approved writing rules only after you choose a person and purpose.',
      skills: 'Relationship Map, Outreach Planner, and Voice Kit.',
      useCase: 'You need to reconnect, ask for an introduction, or clear a small follow-up queue without turning your inbox into a lead list.',
      output: 'A ranked relationship map, a supportable outreach plan, and approved voice rules for one later unsent draft.',
      boundary: 'Who is in scope, the reason to contact them now, every draft, and every message, schedule, contact record, or CRM change.',
      flow: ['Relationship Map checks the evidence in a small selected set', 'Outreach Planner proposes a reasoned next move or a no-contact decision', 'Voice Kit applies approved writing rules after you choose a person and purpose'],
      installUrl: 'https://why57.com/skills/relationship-reconnect-package/SKILL.md'
    }
  };

  let activePackage = 'demand';

  const renderPackageFlow = (steps) => {
    if (!aiExecutivePackageFlow) return;
    aiExecutivePackageFlow.replaceChildren(...steps.map((step, index) => {
      const item = document.createElement('li');
      const number = document.createElement('span');
      number.textContent = String(index + 1).padStart(2, '0');
      item.append(number, document.createTextNode(step));
      return item;
    }));
  };

  const renderPackage = (packageName) => {
    const selectedPackage = packages[packageName];
    if (!selectedPackage) return;
    activePackage = packageName;
    aiExecutivePackages.forEach((button) => {
      const selected = button.dataset.package === packageName;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    if (aiExecutivePackageName) aiExecutivePackageName.textContent = selectedPackage.name;
    if (aiExecutivePackageTitle) aiExecutivePackageTitle.textContent = selectedPackage.title;
    if (aiExecutivePackageDescription) aiExecutivePackageDescription.textContent = selectedPackage.description;
    if (aiExecutivePackageSkills) aiExecutivePackageSkills.textContent = selectedPackage.skills;
    if (aiExecutivePackageUseCase) aiExecutivePackageUseCase.textContent = selectedPackage.useCase;
    if (aiExecutivePackageOutput) aiExecutivePackageOutput.textContent = selectedPackage.output;
    if (aiExecutivePackageBoundary) aiExecutivePackageBoundary.textContent = selectedPackage.boundary;
    renderPackageFlow(selectedPackage.flow);
  };

  aiExecutiveLoadoutUrl?.addEventListener('click', async () => {
    try {
      await copyText(allSkillsUrl);
      setStatus(aiExecutiveInstallStatus, 'Full install link copied. Paste it into your compatible AI to install the library.');
      track('ai_executive_all_skills_url_copied', { location: 'cookbook_hero_full_suite' });
    } catch (_error) {
      setStatus(aiExecutiveInstallStatus, 'Copy did not work here. Open the skill list and copy the URL from your browser.');
    }
  });

  aiExecutiveLoadoutSource?.addEventListener('click', () => {
    track('ai_executive_all_skills_browsed', { location: 'cookbook_hero_full_suite' });
  });

  aiExecutivePackages.forEach((button) => {
    button.addEventListener('click', () => {
      renderPackage(button.dataset.package);
      setStatus(aiExecutivePackageStatus, 'Package selected. It installs every named skill, but runs only the step that fits the job in front of you.');
      track('ai_executive_package_selected', { package: button.dataset.package, location: 'cookbook_packages' });
    });
  });

  aiExecutivePackageUrl?.addEventListener('click', async () => {
    const selectedPackage = packages[activePackage];
    try {
      await copyText(selectedPackage.installUrl);
      setStatus(aiExecutivePackageStatus, 'Package install link copied. Paste it into your compatible AI to install only these skills.');
      track('ai_executive_package_url_copied', { package: activePackage, location: 'cookbook_packages' });
    } catch (_error) {
      setStatus(aiExecutivePackageStatus, 'Copy did not work here. Open the package contents and copy the URL from your browser.');
    }
  });

  aiExecutivePackageSource?.addEventListener('click', () => {
    track('ai_executive_package_breakdowns_browsed', { package: activePackage, location: 'cookbook_packages' });
  });

  renderPackage(activePackage);
})();
