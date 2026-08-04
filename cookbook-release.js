(() => {
  const manifestUrl = 'https://raw.githubusercontent.com/gera3d/ai-executive-cookbook/master/version.json';
  const slots = [...document.querySelectorAll('[data-cookbook-skill-release]')];

  if (!slots.length) return;

  const formatDate = (value) => {
    const date = new Date(`${value}T12:00:00Z`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
  };

  const setText = (slot, selector, value) => {
    const node = slot.querySelector(selector);
    if (node) node.textContent = value;
  };

  const showRelease = (slot, skill) => {
    setText(slot, '[data-release-name]', skill.name === 'executive-cookbook-voice-kit' ? 'Voice Kit' : skill.name);
    setText(slot, '[data-release-version]', `v${skill.version}`);
    setText(slot, '[data-release-updated]', `Published source updated ${formatDate(skill.updated)}.`);
    const summary = slot.querySelector('[data-release-summary]');
    if (summary) {
      summary.textContent = skill.summary;
      summary.hidden = false;
    }
  };

  const showFallback = (slot) => {
    setText(slot, '[data-release-version]', 'Version details unavailable');
    setText(slot, '[data-release-updated]', 'Open the source or changelog on GitHub to check the current published version.');
  };

  fetch(manifestUrl, { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
      return response.json();
    })
    .then((manifest) => {
      slots.forEach((slot) => {
        const skill = manifest.skills?.find((entry) => entry.name === slot.dataset.cookbookSkillRelease);
        if (!skill?.version || !skill?.updated || !skill?.summary) throw new Error('Voice Kit release metadata is incomplete');
        showRelease(slot, skill);
      });
    })
    .catch(() => slots.forEach(showFallback));
})();
