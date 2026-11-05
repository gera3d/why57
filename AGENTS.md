# AGENTS.md — why57.com Standing Orders

Static marketing site for why57.com (plain HTML/CSS/JS, hosted on GitHub Pages). This file is for autonomous coding agents (DeepSeek Harness, SuperAgent, Claude Code). Read it fully before editing.

The application (voice-to-idea product) is a separate repo, `gera3d/goodidea`. Do not add app code here.

---

## 1. Deployment reality (read this first)
* **Every push to `main` deploys to production** via `.github/workflows/deploy.yml` (SEO audit -> Firebase config injection -> GitHub Pages).
* Therefore: **never push to `main`. Never merge your own PR.** Work on `agent/<ticket-id>-<slug>` and open a PR.
* The whole repo root is published (`path: '.'`). Anything you add to the root is public. Do not put private notes, credentials, or client-confidential material in this repo.

## 2. The Golden Verification Command
```bash
npm run qa
```
Node standard library only, no install, no network. It runs `qa/site-qa.mjs` (links, canonicals, titles/meta, sitemap coverage, a11y names, analytics hooks), `qa/js-syntax.mjs`, and `tests/*.test.cjs`.

* The task is not done until `npm run qa` exits 0. Warnings (e.g. title length) do not fail the run, but do not add new ones.
* Also run, when your change touches layout, CTAs, or forms (needs Playwright; see `qa/README.md`):
  * `npm run qa:mobile` — 390x844 smoke test
  * `npm run qa:funnel` — funnel contract smoke test
* `npm run qa:external` makes live network checks. Do not run it unless the ticket asks.
* If `npm run qa` was already failing before your change, say so in the PR with the failing test names. Do not "fix" unrelated failures by editing tests to pass, and do not weaken assertions.

## 3. Negative constraints
* **Secrets:** never commit `site-config.js` (git-ignored, generated in CI from secrets) or any key/token. `site-config.example.js` is the committed template.
* **Indexing:** every indexed page needs exactly one self-referencing canonical, one `<title>`, one meta description, one `<h1>`, Open Graph tags, and an entry in `sitemap.xml`. `noindex` pages (e.g. `proposals/`) stay `noindex` and stay out of the sitemap. Check `CONTENT-INDEXING-MAP.md` before adding, renaming, or removing a page.
* **Claims and proof:** do not invent or change client names, metrics, certifications, or case-study claims. Proof sources live in `PROOF-SOURCE-LEDGER.md`; government capability evidence is retained outside this repo. If a ticket needs a new claim, stop and ask.
* **No new dependencies or build tooling.** The site is deliberately dependency-free. No bundlers, frameworks, or npm packages.
* **Do not edit** `CNAME`, `.github/workflows/deploy.yml`, `robots.txt`, or `sitemap.xml` unless the ticket explicitly says so (sitemap changes are expected when adding/removing an indexed page).
* **Analytics:** keep existing `data-*` analytics hooks and GA4 bootstrap intact; `qa/site-qa.mjs` and `tests/analytics.test.cjs` assert them.
* **Surgical diffs:** touch only files the ticket requires. No drive-by reformatting of large HTML files.

## 4. Progressive disclosure — where to read more
| Need | Read |
|---|---|
| Which pages are indexed and why | `CONTENT-INDEXING-MAP.md` |
| Where claims/proof come from | `PROOF-SOURCE-LEDGER.md` |
| GA4 / conversion tracking | `ANALYTICS.md`, `docs/ga4-conversion-validation.md` |
| ROI calculator bridge | `ROI-INTEGRATION.md` |
| QA harness details | `qa/README.md` |
| Release checklists | `docs/*.md` |

## 5. Definition of Done
- [ ] Acceptance criteria in the ticket are met.
- [ ] `npm run qa` exits 0 (or pre-existing failures are documented in the PR).
- [ ] Mobile/funnel smoke run if layout, CTA, or form changed.
- [ ] Indexing map and sitemap updated if an indexed page was added/removed/renamed.
- [ ] Branch `agent/<ticket-id>-<slug>`; PR body says `Closes #<id>` and lists verification evidence.
