# Branded case-study restoration control

Status: working control record; no public release authorized by this file
Owner: Gera Yeremin
Created: 2026-07-23
Production base: `d9778eadf7286ed3ea70d377a2abd9cf75dfdcd2`
Working branch: `codex/branded-case-studies`

## Direction confirmed by the owner

Gera confirmed on 2026-07-23 that he has permission from the people involved to use these projects as case studies and wants the client brands restored. The working drafts should therefore name the approved brands and use approved logos rather than defaulting to anonymous portfolio summaries.

This owner confirmation authorizes branded drafting. Before public release, the existing permission record for each brand must be linked in the private source package so the repository ledger and the public page do not drift apart. This is a records step, not a request to seek permission again.

Permission to identify a project does not by itself verify a metric, causal claim, testimonial wording, production status, integration, screenshot, likeness, or third-party mark. Those items are tracked separately below.

## Release boundary

This workstream may:

- restore approved client and venture names in working drafts;
- prepare approved logos and product visuals;
- rewrite the homepage and five case-study pages locally;
- prepare direct redirect, sitemap, canonical, metadata, and structured-data changes; and
- run local and preview QA.

This workstream must not, without a separate release checkpoint:

- deploy the public website;
- change Cloudflare redirects;
- change Search Console;
- publish a metric without its definition, comparison window, and retained source;
- present a concept rendering as a production screenshot; or
- describe commercial work as government past performance.

## Public-page decisions

1. Remove the homepage `Proof standard` box and all `evidence-limited case study` labels in the coordinated branded release.
2. Show the five approved brands as real client or venture work.
3. Use no more than three outcome measures on a case-study page and no more than one lead measure on a homepage card.
4. Prefer one strong, sourced outcome over a stack of loosely related numbers.
5. Use exact relationship language: client, product deployment, co-founded venture, or other confirmed relationship.
6. Keep proof administration private. Public caveats should appear only when they help a buyer understand attribution, scope, or methodology.

## Route restoration matrix

The live edge currently redirects each original branded route to its temporary anonymous replacement. The coordinated branded release should reverse the direction only after the existing rules are removed. Both directions must never be active together.

| Brand | Temporary live canonical | Branded canonical to restore | Required direct redirect after release |
| --- | --- | --- | --- |
| Health for California | `/case-studies/review-request-workflow.html` | `/case-studies/health-for-california-review-engine.html` | anonymous route to branded route |
| DriveSavers | `/case-studies/website-search-operations-workflow.html` | `/case-studies/drivesavers-seo-overhaul.html` | anonymous route to branded route |
| Nuvolum | `/case-studies/branded-site-deployment-platform.html` | `/case-studies/nuvolum-deployment-platform.html` | anonymous route to branded route |
| UX Owl | `/case-studies/professional-services-lead-attribution.html` | `/case-studies/ux-owl-sonoma-attorneys.html` | anonymous route to branded route |
| Dent Experts / Storm Ops Flow | `/case-studies/field-inspection-operations-platform.html` | `/case-studies/dent-experts-storm-ops-flow.html` | anonymous route to branded route |

Redirect requirements:

- direct permanent redirect with no intermediate hop;
- preserve query strings;
- branded page owns its canonical and Open Graph URL;
- branded pages replace temporary routes in the sitemap and internal links;
- remove the old branded-to-anonymous rules before enabling the reverse rules; and
- verify all ten source/destination URLs after the production release.

## Brand 1: Health for California

### Working position

- Relationship: client and original 57Seconds deployment; confirm the preferred relationship wording.
- Case-study role: flagship review-workflow and product-origin story.
- Working headline: **How Health for California turned review follow-up into an agent-level reputation system.**
- Strong metric headline, only after verification: **From 10 reviews to 9,000+ across the agent network.**

### Recorded implementation scope to confirm

- agent-specific landing pages;
- post-interaction or rules-based SMS requests;
- management reporting and per-agent visibility; and
- Google Sheets reporting.

### Historical claim inventory

- approximately 10 reviews at the starting point;
- more than 9,000 reviews across the network;
- `900x` growth;
- four-year comparison period;
- zero manual follow-up;
- system still live;
- reputation or competitive effect; and
- monthly payback language.

Do not restore all of these. The preferred public proof is the starting count, ending count, and comparison window. Operational and commercial effects should be supporting context only when separately sourced.

