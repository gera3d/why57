#!/usr/bin/env node

import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const qaDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(qaDir, '..');
const config = JSON.parse(await readFile(path.join(qaDir, 'site-qa.config.json'), 'utf8'));
const runExternalChecks = process.argv.includes('--external');
const errors = [];
const warnings = [];
const notes = [];
const notedGeneratedAssets = new Set();

function fail(check, file, message) {
  errors.push({ check, file, message });
}

function warn(check, file, message) {
  warnings.push({ check, file, message });
}

function decodeHtml(value = '') {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function stripTags(value = '') {
  return decodeHtml(value.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
}

function parseAttributes(source = '') {
  const attrs = {};
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of source.matchAll(pattern)) {
    attrs[match[1].toLowerCase()] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attrs;
}

function elements(html, tag) {
  const pattern = new RegExp(`<${tag}\\b([^>]*)>`, 'gi');
  return [...html.matchAll(pattern)].map((match) => ({
    attrs: parseAttributes(match[1]),
    index: match.index,
    raw: match[0]
  }));
}

function blocks(html, tag) {
  const pattern = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  return [...html.matchAll(pattern)].map((match) => ({
    attrs: parseAttributes(match[1]),
    body: match[2],
    index: match.index,
    raw: match[0]
  }));
}

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'output') continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function relativeFile(filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join('/');
}

function expectedCanonical(relativePath) {
  return relativePath === 'index.html'
    ? `${config.siteOrigin}/`
    : `${config.siteOrigin}/${relativePath}`;
}

function urlToLocalPath(url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  if (pathname.endsWith('/')) pathname += 'index.html';
  return path.join(rootDir, pathname.replace(/^\//, ''));
}

async function exists(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

function hasAccessibleName(html, control) {
  const { attrs, index } = control;
  if (attrs['aria-label']?.trim() || attrs['aria-labelledby']?.trim()) return true;
  if (attrs.id) {
    const escapedId = attrs.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`<label\\b[^>]*\\bfor=["']${escapedId}["']`, 'i').test(html)) return true;
  }
  const before = html.slice(0, index);
  return before.lastIndexOf('<label') > before.lastIndexOf('</label>');
}

function isIgnored(relativePath) {
  return config.ignoredHtml.includes(relativePath);
}

const allFiles = await walk(rootDir);
const htmlPaths = allFiles.filter((file) => file.endsWith('.html'));
const pages = new Map();

for (const htmlPath of htmlPaths) {
  const relativePath = relativeFile(htmlPath);
  pages.set(relativePath, await readFile(htmlPath, 'utf8'));
}

const indexedPages = [];
const canonicalOwners = new Map();
let formCount = 0;

for (const [relativePath, html] of pages) {
  if (isIgnored(relativePath)) continue;

  const robots = elements(html, 'meta').find((item) => item.attrs.name?.toLowerCase() === 'robots');
  const noindex = robots?.attrs.content?.toLowerCase().includes('noindex');
  if (noindex) {
    warn('indexing', relativePath, 'Public-page inventory ignores this noindex page; add it to ignoredHtml if intentional.');
    continue;
  }
  indexedPages.push(relativePath);

  const titleMatches = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  if (titleMatches.length !== 1 || !stripTags(titleMatches[0]?.[1])) {
    fail('metadata', relativePath, `Expected one non-empty <title>; found ${titleMatches.length}.`);
  } else {
    const title = stripTags(titleMatches[0][1]);
    if (title.length > 65) warn('metadata', relativePath, `Title is ${title.length} characters; review likely truncation.`);
  }

  const descriptions = elements(html, 'meta').filter((item) => item.attrs.name?.toLowerCase() === 'description');
  if (descriptions.length !== 1 || !descriptions[0]?.attrs.content?.trim()) {
    fail('metadata', relativePath, `Expected one non-empty meta description; found ${descriptions.length}.`);
  } else {
    const length = descriptions[0].attrs.content.trim().length;
    if (length < 70 || length > 170) warn('metadata', relativePath, `Meta description is ${length} characters; review search-snippet fit.`);
  }

  const viewport = elements(html, 'meta').find((item) => item.attrs.name?.toLowerCase() === 'viewport');
  if (!viewport?.attrs.content?.includes('width=device-width')) {
    fail('mobile', relativePath, 'Missing a width=device-width viewport meta tag.');
  }

  const canonicals = elements(html, 'link').filter((item) => item.attrs.rel?.toLowerCase().split(/\s+/).includes('canonical'));
  const expected = expectedCanonical(relativePath);
  if (canonicals.length !== 1) {
    fail('canonical', relativePath, `Expected one canonical; found ${canonicals.length}.`);
  } else if (canonicals[0].attrs.href !== expected) {
    fail('canonical', relativePath, `Expected ${expected}; found ${canonicals[0].attrs.href || '(empty)'}.`);
  } else if (canonicalOwners.has(expected)) {
    fail('canonical', relativePath, `Canonical is already owned by ${canonicalOwners.get(expected)}.`);
  } else {
    canonicalOwners.set(expected, relativePath);
  }

  const analyticsEntrypoints = elements(html, 'script').filter((item) => /^(?:\.\.\/)?analytics\.js$/.test(item.attrs.src || ''));
  if (analyticsEntrypoints.length !== 1) {
    fail('analytics', relativePath, `Expected one shared analytics.js entry point; found ${analyticsEntrypoints.length}.`);
  }

  const ids = elements(html, '[a-z][a-z0-9:-]*')
    .map((item) => item.attrs.id)
    .filter(Boolean);
  const seenIds = new Set();
  for (const id of ids) {
    if (seenIds.has(id)) fail('accessibility', relativePath, `Duplicate id "${id}".`);
    seenIds.add(id);
  }

  const controls = [
    ...elements(html, 'input'),
    ...elements(html, 'select'),
    ...elements(html, 'textarea')
  ].filter((control) => !['hidden', 'button', 'submit', 'reset', 'image'].includes(control.attrs.type?.toLowerCase()));
  for (const control of controls) {
    if (!hasAccessibleName(html, control)) {
      fail('form accessibility', relativePath, `${control.raw} has no associated label or ARIA name.`);
    }
  }

  const forms = blocks(html, 'form');
  formCount += forms.length;
  for (const form of forms) {
    const formControls = [
      ...elements(form.body, 'input'),
      ...elements(form.body, 'select'),
      ...elements(form.body, 'textarea')
    ].filter((control) => !['hidden', 'button', 'submit', 'reset', 'image'].includes(control.attrs.type?.toLowerCase()));

    for (const control of formControls) {
      if (!control.attrs.name?.trim()) {
        fail('form accessibility', relativePath, `Form control ${control.raw} is missing a name attribute.`);
      }
      if (!hasAccessibleName(form.body, control)) {
        fail('form accessibility', relativePath, `Form control ${control.raw} has no associated label or ARIA name.`);
      }
    }

    const hasSubmit = /<(?:button\b[^>]*type=["']?submit|input\b[^>]*type=["']?submit)/i.test(form.body);
    if (!hasSubmit) fail('form accessibility', relativePath, 'Form is missing an explicit submit control.');

    const declaredTarget = form.attrs['data-success-target'] || form.attrs['data-thank-you'];
    const actionNamesSuccess = /thank|success|confirmation/i.test(form.attrs.action || '');
    const inlineStatus = /<(?:section|div|p)\b[^>]*(?:id|class)=["'][^"']*(?:thank|success|confirmation)[^"']*["'][^>]*(?:role=["'](?:status|alert)["']|aria-live=)/i.test(html)
      || /<(?:section|div|p)\b[^>]*(?:role=["'](?:status|alert)["']|aria-live=)[^>]*(?:id|class)=["'][^"']*(?:thank|success|confirmation)[^"']*["']/i.test(html);
    if (!declaredTarget && !actionNamesSuccess && !inlineStatus) {
      fail('thank-you state', relativePath, 'Form has no declared success target, success/thank-you action, or accessible inline confirmation state.');
    }
  }

  const interactiveButtons = blocks(html, 'button');
  for (const button of interactiveButtons) {
    if (!stripTags(button.body) && !button.attrs['aria-label'] && !button.attrs['aria-labelledby']) {
      fail('accessibility', relativePath, 'Button has no visible or ARIA accessible name.');
    }
  }

  for (const anchor of elements(html, 'a')) {
    const href = anchor.attrs.href?.trim();
    if (!href || /^(mailto:|tel:|javascript:|data:)/i.test(href)) continue;

    let target;
    try {
      target = new URL(href, expected);
    } catch {
      fail('links', relativePath, `Invalid href "${href}".`);
      continue;
    }

    if (target.origin !== config.siteOrigin) continue;
    const targetPath = urlToLocalPath(target);
    if (!await exists(targetPath)) {
      fail('links', relativePath, `Local href "${href}" resolves to missing ${relativeFile(targetPath)}.`);
      continue;
    }

    if (target.hash) {
      const targetRelative = relativeFile(targetPath);
      const targetHtml = pages.get(targetRelative) ?? await readFile(targetPath, 'utf8');
      const fragment = decodeURIComponent(target.hash.slice(1));
      const targetIds = new Set([
        ...elements(targetHtml, '[a-z][a-z0-9:-]*').map((item) => item.attrs.id),
        ...elements(targetHtml, 'a').map((item) => item.attrs.name)
      ].filter(Boolean));
      if (!targetIds.has(fragment)) {
        fail('links', relativePath, `Href "${href}" points to missing fragment "${fragment}" in ${targetRelative}.`);
      }
    }
  }

  const localResourceElements = [
    ...elements(html, 'img').map((item) => ({ ...item, value: item.attrs.src })),
    ...elements(html, 'script').map((item) => ({ ...item, value: item.attrs.src })),
    ...elements(html, 'link').map((item) => ({ ...item, value: item.attrs.href }))
  ];
  for (const resource of localResourceElements) {
    if (!resource.value || /^(data:|blob:)/i.test(resource.value)) continue;
    let target;
    try {
      target = new URL(resource.value, expected);
    } catch {
      fail('assets', relativePath, `Invalid resource URL "${resource.value}".`);
      continue;
    }
    if (target.origin === config.siteOrigin && !await exists(urlToLocalPath(target))) {
      const localRelative = relativeFile(urlToLocalPath(target));
      const example = config.runtimeGeneratedAssets?.[localRelative];
      if (example && await exists(path.join(rootDir, example))) {
        if (!notedGeneratedAssets.has(localRelative)) {
          notes.push(`${localRelative} is runtime-generated; verified committed template ${example}.`);
          notedGeneratedAssets.add(localRelative);
        }
      } else {
        fail('assets', relativePath, `Resource "${resource.value}" resolves to a missing local file.`);
      }
    }
  }

  const criticalAnchors = elements(html, 'a').filter((anchor) => {
    const href = anchor.attrs.href || '';
    return config.criticalDestinations.some((item) => item.analyticsHook && href.startsWith(item.hrefPrefix));
  });
  for (const anchor of criticalAnchors) {
    if (!anchor.attrs.id && !Object.keys(anchor.attrs).some((name) => name.startsWith('data-'))) {
      fail('analytics hooks', relativePath, `Critical CTA ${anchor.raw} needs a stable id or data-* hook.`);
    }
  }
}

if (formCount === 0) {
  notes.push('Form and thank-you-state enforcement is armed; no indexed forms currently exist.');
}

const sitemapXml = await readFile(path.join(rootDir, config.sitemapPath), 'utf8');
const sitemapUrls = new Set([...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeHtml(match[1].trim())));
const expectedUrls = new Set(indexedPages.map(expectedCanonical));
for (const url of expectedUrls) {
  if (!sitemapUrls.has(url)) fail('sitemap', config.sitemapPath, `Missing indexed canonical ${url}.`);
}
for (const url of sitemapUrls) {
  if (url.startsWith(config.siteOrigin) && !expectedUrls.has(url)) {
    fail('sitemap', config.sitemapPath, `Contains ${url}, which is not an indexed HTML canonical.`);
  }
}

const allHrefsByFile = new Map([...pages].map(([file, html]) => [
  file,
  elements(html, 'a').map((item) => item.attrs.href || '')
]));

for (const destination of config.criticalDestinations) {
  const references = [...allHrefsByFile.values()].flat().filter((href) => href.startsWith(destination.hrefPrefix));
  if (references.length < destination.minimumReferences) {
    fail('critical links', 'site-qa.config.json', `${destination.name} has ${references.length} references; expected at least ${destination.minimumReferences}.`);
  }
  for (const requiredFile of destination.requiredFrom || []) {
    const present = (allHrefsByFile.get(requiredFile) || []).some((href) => href.startsWith(destination.hrefPrefix));
    if (!present) fail('critical links', requiredFile, `Missing required link to ${destination.name}.`);
  }
}

if (runExternalChecks) {
  const destinations = config.criticalDestinations.filter((item) => item.liveCheck);
  for (const destination of destinations) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      let response = await fetch(destination.hrefPrefix, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal
      });
      if (response.status === 405) {
        response = await fetch(destination.hrefPrefix, { method: 'GET', redirect: 'follow', signal: controller.signal });
      }
      if (response.status >= 500 || response.status === 404) {
        fail('external links', 'site-qa.config.json', `${destination.name} returned HTTP ${response.status}.`);
      } else {
        notes.push(`${destination.name} live check returned HTTP ${response.status}.`);
      }
    } catch (error) {
      fail('external links', 'site-qa.config.json', `${destination.name} could not be checked: ${error.message}`);
    } finally {
      clearTimeout(timeout);
    }
  }
} else {
  notes.push('External live checks skipped; run npm run qa:external to enable them.');
}

console.log(`Why57 site QA: ${indexedPages.length} indexed pages, ${pages.size} total HTML files`);
for (const note of notes) console.log(`INFO  ${note}`);
for (const warning of warnings) console.log(`WARN  [${warning.check}] ${warning.file}: ${warning.message}`);
for (const error of errors) console.error(`FAIL  [${error.check}] ${error.file}: ${error.message}`);

if (errors.length) {
  console.error(`\n${errors.length} failure(s), ${warnings.length} warning(s).`);
  process.exit(1);
}

console.log(`\nPASS  No failures; ${warnings.length} warning(s).`);
