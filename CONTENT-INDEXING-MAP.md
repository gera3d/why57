# Why57 content and indexing map

Last updated: 2026-07-15

This map defines the intended search role of the local and AI prototype content. It favors a small set of substantive destinations over overlapping city pages.

## Indexable destinations

| URL | Primary intent | Supporting intent | Evidence / author signal | Main internal links |
| --- | --- | --- | --- | --- |
| `/` | Custom software company / service overview | Automation, portals, reviews, integrations, ROI | Team profiles and links to published case studies | All three regional hubs, all three AI guides, case studies |
| `/sonoma-county-software-development.html` | Sonoma County custom software development | Workflow automation, portals, integrations, AI prototype production | Gera Yeremin author block; UX Owl Sonoma attorneys case study; precise Rohnert Park and service-area language | UX Owl, Health for California, Dent Experts, AI pillar, readiness checklist, Bay Area hub |
| `/bay-area-business-automation.html` | Bay Area business automation | Multi-location operations, integrations, client portals, build-vs-buy | Gera Yeremin author block; DriveSavers Novato case study; explicit no-fake-office language | DriveSavers, Nuvolum, AI pillar, repair/rebuild guide, Sonoma and Silicon Valley hubs |
| `/silicon-valley-software-consulting.html` | Product-delivery software consulting | Prototype review, due diligence, delivery recovery, fractional technical help | Gera Yeremin author block; Nuvolum platform case study; explicit no-Silicon-Valley-office language | AI pillar, readiness checklist, repair/rebuild guide, Nuvolum |
| `/ai-app-prototype-to-production.html` | Turn a Claude or AI-built prototype into a product | Production process, readiness, risks, service fit | Gera Yeremin author; Nuvolum and Health for California proof | Readiness/security checklist, repair/rebuild guide, Silicon Valley consulting, case studies |
| `/ai-prototype-readiness-security-checklist.html` | AI app production-readiness checklist | AI prototype security risks, launch evidence, review preparation | Gera Yeremin author; explicit specialist and review boundaries | AI pillar, repair/rebuild guide, Silicon Valley consulting |
| `/ai-prototype-repair-rebuild-cost.html` | Repair vs. rebuild an AI app | Productionization cost, timeline, assessment and quoting process | Gera Yeremin author; public 57 planning ranges clearly qualified | AI pillar, readiness checklist, Silicon Valley consulting |

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
| `/marin-county-software-development.html` | `noindex,follow` | `/bay-area-business-automation.html` | Overlapping regional service page; the Bay Area hub carries the supported Novato/DriveSavers proof. |
| `/napa-valley-tech-automation.html` | `noindex,follow` | `/bay-area-business-automation.html` | The old page relied on unsupported local-industry generalizations; the Bay Area hub focuses on supportable operational intent. |

The four consolidated pages are excluded from `sitemap.xml`, contain matching canonicals, and provide an immediate visible/meta-refresh handoff. After hosting configuration is confirmed, replace client-side handoffs with server-side permanent redirects and retain the destination URLs in internal navigation.

## Intent separation

### Regional cluster

- **Sonoma County:** local relationship, workflow software, professional services, service teams, field operations, and documented Sonoma attorney proof.
- **Bay Area:** business-process automation, system integration, multi-location operations, build-vs-buy, and documented Novato proof.
- **Silicon Valley:** senior product-delivery consulting, AI prototype review, due diligence, and delivery recovery. This page does not claim a local office or local clients.

### AI prototype cluster

- **Pillar:** explains the complete move from prototype to owned product and routes readers to the right decision resource.
- **Readiness/security checklist:** answers “what must be verified before launch?” with artifacts, common risks, release levels, and specialist boundaries.
- **Repair/rebuild/cost guide:** answers “what should we keep, what will this process involve, and what drives the quote?” without claiming a universal price.

## Supported proof inventory used in this rebuild

- UX Owl / Sonoma County attorneys: published case study reports a 30–50% increase in qualified leads.
- DriveSavers / Novato: published case study reports 300+ new five-star reviews in Q1, all-time-high traffic and conversions, and top-three rankings for more than 20 competitive keywords.
- Nuvolum: published case study reports 200+ custom site launches, deployment under four hours, and growth from seven to 50 employees over four years.
- Health for California: published case study reports growth from roughly 10 to more than 9,000 verified Google reviews over four years.
- 57's public homepage guidance: most focused custom projects are described as $5,000–$25,000 and four to eight weeks. AI pages qualify these as general planning ranges, not universal quotes.

## Post-release indexing QA

1. Confirm all three new/rewritten AI URLs and all three regional hubs return HTTP 200.
2. Confirm the four consolidated URLs return a server-side 301 once hosting supports it; until then confirm their `noindex,follow`, canonical, and meta-refresh destinations.
3. Submit the updated sitemap in Google Search Console and inspect the six indexable cluster URLs.
4. Request removal only if a retired URL continues to appear after the canonical/noindex or permanent redirect has been processed; do not remove the destination.
5. Check rendered canonical, robots, title, description, structured data, and internal links in production.
6. Re-run `python3 scripts/validate_content.py` before each content release.

Search Console inspection, sitemap submission, and production redirect verification require access to the deployed property or its hosting configuration and are intentionally not performed in this worktree.
