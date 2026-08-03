---
name: voice-kit
description: Teach an AI to write like the owner instead of like generic AI, from whatever real writing or speech they share, a pasted link, a doc, an email, even one paragraph, or by letting the assistant browse to a page the owner names (their own YouTube channel, blog, LinkedIn) if a connected browser is available. Drafts immediately from what's given, no interview required first, and checks anything punchy-sounding against the real sample so it doesn't invent phrasing that only sounds plausible.
---

# Voice Kit

Make the model write like a specific person, not like AI. Give it real samples of that person's actual writing or speech, and check anything that sounds notably punchy or quotable against those real words before using it, so nothing gets invented that merely sounds plausible.

**The one idea that matters:** a voice kit built only from abstracted rules ("be direct," "avoid jargon") produces AI-sounding output, because a model given a rule like that invents new phrasing that satisfies the rule instead of recalling the owner's actual words. The fix is cheap: keep the real sample text on hand, and check quotable-sounding lines against it before using them. That's the whole mechanism. Everything below just applies it.

## How this works

1. **Take whatever's given, immediately.** One sample is enough to start: a link, a doc, a pasted email, a transcript, a paragraph. Don't ask for more sources before drafting anything. If more samples would sharpen it, mention that once, briefly, after the first draft, not as a precondition.
2. **Draft first, from the current request.** Most requests already state the audience, channel, and topic. Don't run a separate intake interview before drafting. Only ask a direct question when a fact that's actually needed for the draft is genuinely missing.
3. **Show the pattern list alongside the draft, not as a form to approve first.** Pull out a few real, observable patterns from the sample (an actual verbal tic, a real intensifier, a real structural move) and show them next to the output so the owner can correct anything off, rather than gating the draft behind an approval step.
4. **Say the confidence level in one line, casually.** ("This is based on one sample so far, treat word-choice calls as provisional.") Not a formal one-off/uncertain tag on every rule.

## Two ways to get a sample: paste it, or let the assistant look

Either is fine, offer both when the environment supports it:

- **The owner pastes or links it.** A YouTube URL, a blog post, a pasted email, a transcript. Read it directly.
- **The owner says "just go look."** If the assistant has a connected browser already signed into the owner's own accounts, it can navigate to a page the owner names and pull the content itself: "check my YouTube channel," "look at my blog," "see my LinkedIn posts." Only visit pages the owner names as their own. Don't wander to unrelated pages, don't follow outbound links looking for more, and don't sign into anything new, use only the session that's already there.
- Either path produces the same thing: a real sample read directly, not a secondhand summary of one.
- Stay on public, owner-authored pages only. Even with a signed-in session available, don't open inbox, DMs, drafts, or account settings while "looking," that's not what "look at my blog" means.

## Pulling patterns from a sample

State each pattern as something countable and real: a repeated phrase, a sentence-length habit, how they open or close a thought, a real intensifier, a structural move they actually use. Give a short real example for each. When there's no evidence for something, say so plainly rather than guessing or padding with a vague label like "professional" or "authentic."

## Before showing any draft, check it against the real sample

Scan the draft for anything that sounds notably punchy, clever, or quotable. If it doesn't resemble real phrasing in the sample, it's probably invented, not the owner's actual voice: cut it and say the plain version instead, even if that reads as less polished. Also cut, unless the sample shows the owner actually uses them: generic openers/closers ("I hope you're well," "Looking forward to hearing from you"), fake contrast ("This isn't X, it's Y"), empty intensifiers ("game-changing," "seamless," "transformative"), corporate filler ("leverage," "unlock," "streamline"), em dashes, and formulaic three-item lists the source doesn't use.

## Short-form (LinkedIn/X/social) needs its own shape, not just a shorter version of long-form

Short-form fails in two extra ways beyond word choice: dense paragraph blocks, and framing a real setback as the whole point of the post, which reads as "I built something bad" rather than a confident story. For short-form specifically:

- Max two short sentences per block or slide, one idea per block.
- If a product or the owner's own work is part of the story, the shape is: a real detail, then the evidence, then what was learned, then what now works, then a confident, low-pressure ask. A mistake can be one detail inside that arc; it should never be the framing of the whole piece.
- If there's an accompanying carousel or visual, match its beats to the caption 1:1, in the same order.

## Keep samples and corrections in the owner's own Corpus file, separate from this skill

This skill is the logic: how to pull patterns, how to draft, how to check a draft. It is not the data. The real samples (whatever was pasted, linked, or browsed) and the dated log of the owner's direct corrections belong in a separate file the owner keeps for themselves, for example `voice-corpus.md` alongside wherever they keep this kit. Call it the Corpus file.

- **Don't paste large samples or a running corrections log into this SKILL.md.** This file is shared logic; the Corpus file is one owner's private data. Keeping them apart is what lets the same skill work for any installer, each owner grows their own Corpus file, the skill itself never changes to hold anyone's personal text.
- If no Corpus file exists yet for this owner, create one on first use: a short header noting it holds real samples plus a corrections log, then the first sample underneath.
- Before drafting anything short-form or high-stakes, read the Corpus file directly rather than working from memory of it.
- Every correction or confirmation from the owner gets appended to the Corpus file's corrections log, dated, in their own words, with what it established, not folded into this skill's instructions.

## Calibration Mode (say "let's calibrate" to run this)

An on-demand, repeatable way to deepen accuracy, rather than only improving by accident when a mistake surfaces later.

1. **Ask for a new sample, either register.** "Got something new to add? Either works: something you'd say out loud, or something you'd write." Talking and writing are separate registers, tracked separately, since word choice and rhythm differ between them. If nothing new, use the existing Corpus file.
2. **Draft a quick test** targeting whatever's currently thinnest (fewest samples, or a channel/register not covered yet).
3. **Ask directly:** "Does this sound like you? If not, what's off, specifically?" Don't accept a vague reaction, push for the concrete thing that's wrong, word choice, sentence structure, punctuation, framing, or something else.
4. **Append the correction to the Corpus file immediately**, dated, verbatim, with what it establishes. If it changes a rule this skill should apply generally (not just for this owner), that's still fine to note, but the raw evidence, the exact words, stays in the Corpus file, never copied into this shared SKILL.md.
5. **Offer another round right away.** This is a tightening loop, not a one-time setup.

Direct feedback from the owner ("I don't write like that") always overrides an inferred pattern. More samples, especially relaxed/unscripted ones, sharpen the kit further (a real conversation beats a rehearsed talk for actual word choice). Offer Calibration Mode after delivering something useful, not before.

## What this skill doesn't do

- Doesn't read a full inbox, drive, or archive. Works only from what's shared directly.
- Doesn't use anyone else's writing as the owner's sample, or a source that's clearly someone else's work.
- Redacts any other person's name or sensitive detail found in a shared sample before using it in a pattern list or a draft. Do this automatically; don't ask the owner to pre-redact before sharing.
- Doesn't send, publish, submit, spend money, or change an account. The owner reviews and takes every consequential action themselves.

---

*Maintenance note: any change to this file gets a matching entry in `CHANGELOG.md` in this same folder, stating what changed, why (what real feedback or failure prompted it), and what it actually improved. No silent edits.*
