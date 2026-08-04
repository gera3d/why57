# Voice Kit — Changelog

Every real change to `SKILL.md`, in order, with why it was made and what it actually improved. Kept separate from the skill file itself so the skill stays focused on instructions, not history.

---

## 2026-08-03 — v6: Calibration Mode, and samples/corrections moved to the owner's own Corpus file

**What changed:** Added a "Calibration Mode" section: an on-demand, repeatable loop (ask for a new sample in either register, draft a quick test, ask directly what's off, log the correction, offer another round) instead of only improving reactively when a mistake happens to surface. Alongside it, added an explicit rule that real samples and the dated corrections log belong in the owner's own separate Corpus file, never pasted into this shared SKILL.md.

**Why:** Built and tested first on a personal, single-owner version of this same kit. That version had drifted into embedding a full verbatim sample and a growing corrections table directly inside the skill file itself, which meant the skill's instructions and one person's private data were the same file. The owner explicitly asked that answers to calibration questions be stored outside the skill, with the skill only responsible for asking the questions, and asked that this work for anyone who installs it, not just for them.

**What it improved:** Two things. First, it gives this kit an active way to get more accurate over time (Calibration Mode) instead of waiting for feedback to happen by chance. Second, it keeps this shared skill file free of any one owner's personal text, each installer grows their own Corpus file, so the skill stays generic and reusable rather than accumulating one person's private samples inside a file meant for everyone.

---

## 2026-08-03 — v5: Added "let the assistant look" as a second intake path

**What changed:** Alongside pasting or linking a sample, the owner can now say "just go look" and let the assistant browse to a page it names directly (the owner's own YouTube channel, blog, LinkedIn), using a browser session that's already signed in. Scoped tightly: only pages the owner names as their own, no wandering to other links, no signing into anything new, and explicitly off-limits even with a signed-in session: inbox, DMs, drafts, account settings.

**Why:** Manually finding a link, opening it, copying the transcript or post text, and pasting it back is real friction, especially for someone who just wants to say "look at my blog." Requiring that copy-paste step by hand was busywork the tooling could remove where a connected browser is available.

**What it improved:** Removes a manual step for owners whose AI tool has browser access, without loosening any boundary. The scope-limiting language (named pages only, no private areas, no new logins) was written at the same time as the capability, not bolted on after, specifically so this convenience doesn't quietly turn into "read whatever you can reach."

---

## 2026-08-03 — v4: Automatic redaction of third-party names/sensitive details

**What changed:** Redacting another person's name or a sensitive detail out of a shared sample is now something the skill does automatically before using that text in a pattern list or draft, instead of asking the owner to pre-clean samples themselves.

**Why:** Found during a post-simplification verification pass (see v3), not requested directly. The v3 friction-cutting rewrite accidentally dropped the redaction instruction entirely along with the process it was trimming. A real pasted email or transcript will often contain a third party's name or a client detail, and nothing in v3's text screened that out before it could end up in a pattern list or a public draft.

**What it improved:** Closes a real exposure gap without reintroducing any friction, it's a silent, automatic step, not a new question or confirmation the owner has to answer.

---

## 2026-08-03 — v3: Cut mandatory intake/approval process that was causing refusal-like friction

**What changed:** Removed: mandatory register/channel/audience labeling before any draft, a hard gate requiring the owner to approve a full "Guide" before the assistant could draft anything, a second mandatory Q&A round for "the brief" even when the request already answered it, a required 1-5 scoring rubric across six dimensions on every first task, and a long "Hold the boundary" restatement at the end of low-stakes requests. Replaced with: draft immediately from whatever's shared, show the observed patterns alongside the draft instead of gating on approval, ask a direct question only when a fact the draft actually needs is missing, and state confidence in one casual line.

**Why:** The owner's direct feedback: *"I kind of hate all the privacy and security stuff you built into it, it makes the AI say no to me more often, and that's not the focus of these skills, the focus is the value they can get from it."* Ran a stress test simulating three realistic first-time requests (a single YouTube link asking for LinkedIn posts, a single pasted email asking for a product-announcement post, a single casual transcript asking for one tweet) against the literal v2 instructions. Result: every scenario took 3-4 rounds of clarifying questions and gates before the user got any usable draft at all, including the tweet request, which the owner would reasonably expect to be near-instant.

**What it improved:** Re-tested the rewritten version against the same three scenarios. Two of three produced a usable draft in a single turn; the third asked exactly one question, and only because the topic itself was genuinely never stated (a real missing fact, not procedural caution). Confirmed separately that the one boundary that actually matters, never send/publish/spend money/change an account on the owner's behalf, still held and was stated in one plain line rather than a boilerplate warning.

---

## 2026-08-03 — v2: Two-tier Corpus + Guide, anti-cliché check

**What changed:** Introduced the split between a private, verbatim source Corpus and a clean, distilled Guide, plus a mandatory check: before using any notably punchy or quotable phrase in a draft, check it against the real sample text, and if nothing like it is there, treat it as invented and rewrite it plainly.

**Why:** Direct, real-world failure, caught by the owner, not inferred. A drafted post used the phrase "writing a slick line about it." The owner's reaction: *"slick line? What the hell."* Nobody in any real sample had ever said that. Research into LLM style-emulation (short-fragment/abstracted-rule prompting vs. large verbatim-text conditioning) confirmed the mechanism: a model given a rule like "be direct" invents new phrasing that satisfies the rule instead of recalling the person's actual words, especially when the only reference material is short quoted fragments rather than real, substantial text.

**What it improved:** Gave every future draft a real text to check quotable-sounding phrases against before using them, closing the specific failure mode that produced "slick line" and anything in that same family.

---

## 2026-08-02 — v1: Initial multi-source Voice Kit

**What changed:** First version. Intake from YouTube talks, published posts, sent emails, or real conversations; builds a Guide of observed writing patterns; drafts against a current brief; runs a red-flag pass for generic AI phrasing.

**Why:** Baseline recipe for the AI Executive Cookbook: turn real writing/speech samples into a reusable spec so AI-generated writing follows a real person's observable patterns instead of a generic house style.

**What it improved:** Established the core mechanism (real samples → observed patterns → checked draft) that every later version refines, rather than replaces.
