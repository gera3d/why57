(() => {
  const copyButton = document.getElementById('voiceKitInstallCopy');
  const status = document.getElementById('voiceKitInstallStatus');

  if (!copyButton) return;

  const voiceKitUrl = 'https://why57.com/skills/voice-kit/SKILL.md';
  const installInstruction = `Download the Voice Kit skill from ${voiceKitUrl}. Save it as skills/voice-kit/SKILL.md, or in this environment's equivalent skills folder. Read it before doing any work. Use it with real samples I selected or am authorized to use. Start by drafting the current request, show the observed patterns alongside the draft, and let my direct feedback override inferred patterns. Do not send, publish, or change an account.`;

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

  copyButton.addEventListener('click', async () => {
    try {
      await copyText(installInstruction);
      if (status) status.textContent = 'Install instruction copied. Paste it into an AI that supports skills when you are ready.';
      window.why57Analytics?.track('voice_kit_install_instruction_copied', { location: 'cookbook_launch' });
    } catch (_error) {
      if (status) status.textContent = 'Copy did not work here. Open the Voice Kit skill breakdown and copy the install instruction there.';
    }
  });
})();
