#!/usr/bin/env node

import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const ORIGIN = "https://why57.com";
const GENERATED_ASSETS = new Set(["site-config.js"]);
const errors = [];
let jsonLdCount = 0;
let internalLinkCount = 0;
let localAssetCount = 0;

const priorityHomeRoutes = [
  "/ai-app-prototype-to-production.html",
  "/bay-area-business-automation.html",
  "/silicon-valley-software-consulting.html",
  "/case-studies/health-for-california-review-engine.html",
  "/case-studies/nuvolum-deployment-platform.html",
  "/case-studies/ux-owl-sonoma-attorneys.html",
];

function fail(message) {
  errors.push(message);
}

function toPosix(file) {
  return file.split(path.sep).join("/");
}

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    if ([".git", "node_modules", "vendor"].includes(entry)) return [];
    const absolute = path.join(directory, entry);
    return statSync(absolute).isDirectory() ? walk(absolute) : [absolute];
  });
}

function routeForFile(file) {
  if (file === "index.html") return "/";
  if (file.endsWith("/index.html")) {
    return `/${file.slice(0, -"index.html".length)}`;
  }
  return `/${file}`;
}

function fileForPathname(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded === "/") return "index.html";
  if (decoded.endsWith("/")) return `${decoded.slice(1)}index.html`;
  return decoded.slice(1);
}

function tags(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) || [];
}

function attributes(tag) {
  const attrs = {};
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+)))?/g;
  for (const match of tag.matchAll(pattern)) {
    const name = match[1].toLowerCase();
    if (name.startsWith("<")) continue;
    attrs[name] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attrs;
}

function findMeta(html, key, value) {
  for (const tag of tags(html, "meta")) {
    const attrs = attributes(tag);
    if ((attrs[key] || "").toLowerCase() === value.toLowerCase()) {
      return attrs.content || "";
    }
  }
  return null;
}

function findCanonical(html) {
  const matches = tags(html, "link").filter((tag) => {
    const rel = attributes(tag).rel || "";
    return rel.toLowerCase().split(/\s+/).includes("canonical");
  });
  return matches.map((tag) => attributes(tag).href).filter(Boolean);
}

function idsIn(html) {
  const ids = new Set();
  for (const tag of html.match(/<[a-z][^>]*>/gi) || []) {
    const attrs = attributes(tag);
    if (attrs.id) ids.add(attrs.id);
    if (tag.toLowerCase().startsWith("<a") && attrs.name) ids.add(attrs.name);
  }
  return ids;
}

function schemaNodes(schema) {
  if (Array.isArray(schema?.["@graph"])) return schema["@graph"];
  return schema && typeof schema === "object" ? [schema] : [];
}

function validateSchemaUrls(value, file, key = "") {
  if (Array.isArray(value)) {
    value.forEach((item) => validateSchemaUrls(item, file, key));
    return;
  }
  if (!value || typeof value !== "object") return;

  for (const [childKey, childValue] of Object.entries(value)) {
    if (["@id", "url", "logo", "image", "sameAs"].includes(childKey)) {
      const candidates = Array.isArray(childValue) ? childValue : [childValue];
      for (const candidate of candidates) {
        if (typeof candidate === "string" && !/^https:\/\//.test(candidate)) {
          fail(`${file}: schema ${childKey} must be an absolute HTTPS URL (${candidate})`);
        }
      }
    }
    validateSchemaUrls(childValue, file, childKey || key);
  }
}

const htmlFiles = walk(ROOT)
  .filter((file) => file.endsWith(".html"))
  .map((file) => toPosix(path.relative(ROOT, file)))
  .sort();

const records = new Map();
for (const file of htmlFiles) {
  const raw = readFileSync(path.join(ROOT, file), "utf8");
  const html = raw.replace(/<!--[\s\S]*?-->/g, "");
  const robots = findMeta(html, "name", "robots") || "";
  const noindex = /(?:^|,)\s*noindex(?:\s|,|$)/i.test(robots);
  const canonicals = findCanonical(html);
  const expectedCanonical = new URL(routeForFile(file), ORIGIN).href;

  if (!noindex) {
    if (canonicals.length !== 1) {
      fail(`${file}: expected exactly one canonical, found ${canonicals.length}`);
    } else if (canonicals[0] !== expectedCanonical) {
      fail(`${file}: canonical ${canonicals[0]} should be ${expectedCanonical}`);
    }
  }

  if (canonicals.length > 1) {
    fail(`${file}: duplicate canonical tags`);
  }

  const ogUrl = findMeta(html, "property", "og:url");
  if (ogUrl && canonicals[0] && ogUrl !== canonicals[0]) {
    fail(`${file}: og:url does not match the canonical`);
  }

  const scripts = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const [, source] of scripts) {
    jsonLdCount += 1;
    let schema;
    try {
      schema = JSON.parse(source);
    } catch (error) {
      fail(`${file}: invalid JSON-LD (${error.message})`);
      continue;
    }
    if (schema["@context"] !== "https://schema.org") {
      fail(`${file}: JSON-LD must use https://schema.org as @context`);
    }
    for (const node of schemaNodes(schema)) {
      if (!node["@type"]) fail(`${file}: JSON-LD node is missing @type`);
      if (node["@type"] === "LocalBusiness" && (!node.name || !node.url)) {
        fail(`${file}: LocalBusiness schema requires name and url`);
      }
      if (node["@type"] === "Article" && (!node.headline || !node.author || !node.publisher || !node.url)) {
        fail(`${file}: Article schema requires headline, author, publisher, and url`);
      }
      if (node["@type"] === "FAQPage" && !Array.isArray(node.mainEntity)) {
        fail(`${file}: FAQPage schema requires mainEntity`);
      }
      if (node["@type"] === "Service" && (!node.name || !node.provider)) {
        fail(`${file}: Service schema requires name and provider`);
      }
    }
    validateSchemaUrls(schema, file);
  }

  records.set(file, {
    canonical: canonicals[0] || null,
    file,
    html,
    ids: idsIn(html),
    indexable: !noindex,
    route: routeForFile(file),
  });
}