### Existing asset inventory

- `images/hfc_logo_v2.png` exists in the older local checkout but is not in current production.
- `images/app_3_Phones_v2.png` exists in the older checkout. It includes Health for California, Covered California, other brands, ratings, and identifiable people. Do not restore the composite as-is unless every included mark, likeness, and interface is covered by the retained permission and provenance record.
- Preferred replacement: an approved HFC logo plus one authentic, redacted agent page and one reporting capture.

### Private source package

- [ ] Link the existing permission record for name, case study, and logo.
- [ ] Retain the baseline review export or dated capture.
- [ ] Retain the ending review export or dated capture.
- [ ] Define which profiles are included in the network total.
- [ ] Confirm the comparison dates and calculate the multiplier.
- [ ] Retain an approved scope, acceptance record, or production capture.
- [ ] Confirm current production status separately from historical delivery.
- [ ] Retain the original testimonial and approved attribution if a quote will be used.
- [ ] Obtain approval for the exact final page preview.

## Brand 2: Dent Experts / Storm Ops Flow

### Working position

- Relationship: client; confirm whether Storm Ops Flow is the client product name, a separate company, or both.
- Case-study role: flagship custom iPhone and field-operations story.
- Working headline: **An iPhone field app built around the operator, not the carrier.**
- Preferred homepage proof: custom field-to-office system, supported by approved product visuals and client feedback rather than an unsourced multiplier.

### Recorded implementation scope to confirm

- iPhone field-inspection application;
- job, vehicle, photo, and inspection capture;
- shared field-to-office operations record;
- management dashboard; and
- external insurance-platform connections.

### Historical claim inventory

- national operational scale;
- zero manual re-entry;
- major insurance-platform integrations;
- improved operations and efficiency; and
- a client assessment that the system rivals major insurance platforms.

The platform comparison should be presented only as an attributed client opinion. Integration names and production coverage require confirmation.

### Existing asset inventory

- `images/storm_ops_flow_logo.png` exists in the older local checkout but is not in current production.
- `images/dent_experts_iphone.png` exists in the older checkout. The image appears to be a polished product rendering with sample jobs and names. Confirm whether it is authentic production UI, a concept rendering, or a marketing composite before use.
- Preferred proof: approved Storm Ops Flow branding plus authentic redacted screens. If the rendering is used, label it `Product concept UI`.

### Private source package

- [ ] Link the existing permission record for Dent Experts and Storm Ops Flow naming.
- [ ] Confirm logo ownership and approved placement.
- [ ] Confirm the product/company relationship wording.
- [ ] Retain an approved scope, acceptance record, or product release record.
- [ ] Confirm which integrations were delivered and their production status.
- [ ] Retain a defined before-and-after workflow if reduced entry or time savings will be claimed.
- [ ] Classify each proposed visual as production, redacted production, concept, or marketing composite.
- [ ] Retain the original client feedback and approved attribution.
- [ ] Obtain approval for the exact final page preview.

## Brand 3: DriveSavers

### Working position

- Relationship: client; confirm Gera's exact role and whether work was delivered directly, as an employee, or through another organization.
- Case-study role: recognizable-brand story connecting website, search, review generation, and marketing operations.
- Working headline: **One connected digital operating program for a data-recovery leader.**
- Preferred homepage proof: select either review growth or traffic/conversion performance as the lead result after the source review.

### Recorded implementation scope to confirm

- website overhaul and speed work;
- technical SEO and content strategy;
- marketing workflow modernization;
- review-request system; and
- reporting or attribution work.

### Historical claim inventory

- all-time-high traffic and conversions;
- top-three rankings for more than 20 keywords;
- 27% productivity increase;
- 20% lead increase;
- 15% sales-revenue lift; and
- more than 300 new Google reviews in one quarter.

The old page attempted to prove too many outcomes at once. Choose one lead result and no more than two supporting results after reviewing the underlying exports and attribution.

### Existing asset inventory

- `images/DriveSavers_logo.png` exists in the older local checkout but is not in current production.
- The older page contains no retained analytics or workflow captures.
- Preferred proof: current approved logo, one site before/after comparison, one search or analytics trend, and one review-workflow capture.

### Private source package

