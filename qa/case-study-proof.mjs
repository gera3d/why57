#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const qaDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(qaDir, '..');
const origin = 'https://why57.com';
const errors = [];

const caseStudies = [
  {
    file: 'case-studies/review-request-workflow.html',
    h1: '9,000+ verified Google reviews. Generated over 4 years.',
    schemaHeadline: '9,000+ Verified Google Reviews Over 4 Years',
    allowedNumbers: ['9,000+', '4'],
    numericHeadingRequired: true
  },
  {
    file: 'case-studies/website-search-operations-workflow.html',
    h1: '300+ new five-star reviews in one quarter. Top-3 rankings on 20+ keywords.',
    schemaHeadline: '300+ New Five-Star Reviews and Top-3 Rankings',
    allowedNumbers: ['300+', '3', '20+'],
    numericHeadingRequired: true
  },
  {
    file: 'case-studies/branded-site-deployment-platform.html',
    h1: '200+ sites deployed in under 4 hours. Agency growth from 7 to 50 employees.',
    schemaHeadline: '200+ Sites in Under 4 Hours and Growth from 7 to 50 Employees',
    allowedNumbers: ['200+', '4', '7', '50'],
    numericHeadingRequired: true
  },
  {
    file: 'case-studies/professional-services-lead-attribution.html',
    h1: '30–50% more qualified leads. For attorney client sites.',
    schemaHeadline: '30–50% More Qualified Leads for Attorney Client Sites',
    allowedNumbers: ['30–50%'],
    numericHeadingRequired: true
  },
  {
    file: 'case-studies/field-inspection-operations-platform.html',
    h1: 'A custom iPhone operations platform. Field and back-office work in one system.',
    schemaHeadline: 'Custom iPhone Operations Platform for Field and Back-Office Work',
    allowedNumbers: [],
    numericHeadingRequired: false
  }
];

function fail(file, message) {
  errors.push(`${file}: ${message}`);
}

function decodeHtml(value = '') {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&ndash;', '–')
    .replaceAll('&mdash;', '—')
    .replaceAll('&middot;', '·')
    .replaceAll('&larr;', '←')
    .replaceAll('&rarr;', '→')
    .replaceAll('&copy;', '©');
}

function textContent(value = '') {
  return decodeHtml(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function visibleBody(html) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
  return textContent(body
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' '));
}

function graphNodes(value) {
  if (Array.isArray(value?.['@graph'])) return value['@graph'];
  return value && typeof value === 'object' ? [value] : [];
}

function schemaTypes(value, found = []) {
  if (Array.isArray(value)) {
    for (const item of value) schemaTypes(item, found);
    return found;
  }
  if (!value || typeof value !== 'object') return found;
  if (value['@type']) found.push(...(Array.isArray(value['@type']) ? value['@type'] : [value['@type']]));
  for (const child of Object.values(value)) schemaTypes(child, found);
  return found;
}