const canonicalOwners = new Map();
for (const record of records.values()) {
  if (!record.indexable || !record.canonical) continue;
  if (canonicalOwners.has(record.canonical)) {
    fail(`${record.file}: canonical is already used by ${canonicalOwners.get(record.canonical)}`);
  }
  canonicalOwners.set(record.canonical, record.file);
}

const graph = new Map(
  [...records.values()].filter((record) => record.indexable).map((record) => [record.route, new Set()]),
);
const inbound = new Map([...graph.keys()].map((route) => [route, 0]));

for (const record of records.values()) {
  for (const tag of tags(record.html, "a")) {
    const href = (attributes(tag).href || "").replace(/&amp;/g, "&").trim();
    if (!href || /^(?:mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    if (/^http:\/\/(?:www\.)?why57\.com(?:\/|$)/i.test(href)) {
      fail(`${record.file}: internal link uses HTTP (${href})`);
      continue;
    }

    let target;
    try {
      target = new URL(href, new URL(record.route, ORIGIN));
    } catch {
      fail(`${record.file}: invalid href (${href})`);
      continue;
    }
    if (target.origin !== ORIGIN) continue;

    internalLinkCount += 1;
    if (target.pathname === "/index.html") {
      fail(`${record.file}: link to /index.html creates a crawlable homepage duplicate (${href})`);
    }
    if (["/home", "/home/"].includes(target.pathname)) {
      fail(`${record.file}: link points to the legacy /home route (${href})`);
    }

    const targetFile = fileForPathname(target.pathname);
    if (!targetFile || (!records.has(targetFile) && !existsSync(path.join(ROOT, targetFile)))) {
      fail(`${record.file}: broken internal link ${href}`);
      continue;
    }
    if (!records.has(targetFile)) continue;
    const targetRecord = records.get(targetFile);
    if (record.indexable && targetRecord.indexable) {
      const outgoing = graph.get(record.route);
      if (!outgoing.has(targetRecord.route)) {
        outgoing.add(targetRecord.route);
        inbound.set(targetRecord.route, (inbound.get(targetRecord.route) || 0) + 1);
      }
    }

    if (target.hash && target.hash !== "#") {
      let fragment;
      try {
        fragment = decodeURIComponent(target.hash.slice(1));
      } catch {
        fail(`${record.file}: invalid URL fragment in ${href}`);
        continue;
      }
      if (fragment && !targetRecord.ids.has(fragment)) {
        fail(`${record.file}: ${href} targets missing fragment #${fragment}`);
      }
    }
  }

  const assetTags = [
    ...tags(record.html, "img").map((tag) => attributes(tag).src),
    ...tags(record.html, "script").map((tag) => attributes(tag).src),
    ...tags(record.html, "source").map((tag) => attributes(tag).src),
    ...tags(record.html, "link")
      .filter((tag) => {
        const rel = (attributes(tag).rel || "").toLowerCase();
        return ["stylesheet", "icon", "apple-touch-icon"].some((value) => rel.split(/\s+/).includes(value));
      })
      .map((tag) => attributes(tag).href),
  ].filter(Boolean);

  for (const source of assetTags) {
    let asset;
    try {
      asset = new URL(source.replace(/&amp;/g, "&"), new URL(record.route, ORIGIN));
    } catch {
      fail(`${record.file}: invalid asset URL (${source})`);
      continue;
    }
    if (asset.origin !== ORIGIN) continue;
    const assetFile = fileForPathname(asset.pathname);
    localAssetCount += 1;
    if (!assetFile || (!existsSync(path.join(ROOT, assetFile)) && !GENERATED_ASSETS.has(assetFile))) {
      fail(`${record.file}: missing local asset ${source}`);
    }
  }
}

const sitemapPath = path.join(ROOT, "sitemap.xml");
if (!existsSync(sitemapPath)) fail("sitemap.xml is missing");
const sitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, "utf8") : "";
const sitemapEntries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/gi)].map(([, block]) => ({
  lastmod: block.match(/<lastmod>([^<]+)<\/lastmod>/i)?.[1]?.trim() || "",
  loc: (block.match(/<loc>([^<]+)<\/loc>/i)?.[1] || "").trim().replace(/&amp;/g, "&"),
}));
const sitemapUrls = new Set();
const sitemapRoutes = new Set();
for (const entry of sitemapEntries) {
  if (!entry.loc) {
    fail("sitemap.xml: URL entry is missing loc");
    continue;
  }
  if (sitemapUrls.has(entry.loc)) fail(`sitemap.xml: duplicate URL ${entry.loc}`);
  sitemapUrls.add(entry.loc);

  let url;
  try {
    url = new URL(entry.loc);
  } catch {
    fail(`sitemap.xml: invalid URL ${entry.loc}`);
    continue;
  }
  if (url.origin !== ORIGIN || url.protocol !== "https:") {
    fail(`sitemap.xml: URL must use the canonical HTTPS origin (${entry.loc})`);
  }
  if (url.search || url.hash || url.pathname === "/index.html" || ["/home", "/home/"].includes(url.pathname)) {
    fail(`sitemap.xml: non-canonical URL ${entry.loc}`);
  }
  const targetFile = fileForPathname(url.pathname);
  if (!targetFile || !records.has(targetFile)) {
    fail(`sitemap.xml: URL has no HTML file (${entry.loc})`);
  } else if (!records.get(targetFile).indexable) {
    fail(`sitemap.xml: noindex page must not be listed (${entry.loc})`);
  }
  sitemapRoutes.add(url.pathname);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.lastmod)) {
    fail(`sitemap.xml: ${entry.loc} needs a YYYY-MM-DD lastmod`);
  } else if (new Date(`${entry.lastmod}T23:59:59Z`) > new Date(Date.now() + 24 * 60 * 60 * 1000)) {
    fail(`sitemap.xml: ${entry.loc} has a future lastmod (${entry.lastmod})`);
  }
}