- [ ] Link the existing permission record for the DriveSavers case study and logo.
- [ ] Confirm the relationship and attribution language.
- [ ] Retain Analytics and Search Console exports for the chosen comparison window.
- [ ] Retain the keyword set and dated rank snapshots if ranking claims are used.
- [ ] Retain review exports and define the one-quarter period if the review count is used.
- [ ] Retain the productivity calculation and workflow baseline if the 27% figure is used.
- [ ] Retain sales or lead records and attribution method if commercial outcomes are used.
- [ ] Retain the original testimonial and approved attribution.
- [ ] Obtain approval for the exact final page preview.

## Brand 4: Nuvolum

### Working position

- Relationship: client or employer engagement; confirm the exact relationship and Gera's role.
- Case-study role: internal-platform leverage and repeatable deployment story.
- Working headline: **From weeks of deployment work to a repeatable branded-site platform.**
- Preferred homepage proof, only after verification: **200+ sites with deployment reduced to under four hours.**

### Recorded implementation scope to confirm

- modular website architecture;
- custom-video integration workflow;
- automated configuration;
- repeatable quality assurance; and
- deployment and CMS setup tooling.

### Historical claim inventory

- more than 200 site launches;
- under-four-hour deployment time;
- company growth from 7 to 50 people;
- doubled client roster in the first year;
- system still running; and
- first-month payback.

The `7 to 50` company growth may be useful context but must not be presented as solely caused by the platform. The strongest product proof is deployment volume and a clearly defined deployment-time reduction.

### Existing asset inventory

- No Nuvolum logo is retained in the current production source or the inspected older image set.
- Older copy used an `NV` text avatar rather than an official mark.
- Preferred proof: official brand-kit logo, platform or configuration captures, and three representative public sites launched through the system.

### Private source package

- [ ] Link the existing permission record for the Nuvolum case study and logo.
- [ ] Confirm the relationship and Gera's role.
- [ ] Obtain an official logo asset.
- [ ] Retain a deployment list or log supporting the site count.
- [ ] Define what the under-four-hour measurement includes and excludes.
- [ ] Retain a before-and-after deployment workflow.
- [ ] Confirm whether the platform remains in use.
- [ ] Treat staffing and client-roster growth as contextual company history unless attribution is supported.
- [ ] Retain the original testimonial and approved attribution.
- [ ] Obtain approval for the exact final page preview.

## Brand 5: UX Owl

### Working position

- Relationship: co-founded venture, not an ordinary client endorsement.
- Case-study role: local lead-generation, measurement, and productized-service story.
- Working headline: **A lead-attribution system for Sonoma County attorneys.**
- Preferred homepage proof: measurable visibility from campaign source to captured call or form. Use the `30-50%` lift only after the cohort and definition are reconstructed.

### Recorded implementation scope to confirm

- practice-specific websites and landing pages;
- LinkedIn or referral campaigns;
- analytics and call attribution; and
- custom reporting dashboards.

### Historical claim inventory

- 30-50% increase in qualified leads;
- zero untracked spend;
- directory savings;
- weekly insights; and
- four-month payback.

Aggregate claims must identify the number of firms, included periods, definition of a qualified lead, and whether the figure is an average, range, or selected example.

### Existing asset inventory

- No official UX Owl logo is retained in the current production source or the inspected older image set.
- The older case study used a text avatar and a recommendation attributed to Tom Hakel.
- Preferred proof: official UX Owl mark, one attribution dashboard, a campaign-to-call workflow, and representative attorney sites where the firms have separately approved inclusion.

### Private source package

- [ ] Link the existing permission record for the UX Owl brand and case study.
- [ ] Confirm co-founder wording and the venture dates.
- [ ] Obtain an official logo asset.
- [ ] Define a qualified lead.
- [ ] Identify the firms and periods included in any aggregate.
- [ ] Retain analytics, call-tracking, campaign, and intake exports.
- [ ] Separate UX Owl venture results from results belonging to individual law firms.
- [ ] Confirm permission for any named attorney or firm included in the page.
- [ ] Retain the original recommendation and relationship-at-the-time attribution if used.
- [ ] Obtain approval for the exact final page preview.

## Homepage restoration control

### Brand strip

Planned label: **Selected client and venture work**

