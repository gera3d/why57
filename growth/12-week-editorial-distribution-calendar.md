# 12-week editorial and distribution calendar

This is an evergreen sequence: assign a start date only when owners and publishing capacity are confirmed. The first month prioritizes earning clicks from existing search visibility, because the supplied baseline shows 7,965 impressions but only 9 clicks and 0.1% CTR. The exact Search Console period must be confirmed before setting numeric targets.

## Channel roles

- **Website:** durable source asset and search destination.
- **Founder LinkedIn:** point of view, discussion, and first-party distribution.
- **Partner email or newsletter:** only with permission; adapt to the audience and avoid implied endorsement.
- **Google Business Profile:** concise local proof or educational excerpt, where appropriate.
- **Direct follow-up:** only to a relevant existing relationship and only after review.

Every published URL should use a single primary CTA and source-specific UTMs. Do not publish a client claim or quote without current approval.

## Calendar

| Week | Funnel job | Core asset / angle | Primary CTA | Distribution and reuse | Measurement |
| --- | --- | --- | --- | --- | --- |
| 1 | Capture high-intent prototype demand | **AI prototype to production:** use the canonical [AI prototype-to-production page](https://why57.com/ai-app-prototype-to-production.html) to explain the ownership, security, reliability, support, and keep/repair/rebuild gap without dismissing prototype value. | Send Your Prototype for the 5-Point Review | Founder LinkedIn text post; concise Google Business Profile post; one narrow referral ask to a current collaborator. | UTM-attributed landing sessions, `prototype_review_submitted`, and secondary `calendar_booking_clicked` micro-conversions. |
| 2 | Create a diagnostic entry point | **The 12-part readiness and security checklist:** use the canonical [readiness checklist](https://why57.com/ai-prototype-readiness-security-checklist.html), supported by the canonical [repair-vs.-rebuild guide](https://why57.com/ai-prototype-repair-rebuild-cost.html). | Start the Readiness Checklist | Founder LinkedIn checklist post; repair-vs.-rebuild follow-up; one-to-one SBDC/economic-development resource shares after message approval. | UTM-attributed resource sessions, engaged visits, `calendar_booking_clicked` micro-conversions, replies/intros, and assisted prototype-review submissions. |
| 3 | Build decision confidence | **Keep, harden, or replace:** a decision framework for AI-generated code. Show conditions and evidence, not blanket rules. | Use the repair-vs.-rebuild decision framework | Website article; founder diagram/text post; partner-ready excerpt. | Engaged sessions, framework CTA rate, qualified conversations. |
| 4 | Turn evidence into relevance | **How a repeatable deployment platform can change operations.** Use the anonymized portfolio record only as a design pattern; do not imply client approval or measured impact. | Read the deployment-platform record | Website case-study excerpt; LinkedIn problem/intervention/result/evidence-limit thread; direct link only after owner review. | Case-study visits, internal click-through, assisted CTA clicks. |
| 5 | Attract operations pain | **Five signs a spreadsheet has become business-critical software.** Include permissions, versioning, error recovery, and ownership. | Estimate the workflow’s cost | Website article; LinkedIn diagnostic post; MSP referral snippet. | Organic entrances, ROI calculator clicks, referral-source sessions. |
| 6 | Demonstrate workflow depth | **Designing field operations around a shared record.** Use only the anonymized portfolio description to explain mobile, inspection, and dispatch considerations. | Read the field-operations record | Website excerpt; LinkedIn operational teardown; MSP/agency one-to-one share after review. | Case-study visits, scroll/engagement, fit conversations. |
| 7 | Qualify build vs. buy | **SaaS, integration, hybrid, or custom:** a decision table based on differentiation, workflow fit, data, and change rate. | Run the ROI calculator | Website decision guide; LinkedIn poll followed by analysis; chamber education pitch. | ROI clicks/completions, recommendation mix, booked calls. |
| 8 | Show how to measure growth systems | **Automation is not the outcome:** map trigger → action → customer response → business measure. Keep the example anonymous and separate proposed measurement from verified results. | Read the review-workflow record | Website article/excerpt; LinkedIn systems map; relevant partner resource share after owner review. | Case-study CTR, CTA clicks, analytics-event completeness. |
| 9 | Reduce security anxiety | **The minimum security review before real users:** ownership, secrets, roles, server-side validation, data map, recovery. State that it is not certification. | Use the readiness checklist | Website guide; founder LinkedIn checklist; fractional CTO discussion prompt. | Checklist views, saves/shares, prototype-review submissions mentioning risk. |
| 10 | Clarify delivery expectations | **What a responsible first release includes:** explicit exclusions, acceptance evidence, rollback, monitoring, and support. | Discuss a focused first release | Website article; LinkedIn “scope is a safety tool” post; agency capability follow-up. | Qualified CTA rate, proposal-stage fit, reasons for not-fit. |
| 11 | Strengthen local relevance | **A practical automation audit for Sonoma County service businesses.** Use local examples without inventing customer stories. | Identify one bottleneck | Local page section/article; GBP post; chamber-ready educational outline. | Local query impressions/CTR, GBP actions if available, local inquiries. |
| 12 | Synthesize and convert | **Prototype-to-production field guide:** package the strongest lessons, checklist, decision framework, and case-study pathways. | Send Your Prototype for the 5-Point Review | Website hub; LinkedIn recap series; permission-based partner roundup. | Hub entrances, `prototype_review_submitted`, sourced pipeline, content-assisted opportunities. |

## Weekly production rhythm

| Day | Action | Exit criterion |
| --- | --- | --- |
| Monday | Review last week’s scorecard and GSC query/page data. | One audience question, funnel job, and primary CTA selected. |
| Tuesday | Draft the source asset and claim ledger. | Every material claim has an approved source or is removed. |
| Wednesday | Edit for specificity, internal links, title/meta, accessibility, and mobile layout. | Content and QA owner approve the release candidate. |
| Thursday | Publish only through the approved workflow; prepare channel-native derivatives. | Canonical URL works; analytics hooks fire once; UTMs are correct. |
| Friday | Distribute through approved channels and record the exact links. | Scorecard sources and annotations are updated. |

## UTM convention

Use lowercase snake-case values and keep the destination canonical:

```text
?utm_source=[linkedin|google_business_profile|founder_email|approved_partner_name]
&utm_medium=[organic_social|organic_local|email|referral]
&utm_campaign=[why57_ai_prototype_launch_2026q3|why57_12_week_editorial]
&utm_content=w[01-12]_[short_asset_name]
```

Use `why57_ai_prototype_launch_2026q3` for the first two launch weeks. Direct one-to-one outreach uses `utm_source=founder_email`; put a non-personal organization or message code in `utm_content`. Use a partner name as `utm_source` only after that partner approves a separate distribution link. Do not add UTMs to internal website links or put names, email addresses, or other personal data in UTM values.

## Editorial QA gate

- [ ] One audience and one primary decision are named.
- [ ] One primary CTA is used consistently.
- [ ] Claims are sourced; client-specific wording is approved.
- [ ] Title, description, canonical, internal links, images, and headings pass QA.
- [ ] The mobile layout and interactive state are checked.
- [ ] Analytics and UTM values are verified without personal data.
- [ ] The live URL and publish annotation are recorded in the scorecard.