const sitemap = await readFile(path.join(rootDir, 'sitemap.xml'), 'utf8');
const homepage = await readFile(path.join(rootDir, 'index.html'), 'utf8');
if (!/\bid=["']start-here["']/i.test(homepage) || !/\bdata-lead-form\b/i.test(homepage)) {
  fail('index.html', 'guarded Thread 1 qualification target is missing #start-here or data-lead-form');
}

for (const study of caseStudies) {
  const html = await readFile(path.join(rootDir, study.file), 'utf8');
  const url = `${origin}/${study.file}`;

  if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
    fail(study.file, 'page is noindex');
  }

  const canonicals = [...html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => decodeHtml(match[1]));
  if (canonicals.length !== 1 || canonicals[0] !== url) {
    fail(study.file, `expected one self-referencing canonical ${url}`);
  }

  const sitemapBlock = sitemap.match(new RegExp(`<url>[\\s\\S]*?<loc>${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>[\\s\\S]*?</url>`))?.[0];
  if (!sitemapBlock) fail(study.file, 'canonical URL is missing from sitemap.xml');
  else if (!/<lastmod>2026-07-16<\/lastmod>/.test(sitemapBlock)) fail(study.file, 'sitemap lastmod is not 2026-07-16');

  const h1Blocks = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1Blocks.length !== 1) {
    fail(study.file, `expected one H1; found ${h1Blocks.length}`);
  } else {
    const h1 = textContent(h1Blocks[0][1]);
    if (h1 !== study.h1) fail(study.file, `unexpected H1: ${h1}`);
    if (study.numericHeadingRequired && !/\d/.test(h1)) fail(study.file, 'approved numeric proof is missing from H1');
    if (!study.numericHeadingRequired && /\d/.test(h1)) fail(study.file, 'H1 invents a numeric proof point');
  }

  const scripts = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (scripts.length !== 1) fail(study.file, `expected one JSON-LD block; found ${scripts.length}`);
  for (const [, source] of scripts) {
    let schema;
    try {
      schema = JSON.parse(source);
    } catch (error) {
      fail(study.file, `invalid JSON-LD: ${error.message}`);
      continue;
    }
    if (schema['@context'] !== 'https://schema.org') fail(study.file, 'JSON-LD context must be https://schema.org');
    const articles = graphNodes(schema).filter((node) => node['@type'] === 'Article');
    if (articles.length !== 1) fail(study.file, `expected one Article node; found ${articles.length}`);
    const article = articles[0];
    if (article?.headline !== study.schemaHeadline) fail(study.file, 'Article headline does not match the approved page headline');
    if (article?.url !== url) fail(study.file, 'Article URL does not match the canonical');
    if (!article?.description || !article?.author || !article?.publisher) fail(study.file, 'Article is missing description, author, or publisher');
    if (schemaTypes(schema).includes('Review')) fail(study.file, 'Review schema is not allowed without a sourced client quote');
  }

  if (/<blockquote\b|itemprop=["']review|data-client-quote/i.test(html)) {
    fail(study.file, 'testimonial markup exists without a sourced client quote');
  }
  if (!/data-quote-status=["']blocked["']/i.test(html)) fail(study.file, 'missing explicit quote blocker');

  const expectedCta = '../#start-here';
  const hrefs = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((match) => decodeHtml(match[1]));
  const guardedCtas = hrefs.filter((href) => href === expectedCta);
  if (guardedCtas.length !== 3) fail(study.file, `expected three guarded Thread 1 CTAs; found ${guardedCtas.length}`);
  if (hrefs.some((href) => href.startsWith('https://calendar.app.google/'))) {
    fail(study.file, 'case-study CTA bypasses guarded Thread 1 qualification');
  }
  if (hrefs.some((href) => /[?&]utm_(?:source|medium|campaign|content|term)=/i.test(href))) {
    fail(study.file, 'same-site navigation contains internal campaign parameters');
  }

  if (study.numericHeadingRequired && !/data-proof-status=["']owner-approved["']/i.test(html)) {
    fail(study.file, 'approved numeric proof status is missing');
  }
  if (!study.numericHeadingRequired && !/data-proof-blocker=["']numeric-proof-point["']/i.test(html)) {
    fail(study.file, 'missing explicit numeric-proof blocker');
  }

  const allowedNumbers = new Set(['57', '2026', ...study.allowedNumbers]);
  const numbers = visibleBody(html).match(/(?<![A-Za-z])\d[\d,]*(?:[–-]\d[\d,]*)?(?:\+|%)?/g) || [];
  for (const number of new Set(numbers)) {
    if (!allowedNumbers.has(number)) fail(study.file, `visible number is outside the approved proof scope: ${number}`);
  }
}

if (errors.length) {
  console.error(`Case-study proof QA failed with ${errors.length} issue${errors.length === 1 ? '' : 's'}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Case-study proof QA passed');
console.log('- five dedicated canonical URLs are indexable and current in the sitemap');
console.log('- four numeric headings use only owner-approved proof points');
console.log('- field-operations numeric proof and all five client quotes remain explicitly blocked');
console.log('- Article JSON-LD is valid and no unsourced Review schema or testimonial markup is present');
console.log('- every case-study CTA routes to the guarded Thread 1 qualification path');
