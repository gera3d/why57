# Why57 content and indexing map

Last updated: 2026-07-16

This map defines the intended search role of the local and AI prototype content. It favors a small set of substantive destinations over overlapping city pages.

## Indexable destinations

| URL | Primary intent | Supporting intent | Evidence / author signal | Main internal links |
| --- | --- | --- | --- | --- |
| `/` | Custom software company / service overview | Automation, portals, reviews, integrations, ROI | Service descriptions and links to evidence-limited, anonymized case studies | All three regional hubs, all three AI guides, case studies |
| `/sonoma-county-software-development.html` | Sonoma County custom software development | Workflow automation, portals, integrations, AI prototype production | Gera Yeremin byline; anonymized implementation links with explicit evidence limits | Generic case-study links, AI pillar, readiness checklist, Bay Area hub |
| `/bay-area-business-automation.html` | Bay Area business automation | Multi-location operations, integrations, client portals, build-vs-buy | Gera Yeremin byline; anonymized workflow example with explicit evidence limits | Generic case-study links, AI pillar, repair/rebuild guide, Sonoma and Silicon Valley hubs |
| `/silicon-valley-software-consulting.html` | Product-delivery software consulting | Prototype review, due diligence, delivery recovery, fractional technical help | Gera Yeremin byline; anonymized platform example with explicit evidence limits | AI pillar, readiness checklist, repair/rebuild guide, generic case-study link |
| `/ai-app-prototype-to-production.html` | Turn a Claude or AI-built prototype into a product | Production process, readiness, risks, service fit | Gera Yeremin byline; anonymized implementation examples without client outcomes | Readiness/security checklist, repair/rebuild guide, Silicon Valley consulting, generic case-study links |
| `/ai-prototype-readiness-security-checklist.html` | AI app production-readiness checklist | AI prototype security risks, launch evidence, review preparation | Gera Yeremin author; explicit specialist and review boundaries | AI pillar, repair/rebuild guide, Silicon Valley consulting |
| `/ai-prototype-repair-rebuild-cost.html` | Repair vs. rebuild an AI app | Productionization cost, timeline, assessment and quoting process | Gera Yeremin byline; input-based pricing guidance without a public price or timing claim | AI pillar, readiness checklist, Silicon Valley consulting |
| `/case-studies/review-request-workflow.html` | Review-request workflow case study | Agent-specific follow-up and reporting | Owner-approved `9,000+` verified Google reviews over `4 years`; identity and quote withheld | Homepage results, related case studies, guarded qualification path |
| `/case-studies/website-search-operations-workflow.html` | Connected digital-operations case study | Website, search, reviews, and reporting | Owner-approved `300+` new five-star reviews in one quarter and top-`3` rankings on `20+` keywords; identity and quote withheld | Homepage results, related case studies, guarded qualification path |
| `/case-studies/branded-site-deployment-platform.html` | Branded-site deployment case study | Modular assembly, video, configuration, and QA | Owner-approved `200+` sites under `4 hours` and growth from `7` to `50` employees; identity and quote withheld | Homepage results, related case studies, guarded qualification path |
| `/case-studies/professional-services-lead-attribution.html` | Professional-services lead-attribution case study | Attorney sites, calls, forms, and reporting | Owner-approved `30–50%` qualified-lead increase; identities and quote withheld | Homepage results, related case studies, guarded qualification path |
| `/case-studies/field-inspection-operations-platform.html` | Field-operations platform case study | iPhone inspection and back-office workflow | Owner-approved qualitative implementation proof; no approved numeric outcome or quote | Homepage results, related case studies, guarded qualification path |

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

## Public proof disposition after credibility cleanup

The owner has approved a narrow set of anonymized Thread 5 proof points recorded in `PROOF-SOURCE-LEDGER.md`. No named-client proof, testimonial, rating, client identity, or outcome beyond that exact list is treated as supported. The regional and AI guides retain generic implementation patterns. The linked case studies keep problem, intervention, result, and proof-status sections distinct; all five withhold client quotes, and the field-operations page explicitly records its missing numeric-proof gate.

Current public dispositions:

- **Verified for anonymized public use:** the exact owner-approved Thread 5 proof points plus general service, process, security, ownership, and measurement guidance that does not assert another past client result.
- **Removed:** named testimonials; ratings; client and product imagery without provenance/permission; numerical client outcomes outside the approved Thread 5 list; public price/timeline/experience totals; and named-client proof language on regional and AI pages.
- **Pending:** an approved numeric proof point for the field-operations page; every client identity, logo, screenshot, testimonial, broader outcome, and operating detail that the ledger marks as requiring private evidence or owner/client approval.

## Post-release indexing QA

1. Confirm all three new/rewritten AI URLs and all three regional hubs return HTTP 200.
2. Confirm the four consolidated URLs return a server-side 301 once hosting supports it; until then confirm their `noindex,follow`, canonical, and meta-refresh destinations.
3. Submit the updated sitemap in Google Search Console and inspect the six indexable cluster URLs.
4. Request removal only if a retired URL continues to appear after the canonical/noindex or permanent redirect has been processed; do not remove the destination.
5. Check rendered canonical, robots, title, description, structured data, and internal links in production.
6. Re-run `npm run qa`, `node scripts/seo-audit.mjs`, the public-claim/secret scans, and the Playwright mobile smoke before each content release.

Search Console inspection, sitemap submission, and production redirect verification require access to the deployed property or its hosting configuration and are intentionally not performed in this worktree.