const expectedSitemapUrls = new Set(
  [...records.values()]
    .filter((record) => record.indexable && record.canonical)
    .map((record) => record.canonical),
);
for (const url of expectedSitemapUrls) {
  if (!sitemapUrls.has(url)) fail(`sitemap.xml: missing indexable canonical ${url}`);
}
for (const url of sitemapUrls) {
  if (!expectedSitemapUrls.has(url)) fail(`sitemap.xml: unexpected or non-indexable URL ${url}`);
}

const visited = new Set(["/"]);
const queue = ["/"];
while (queue.length) {
  const route = queue.shift();
  for (const target of graph.get(route) || []) {
    if (!visited.has(target)) {
      visited.add(target);
      queue.push(target);
    }
  }
}
for (const route of sitemapRoutes) {
  if (!visited.has(route)) fail(`${route}: sitemap page is not reachable from the homepage crawl graph`);
  if (route !== "/" && (inbound.get(route) || 0) === 0) {
    fail(`${route}: indexable page has no internal links from another indexable page`);
  }
}
for (const route of priorityHomeRoutes) {
  if (!graph.get("/")?.has(route)) {
    fail(`index.html: priority commercial page needs a direct homepage link (${route})`);
  }
}

const robotsPath = path.join(ROOT, "robots.txt");
if (!existsSync(robotsPath)) fail("robots.txt is missing");
const robots = existsSync(robotsPath) ? readFileSync(robotsPath, "utf8") : "";
const robotLines = robots
  .split(/\r?\n/)
  .map((line) => line.replace(/#.*$/, "").trim())
  .filter(Boolean);
if (!robotLines.some((line) => /^allow:\s*\/$/i.test(line))) {
  fail("robots.txt: the public site must be crawlable");
}
if (!robotLines.some((line) => /^disallow:\s*\/dashboard\.html$/i.test(line))) {
  fail("robots.txt: preserve the intentional dashboard exclusion");
}
if (robotLines.some((line) => /^disallow:\s*\/\*\?\*?$/i.test(line))) {
  fail("robots.txt: do not block every query string; crawlers need to read canonical tags");
}
if (!robotLines.some((line) => /^sitemap:\s*https:\/\/why57\.com\/sitemap\.xml$/i.test(line))) {
  fail("robots.txt: missing canonical sitemap reference");
}

for (const legacyFile of ["home/index.html", "contact/index.html"]) {
  if (existsSync(path.join(ROOT, legacyFile))) {
    fail(`${legacyFile}: do not reintroduce a 200/meta-refresh legacy duplicate`);
  }
}

if (errors.length) {
  console.error(`SEO audit failed with ${errors.length} issue${errors.length === 1 ? "" : "s"}:`);
  for (const error of [...new Set(errors)].sort()) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("SEO audit passed");
  console.log(`- ${expectedSitemapUrls.size} indexable pages match ${sitemapUrls.size} sitemap URLs`);
  console.log(`- ${canonicalOwners.size} unique canonicals and ${jsonLdCount} valid JSON-LD blocks`);
  console.log(`- ${visited.size} indexable routes are reachable from the homepage`);
  console.log(`- ${internalLinkCount} internal links and ${localAssetCount} local assets resolve`);
  console.log("- query variants remain crawlable for canonical consolidation");
}