| Brand | Homepage relationship label | Logo status |
| --- | --- | --- |
| Health for California | Client / 57Seconds deployment | older raster asset recoverable; official current asset preferred |
| DriveSavers | Client | older raster asset recoverable; official current asset preferred |
| Nuvolum | Engagement relationship to confirm | official asset needed |
| Dent Experts / Storm Ops Flow | Client / product relationship to confirm | Storm Ops Flow asset recoverable; Dent Experts asset needed if both marks are shown |
| UX Owl | Co-founded venture | official asset needed |

### Case-study hierarchy

1. Health for California: featured 57Seconds case.
2. Dent Experts / Storm Ops Flow: featured custom-app case.
3. DriveSavers: connected digital-operations case.
4. Nuvolum: deployment-platform case.
5. UX Owl: local lead-attribution case.

### Testimonial shortlist

The older site included testimonial copy for Health for California, DriveSavers, Nuvolum, Dent Experts, and several named individuals. The owner's July 23 permission attestation authorizes the three selected client perspectives on this branch; retain the original source records before public release.

Preferred homepage shortlist:

1. Health for California;
2. Dent Experts; and
3. DriveSavers or Nuvolum, based on the strongest retained original.

For each visible testimonial:

- retain the original source;
- confirm exact wording;
- confirm the display name and relationship at the time;
- retain publication permission;
- independently verify any number repeated in the quote; and
- do not add a star rating unless the source itself contains that rating.

## Asset handling rules

- Obtain current SVG or transparent PNG logos from the client or approved brand kit when possible.
- Do not treat possession of an old logo as evidence of approval for every placement.
- Record whether each product visual is authentic production, redacted production, concept UI, or marketing composite.
- Remove or redact personal information, customer data, vehicle identifiers, claim details, analytics identifiers, and credentials.
- Do not reuse the old three-phone composite without granular approval for all brands, people, ratings, and interfaces it contains.
- Optimize approved images and declare dimensions before release.

## Build order and gates

| Order | Deliverable | Gate before moving on |
| --- | --- | --- |
| 1 | Health for California page | owner accepts narrative and selected proof |
| 2 | Dent Experts / Storm Ops Flow page | visual classification and product relationship confirmed |
| 3 | DriveSavers page | one lead outcome and no more than two supporting outcomes selected |
| 4 | Nuvolum page | relationship, deployment count, and timing definition confirmed |
| 5 | UX Owl page | co-founder wording and qualified-lead method confirmed |
| 6 | Homepage restoration | all five destination pages pass preview review |
| 7 | URL, sitemap, metadata, and redirect package | no loop, chain, alias, or canonical conflict |
| 8 | Coordinated release | explicit production approval and passing QA |
| 9 | Search Console follow-up | live production verified and exact account actions approved |

## Step 1 completion record

- [x] Clean branch created from current production `origin/main`.
- [x] Five anonymous-to-branded mappings recorded.
- [x] Owner direction and permission attestation recorded for drafting.
- [x] Historical claims separated from publishable proof.
- [x] Existing and missing visual assets inventoried.
- [x] Private source-package checklist created for every brand.
- [x] Homepage hierarchy and testimonial shortlist recorded.
- [x] Release, redirect, and Search Console boundaries preserved.

## Branch parity completion record

- [x] Restored five named case-study routes, canonical URLs, Open Graph metadata, and structured-data URLs.
- [x] Rewrote every case study around the named organization, defined relationship, implementation narrative, selected result, and relevant visual treatment.
- [x] Replaced the anonymous homepage work-sample carousel with a five-brand client-work section and three approved client perspectives.
- [x] Added recovered HFC, DriveSavers, and Storm Ops Flow assets; used clear text wordmarks where an official Nuvolum or UX Owl asset is not retained.
- [x] Labeled the Dent Experts interface as product concept UI.
- [x] Added a generated case-study Open Graph image and connected it to the homepage and case-study metadata.
- [x] Updated the sitemap, internal links, QA configuration, mobile smoke target, SEO audit priority routes, outreach link library, and release/indexation handoff.
- [x] Prepared the direct anonymous-to-branded redirect mapping for the Cloudflare release step.
- [x] Passed local QA, SEO audit, JavaScript syntax, automated tests, mobile smoke, and funnel smoke on this branch.

Still outside this branch: retain the exact private source records listed above, obtain explicit production-release approval, replace the live Cloudflare rules, deploy, verify the live redirects and canonicals, and perform the approved Search Console follow-up.
