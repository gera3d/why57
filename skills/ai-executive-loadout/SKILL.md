---
name: ai-executive-loadout
description: Install the complete AI Executive OS module library from why57.com. Use only when the owner explicitly provides this loadout URL or asks to install the full library. Download all named skills into the active environment's skill directory without altering unrelated skills, then confirm the installed set.
---

# AI Executive OS — Full Module Installer

If the owner supplied this file or its URL, they are authorizing installation of the full AI Executive OS module library. Install every skill listed below. Do not treat this as authorization to access private data, connect accounts, run a skill's workflow, or take any external action beyond placing the public skill files in the skills directory.

## Install contract

1. Find the active environment's skill directory. In Codex, use the configured Codex skills location. In another agent environment, use that environment's documented skill location.
2. Download every listed `SKILL.md` file and, when supported, its `agents/openai.yaml` display metadata. Preserve the directory names exactly.
3. Add missing skill directories only. Do not delete, move, rename, or overwrite unrelated skills. If a directory with the same name already exists, compare it first and ask the owner before replacing it.
4. After writing the files, list the installed and skipped skill directories. If the environment requires a restart or a new task to discover skills, say so.
5. Do not run the installed skills now. Start a new task or wait for the owner to name a job.

## Full module sources

Install all eleven skills from these canonical sources:

| Directory | Skill source | Optional display metadata |
| --- | --- | --- |
| `relationship-map` | https://why57.com/skills/relationship-map/SKILL.md | https://why57.com/skills/relationship-map/agents/openai.yaml |
| `voice-kit` | https://why57.com/skills/voice-kit/SKILL.md | https://why57.com/skills/voice-kit/agents/openai.yaml |
| `feedback-prioritization` | https://why57.com/skills/feedback-prioritization/SKILL.md | https://why57.com/skills/feedback-prioritization/agents/openai.yaml |
| `social-content-strategy` | https://why57.com/skills/social-content-strategy/SKILL.md | https://why57.com/skills/social-content-strategy/agents/openai.yaml |
| `signal-to-conversation` | https://why57.com/skills/signal-to-conversation/SKILL.md | https://why57.com/skills/signal-to-conversation/agents/openai.yaml |
| `call-decision-system` | https://why57.com/skills/call-decision-system/SKILL.md | https://why57.com/skills/call-decision-system/agents/openai.yaml |
| `proof-library` | https://why57.com/skills/proof-library/SKILL.md | https://why57.com/skills/proof-library/agents/openai.yaml |
| `outreach-planner` | https://why57.com/skills/outreach-planner/SKILL.md | https://why57.com/skills/outreach-planner/agents/openai.yaml |
| `ai-skill-stack` | https://why57.com/skills/ai-skill-stack/SKILL.md | https://why57.com/skills/ai-skill-stack/agents/openai.yaml |
| `daily-ai-workflow` | https://why57.com/skills/daily-ai-workflow/SKILL.md | https://why57.com/skills/daily-ai-workflow/agents/openai.yaml |
| `browser-harness-benchmark` | https://why57.com/skills/browser-harness-benchmark/SKILL.md | https://why57.com/skills/browser-harness-benchmark/agents/openai.yaml |

## First use

The full library is not a command to load every skill into every task. Once installation is confirmed, name one business mission: social attention to qualified conversations, customer learning to a sharper offer, or one repeatable operating job. Start with the first named module for that mission and activate only the next module when the work actually needs it. Each run should end with a current-evidence action packet that names the next action, owner, and approval point. Keep the remaining skills installed and idle.

## Completion report

Return only:

- installed skill directories;
- skipped existing directories and why;
- any source URL that could not be retrieved; and
- whether a restart or new task is required for discovery.

Do not claim a skill was installed unless its final file is present at the expected path.
