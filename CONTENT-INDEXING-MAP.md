# Why57 content and indexing map

Last updated: 2026-07-23

This map defines the intended search role of the local and AI prototype content. It favors a small set of substantive destinations over overlapping city pages.

## Indexable destinations

| URL | Primary intent | Supporting intent | Evidence / author signal | Main internal links |
| --- | --- | --- | --- | --- |
| `/` | Custom software company / service overview | Automation, portals, reviews, integrations, ROI | Named client and venture case-study links authorized by the site owner; quantitative proof is maintained in the restoration control record | All three regional hubs, all three AI guides, five case studies |
| `/sonoma-county-software-development.html` | Sonoma County custom software development | Workflow automation, portals, integrations, AI prototype production | Gera Yeremin byline; implementation links that route to named case studies | Case studies, AI pillar, readiness checklist, Bay Area hub |
| `/bay-area-business-automation.html` | Bay Area business automation | Multi-location operations, integrations, client portals, build-vs-buy | Gera Yeremin byline; named case studies carry the relevant client-work detail | Case studies, AI pillar, repair/rebuild guide, Sonoma and Silicon Valley hubs |
| `/silicon-valley-software-consulting.html` | Product-delivery software consulting | Prototype review, due diligence, delivery recovery, fractional technical help | Gera Yeremin byline; named case-study links for platform and product work | AI pillar, readiness checklist, repair/rebuild guide, case-study links |
| `/ai-app-prototype-to-production.html` | Turn a Claude or AI-built prototype into a product | Production process, readiness, risks, service fit | Gera Yeremin byline; named case studies provide supporting implementation context | Readiness/security checklist, repair/rebuild guide, Silicon Valley consulting, case-study links |
| `/ai-prototype-readiness-security-checklist.html` | AI app production-readiness checklist | AI prototype security risks, launch evidence, review preparation | Gera Yeremin author; explicit specialist and review boundaries | AI pillar, repair/rebuild guide, Silicon Valley consulting |
| `/ai-prototype-repair-rebuild-cost.html` | Repair vs. rebuild an AI app | Productionization cost, timeline, assessment and quoting process | Gera Yeremin byline; input-based pricing guidance without a public price or timing claim | AI pillar, readiness checklist, Silicon Valley consulting |
| `/government-capabilities.html` | YRC STRATEGIES government software capabilities | Website modernization, public content, document libraries, workflow tools, dashboards, integrations, QA | Current SAM activation, California SB certification, Cal eProcure bidder registration, California entity record, dated capability statement, and current general-liability certificate retained outside the public repository | Homepage service bridge and navigation; capability statement; home services; AI guide; privacy; terms |

All indexable destinations must have:

- A self-referencing canonical.
- `index,follow` or no restrictive robots directive.
- One descriptive `<title>`, one meta description, and one `<h1>`.
- Open Graph title, description, image, URL, and type.
- Valid JSON-LD with an author or service/provider relationship.
- At least one contextual internal link from another indexable page.
- No unsupported clients, reviews, addresses, performance claims, market statistics, or local-office implications.

## Consolidated location URLs

| Existing URL | Indexing state | Canonical / destination | Reason |
| --- | --- | --- | --- |
| `/santa-rosa-software-development.html` | `noindex,follow` | `/sonoma-county-software-development.html` | Nearly identical city variant; Santa Rosa service-area information now lives in the Sonoma County hub. |
| `/petaluma-software-development.html` | `noindex,follow` | `/sonoma-county-software-development.html` | Nearly identical city variant; Petaluma service-area information now lives in the Sonoma County hub. |
| `/marin-county-software-development.html` | `noindex,follow` | `/bay-area-business-automation.html` | Overlapping regional service page; the Bay Area hub carries the substantive automation guidance without a named-client claim. |
| `/napa-valley-tech-automation.html` | `noindex,follow` | `/bay-area-business-automation.html` | The old page relied on unsupported local-industry generalizations; the Bay Area hub focuses on supportable operational intent. |

The four consolidated pages are excluded from `sitemap.xml`, contain matching canonicals, and provide an immediate visible/meta-refresh handoff. After hosting configuration is confirmed, replace client-side handoffs with server-side permanent redirects and retain the destination URLs in internal navigation.

## Intent separation

### Regional cluster

- **Sonoma County:** workflow software, professional services, service teams, field operations, and regional buying guidance without an unverified office or named-client claim.
- **Bay Area:** business-process automation, system integration, multi-location operations, build-vs-buy, and regional delivery guidance without an unverified office or named-client claim.
- **Silicon Valley:** product-delivery consulting, AI prototype review, due diligence, and delivery recovery without claiming a local office, local clients, or unsupported seniority.

### AI prototype cluster

- **Pillar:** explains the complete move from prototype to owned product and routes readers to the right decision resource.
- **Readiness/security checklist:** answers “what must be verified before launch?” with artifacts, common risks, release levels, and specialist boundaries.
- **Repair/rebuild/cost guide:** answers “what should we keep, what will this process involve, and what drives the quote?” without claiming a universal price.

### Government capability destination

- **Government capabilities:** names YRC STRATEGIES as the contracting entity, publishes verified identifiers and service categories, separates commercial work samples from government past performance, and links the dated one-page capability statement.
- The page does not describe 57 or WHY57 as a filed trade name, certification, government customer, contract vehicle, reseller status, or cybersecurity compliance status.
- SAM, SBA Small Business Search, Cal eProcure, and local bid portals remain separate procurement records; this page does not replace or override them.

## Public proof disposition after branded case-study restoration

The site owner has attested that Health for California, DriveSavers, Nuvolum, Dent Experts / Storm Ops Flow, and UX Owl may be named and used as case studies. The homepage now routes to five named pages rather than anonymous summaries. The restoration control record keeps the source, metric, visual, and quote follow-up visible for the production release.

Current public dispositions:

- **Authorized for this branch:** client and venture names, selected marks or wordmarks, case-study relationships, the specified implementation narratives, and the three attributed client perspectives.
- **Requires retained source before production release:** the underlying exports, captures, and original quote records identified in `docs/branded-case-study-restoration-control.md` and `PROOF-SOURCE-LEDGER.md`.
- **Still excluded:** unverified general experience, client-count, ROI, price, timeline, rating, or government-past-performance claims that sit outside the five approved case studies.

## Post-release indexing QA

1. Confirm all three new/rewritten AI URLs and all three regional hubs return HTTP 200.
2. Confirm the four consolidated URLs return a server-side 301 once hosting supports it; until then confirm their `noindex,follow`, canonical, and meta-refresh destinations.
3. Submit the updated sitemap in Google Search Console and inspect the six indexable cluster URLs.
4. Request removal only if a retired URL continues to appear after the canonical/noindex or permanent redirect has been processed; do not remove the destination.
5. Check rendered canonical, robots, title, description, structured data, and internal links in production.
6. Re-run `npm run qa`, `node scripts/seo-audit.mjs`, the public-claim/secret scans, and the Playwright mobile smoke before each content release.

Search Console inspection, sitemap submission, and production redirect verification require access to the deployed property or its hosting configuration and are intentionally not performed in this worktree.
