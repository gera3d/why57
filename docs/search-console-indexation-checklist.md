# Search Console and indexation checklist

This is the post-merge operating checklist for the two public properties. The repository changes can correct canonical signals, crawl paths, sitemap coverage, and robots behavior. HTTP redirects and Search Console actions require Cloudflare/Search Console access and are intentionally not performed by this branch.

## Baseline captured July 15, 2026

Search Console's page-indexing reports were last updated July 9, 2026.

### `https://why57.com/`

- 10 indexed URLs and 21 not-indexed URLs.
- `/sitemap.xml` was successful, last read July 5, and reported 15 discovered pages. The repository sitemap now contains 14 canonical pages after retiring thin local variants and adding the AI-prototype guides.
- The stale `/sitemap_index.xml` submission has shown **Couldn't fetch** since 2022 and should be removed from Search Console.
- The canonical-alternate example is `https://why57.com/index.html`.
- The recorded 404 is `https://why57.com/home/`.
- The historical 5xx example is the legacy query URL `https://why57.com/?events/`.
- Seven query-string variants were blocked by the old blanket robots rule. The examples are referral URLs and old junk-query URLs, not separate content.
- Five valuable pages were **Discovered - currently not indexed**:

  - `https://why57.com/bay-area-business-automation.html`
  - `https://why57.com/silicon-valley-software-consulting.html`
  - `https://why57.com/case-studies/review-request-workflow.html`
  - `https://why57.com/case-studies/branded-site-deployment-platform.html`
  - `https://why57.com/case-studies/professional-services-lead-attribution.html`

- Four **Crawled - currently not indexed** examples were legacy/non-canonical URLs: `/contact/`, `/?ref=awesomeindie.com`, `/?space/`, and `/?earth/`.

### `https://roi.why57.com/`

- `/sitemap.xml` is successful and reports one discovered page.
- One URL is indexed and one old parameterized calculator URL is blocked by that property's robots policy.
- The blocked example starts with `/?utm_source=why57&...` and includes calculator inputs. It should consolidate to the clean root canonical, not become a separate indexed page.

## 1. Merge and deploy prerequisites

- Merge the technical SEO commit together with the analytics work that removes internal campaign UTMs.
- Run `node scripts/seo-audit.mjs` from the merged site root. The deployment workflow also runs this check automatically.
- Deploy through the normal GitHub Pages workflow. Do not request indexing before the new sitemap, internal links, and robots file are live.
- Create direct permanent edge redirects from the five retired pre-cleanup case-study paths to their anonymized replacement paths in the same release. Recover the exact source-to-destination mapping from the trust-cleanup commit's rename/deletion metadata; do not restore client-bearing filenames as public HTML pages.
- Confirm `https://why57.com/robots.txt` no longer contains `Disallow: /*?*` and still excludes `/dashboard.html`.
- Confirm every sitemap URL returns 200, has one matching canonical, and is reachable from the homepage.

## 2. Cloudflare redirect rules

The live site is GitHub Pages behind Cloudflare. GitHub Pages does not provide repository-defined HTTP redirects, so create these as Cloudflare Redirect Rules after the merge:

| Incoming URL | Required response | Destination |
| --- | --- | --- |
| `http://why57.com/*` | 301 | Same path and query on `https://why57.com/` |
| `https://why57.com/index.html` | 301 | `https://why57.com/` |
| `https://why57.com/home` and `/home/` | 301 | `https://why57.com/` |
| `https://why57.com/contact` and `/contact/` | 301 | `https://why57.com/` |
| `https://www.why57.com/*` | Keep existing 301 | Same path on `https://why57.com/` |

Rules should preserve paths for the HTTP and `www` host redirects, avoid redirect chains, and run before cache rules. The exact legacy paths above should redirect directly to `/`. Do not redirect every 404 to the homepage; unknown paths must keep a real 404 response to avoid soft-404 indexing.

The five retired pre-cleanup case-study paths are a separate migration: each must redirect directly to its corresponding anonymized case study, not to the homepage. Confirm those mappings from the accepted trust-cleanup commit before creating the rules, then test all five paths after deployment.

Expected verification after the rules are active:

```sh
curl -I http://why57.com/
curl -I https://why57.com/index.html
curl -I https://why57.com/home/
curl -I https://why57.com/contact/
curl -I https://why57.com/not-a-real-page
```

The first four requests should return a single 301 hop to `https://why57.com/`. The unknown URL should return 404. A normal query variant such as `https://why57.com/?ref=producthunt` may remain 200 because the rendered page self-canonicalizes to the clean homepage URL.

## 3. `why57.com` Search Console actions

1. Open the `https://why57.com/` URL-prefix property.
2. Remove the failed `/sitemap_index.xml` submission. It is a stale 2022 artifact and is not referenced by the site.
3. Resubmit `/sitemap.xml`. Confirm **Success** and 14 discovered pages after Google rereads it.
4. Inspect and request indexing for the highest-value new page first:

   - `https://why57.com/ai-app-prototype-to-production.html`

5. Inspect the five previously discovered commercial pages listed in the baseline. Use **Test live URL**, confirm the declared and selected canonical match, then request indexing.
6. Inspect `/index.html`, `/home/`, and `/contact/` after the Cloudflare rules are live. Each should report a direct permanent redirect to `/`.
7. Start validation for the old robots, 404, and 5xx issue groups only after the live tests match the intended behavior.
8. Review **Crawled - currently not indexed** after the next crawl. Parameter variants should consolidate to the clean canonical; do not request indexing for them.
9. Recheck page indexing after 7 days and 28 days. Record whether each of the six priority commercial URLs is indexed, still discovered, crawled-not-indexed, or assigned a different Google canonical.

## 4. `roi.why57.com` property coverage

1. Keep the existing `https://roi.why57.com/` URL-prefix property for focused reports and URL inspection.
2. Add and verify a `why57.com` **Domain property** if it does not already exist. DNS verification covers HTTPS/HTTP plus the apex and all subdomains, including ROI, in one property.
3. In the ROI repository/deployment, confirm:

   - the root page self-canonicalizes to `https://roi.why57.com/`;
   - calculator query URLs are not blocked from reading that canonical;
   - `/sitemap.xml` contains only the clean root URL;
   - internal links from `why57.com` do not overwrite acquisition with campaign UTMs.

4. Resubmit the ROI sitemap after those changes are live.
5. Inspect the previously blocked `/?utm_source=why57&...` example. Confirm Google's selected canonical is the clean ROI root, then validate the robots issue.
6. Check the Domain property and both URL-prefix properties monthly so subdomain coverage does not hide property-specific indexing errors.

## 5. Ongoing guardrails

- Keep only canonical, indexable, 200-status pages in sitemaps.
- Update `<lastmod>` only when page content, structured data, canonical handling, or meaningful internal links change.
- Give every new commercial page at least one descriptive homepage or service-page link before requesting indexing.
- Keep intentional utility pages such as `dashboard.html` out of the sitemap and protected with `noindex` in addition to their deliberate crawl policy.
- Re-run the local SEO audit after adding, renaming, or deleting an HTML page.
- Treat **Alternate page with proper canonical tag** as expected only for unavoidable variants. Prefer a 301 when the edge can normalize a stable legacy path such as `/index.html` or `/home/`.
