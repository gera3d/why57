# Capability statement rebuild brief — 2026-07-25

Purpose: hand this to whichever AI/agent rebuilds the YRC STRATEGIES capability statement PDF next, so it doesn't have to guess at facts, paths, or repeat errors already sent to real government contacts.

## Verified identifiers (do not alter)

- Legal entity: **YRC STRATEGIES** (California stock corporation, entity 3980043; active/good standing when reviewed June 30, 2026)
- UEI: **ZAFSRK2VT8L6**
- CAGE: **22C63**
- SAM.gov: Active; renewal due **June 30, 2027**
- State of California Small Business (SB Micro) certification ID: **2053713** (approved July 18, 2026) — **NOT** 2026104 (see errors section below)
- Cal eProcure registered sourcing bidder ID: **BID0132231**
- Principal / project lead: **Georgiy Yeremin**
- Email: **gera@why57.com**
- Phone: **(707) 694-5624**
- Website: **why57.com**
- General liability: **$1,000,000 each occurrence / $2,000,000 aggregate**, current through July 14, 2027
- Location: Forestville, California

Source of truth for all of the above: `docs/yrc-government-procurement-evidence-register-2026-07-18.md` and `docs/yrc-government-capability-release-checklist.md` in this repo.

## NAICS codes — exactly 5, no more

Source: release checklist, "NAICS registered in SAM":

- 541511 — Custom Computer Programming Services
- 518210 — Computing Infrastructure, Data Processing & Hosting
- 541512 — Computer Systems Design Services
- 541611 — Administrative & General Management Consulting
- 541990 — All Other Professional & Technical Services

**Do not include 541519** (Other Computer Related Services). It is not registered in SAM. It was mistakenly present as a 6th code in the PDF version that was live until today (2026-07-25).

## UNSPSC codes — exactly 5

Verified 4, already used on `government-capabilities.html` and in the version reviewed with Norcal APEX advisor Liz on the July 24 call:

- 81112103 — World Wide Web Site Design Services
- 81111503 — Systems Integration Design Services
- 81111504 — Application Programming Services
- 81111603 — HTML Programming Services

5th, currently missing — **add this one**:

- 81111506 — per a general public UNSPSC taxonomy lookup, this commodity is titled "Client server programming services." This was **not** independently confirmed against Gera's own Cal eProcure registration — do that confirmation before publishing rather than trusting this title as-is. Do not substitute a different code without checking the actual Cal eProcure profile first (see errors section — this exact mistake already happened).

## Rebuild environment on this Mac

Two `python3` installs exist:

- `/usr/bin/python3` (3.9.6) — **already has reportlab 4.5.1 installed.** Use this one directly, no install step needed:
  `/usr/bin/python3 your_script.py`
- `/opt/homebrew/bin/python3` — does **not** have reportlab. Installing via its pip fails with a PEP 668 "externally-managed-environment" error. If you must use this one:
  `/opt/homebrew/bin/pip3 install reportlab --break-system-packages`

Prefer `/usr/bin/python3` to skip the install step entirely.

## Exact local paths

- Feature-branch repo (branch `codex/branded-case-studies`, use this one): `/Users/gerayeremin/Documents/New project/why57-branded-case-studies`
- Main-branch worktree: `/Users/gerayeremin/Documents/New project/why57` — **do not use this one for editing.** As of 2026-07-25 it is 57 commits behind `origin/main` and has a pile of unrelated uncommitted local changes. Use the feature-branch repo above and push to `main` the same way this session did (see deployment mechanics below).
- PDF to overwrite — **preserve this exact filename**, six links across the site point to it:
  `/Users/gerayeremin/Documents/New project/why57-branded-case-studies/downloads/YRC_STRATEGIES_Capability_Statement_2026-07-17.pdf`
- Page that links to it: `/Users/gerayeremin/Documents/New project/why57-branded-case-studies/government-capabilities.html` (link occurrences at lines 330, 343, 530, 574, 594, and in the footer)
- Evidence docs:
  - `/Users/gerayeremin/Documents/New project/why57-branded-case-studies/docs/yrc-government-procurement-evidence-register-2026-07-18.md`
  - `/Users/gerayeremin/Documents/New project/why57-branded-case-studies/docs/yrc-government-capability-release-checklist.md`

## What NOT to do — real errors already made, do not repeat them

1. **No dark/black background.** Norcal APEX advisor Liz told Gera directly on the July 24 call that government agencies commonly print in black-and-white/grayscale, and a dark background doesn't survive that. Use a white/light background suitable for grayscale printing.
2. **Never list a bare code number without its plain-English title.** Liz's exact feedback: "the very first thing, as an agency representative, I would look at the codes... you only have the number, you don't have the description." Every NAICS and UNSPSC code needs its title next to it.
3. **Do not include NAICS 541519** — not registered in SAM, was wrongly in the version replaced today.
4. **Do not use SB/Micro Certification ID "2026104."** That number was sent in two live outreach emails on 2026-07-25 (to a Cal OES contact and a DMV contact). The correct, verified ID is **2053713**. This has already gone out to real state contacts with the wrong number — Gera may want to send corrections.
5. **Do not invent or vary UNSPSC codes between documents.** The same two 2026-07-25 outreach emails used fabricated codes — 83111603 ("Web Apps") and 80111600 ("IT Support") — that don't match the verified 5-code list above and don't appear in any other verified source. Use only the verified list, identically, everywhere it appears.
6. **Do not add any claim the evidence register/release checklist excludes:** no 8(a), WOSB, SDVOSB, HUBZone, MBE, FBE, or other certification beyond the California SB certification; no CMMC/FedRAMP/NIST/ATO/security-clearance claims; no government past performance, agency references, or contract awards. Commercial work samples only, and label them as commercial, not government past performance.
7. **Open policy conflict — flag back to Gera, don't silently resolve it:** the 2026-07-18 release checklist explicitly lists "PSC or UNSPSC codes" under "Claims intentionally omitted." The July 24 APEX conversation and this brief now call for including UNSPSC codes. That's a reversal of a documented decision — worth a one-line confirmation from Gera before publishing, and the checklist doc should be updated to match once confirmed.

## Deployment mechanics

- `.github/workflows/deploy.yml` only triggers on push to `main`.
- This repo's `main` and `codex/branded-case-studies` are separate git worktrees kept in sync manually. Today's pattern (repeat it):
  1. Commit the change on `codex/branded-case-studies`, push that branch.
  2. `git fetch origin`, then `git checkout -b <temp-branch> origin/main`
  3. `git cherry-pick <the commit sha>`
  4. `git push origin <temp-branch>:main`
  5. Delete the temp branch locally, switch back to `codex/branded-case-studies`.
- Confirm the deploy: `gh run list --branch main --limit 3` should show a successful "Deploy to GitHub Pages" run.
- Confirm the file is actually live: fetch `https://why57.com/downloads/YRC_STRATEGIES_Capability_Statement_2026-07-17.pdf` directly and check the content, not just the HTTP status.

## Credentials / access

`git push` to `https://github.com/gera3d/why57.git` and the `gh` CLI already work from this Mac — used successfully today (2026-07-25) to deploy twice. If the other AI runs as an agent on this same machine, it needs nothing further. If it's a cloud-hosted agent without access to this Mac, it will need either a credentialed clone of the repo or Gera to run the final `git push` himself.
