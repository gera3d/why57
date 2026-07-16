# Why57 site QA

The QA harness is read-only: it checks the static source and opens a local server for browser smoke tests. It does not deploy, submit forms, contact third parties, or modify remote services.

## Quick run

From the repository root:

```bash
npm run qa
npm run qa:mobile
```

`npm run qa` uses Node.js standard-library code only. It does not install dependencies or access the network. It checks:

- local links, fragments, scripts, stylesheets, and images;
- configured critical booking, ROI, AI-prototype, and case-study destinations;
- exactly one matching canonical, title, and meta description on every indexed page;
- viewport metadata and stable analytics hooks on critical calls to action;
- the GA4 loader, property configuration, and `dataLayer` bootstrap;
- accessible names for controls and buttons;
- form field names/labels, submit controls, and accessible thank-you states when forms exist;
- sitemap coverage for every indexed HTML canonical, with no non-indexed extras.
- JavaScript syntax across site, Worker, and QA scripts.

Warnings flag title/description lengths for human review but do not fail the run.

## Mobile smoke test

`npm run qa:mobile` starts a local, read-only static server and uses Playwright CLI at a 390 × 844 viewport. When the Git-ignored `site-config.js` is absent, the server returns `site-config.example.js` at that route so local JavaScript execution matches the production file shape without exposing credentials. It checks four representative page types for HTTP success, one H1, visible/named primary CTA, mobile navigation readiness, uncaught page errors, and horizontal overflow.

Prerequisites:

```bash
node --version
npm --version
npx --yes --package @playwright/cli playwright-cli install-browser chromium
```

If Codex's Playwright wrapper is available, point the script at it to avoid a package lookup:

```bash
PWCLI=/absolute/path/to/playwright_cli.sh npm run qa:mobile
```

The local server log is written to `output/playwright/http-server.log` and ignored by Git. Override the default port when necessary:

```bash
PORT=41758 npm run qa:mobile
```

## Optional live critical-link check

The default suite validates local references and configured destinations without relying on third-party uptime. To make a live HTTP request to the booking calendar and ROI calculator:

```bash
npm run qa:external
```

An HTTP 404 or server error fails the check. Authentication/anti-bot responses are reported as reachable because they do not prove a broken destination.

## Configuration

Edit `qa/site-qa.config.json` when the canonical origin, GA4 property, critical destinations, runtime-generated assets, or intentionally ignored HTML pages change. Runtime-generated files must name a committed example/template so a missing real configuration cannot be mistaken for a broken source asset. Add a lead form normally; the existing checks will then require:

- a `name` and accessible label for each user-editable control;
- an explicit submit control; and
- `data-success-target`, `data-thank-you`, a success/thank-you action URL, or an accessible inline confirmation region whose id/class contains `thank`, `success`, or `confirmation`.

Run the static suite before every content or site merge and the mobile smoke suite whenever layout or interaction code changes.
