#!/usr/bin/env python3
"""Validate Why57 HTML metadata, canonicals, sitemap membership, and internal links."""

from __future__ import annotations

import json
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://why57.com"
CONSOLIDATED = {
    "santa-rosa-software-development.html": "sonoma-county-software-development.html",
    "petaluma-software-development.html": "sonoma-county-software-development.html",
    "marin-county-software-development.html": "bay-area-business-automation.html",
    "napa-valley-tech-automation.html": "bay-area-business-automation.html",
}
CORE_CONTENT = {
    "sonoma-county-software-development.html",
    "bay-area-business-automation.html",
    "silicon-valley-software-consulting.html",
    "ai-app-prototype-to-production.html",
    "ai-prototype-readiness-security-checklist.html",
    "ai-prototype-repair-rebuild-cost.html",
}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title_parts: list[str] = []
        self.in_title = False
        self.h1_count = 0
        self.metas: dict[str, str] = {}
        self.canonicals: list[str] = []
        self.hrefs: list[str] = []
        self.ids: set[str] = set()
        self.json_ld: list[str] = []
        self.in_json_ld = False
        self.script_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {key.lower(): value or "" for key, value in attrs}
        tag = tag.lower()
        if data.get("id"):
            self.ids.add(data["id"])
        if tag == "title":
            self.in_title = True
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "meta":
            key = (data.get("name") or data.get("property") or data.get("http-equiv", "")).lower()
            if key:
                self.metas[key] = data.get("content", "").strip()
        elif tag == "link" and "canonical" in data.get("rel", "").lower().split():
            self.canonicals.append(data.get("href", "").strip())
        elif tag == "a" and data.get("href"):
            self.hrefs.append(data["href"].strip())
        elif tag == "script" and data.get("type", "").lower() == "application/ld+json":
            self.in_json_ld = True
            self.script_parts = []

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "title":
            self.in_title = False
        elif tag == "script" and self.in_json_ld:
            self.in_json_ld = False
            self.json_ld.append("".join(self.script_parts).strip())
            self.script_parts = []

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)
        if self.in_json_ld:
            self.script_parts.append(data)

    @property
    def title(self) -> str:
        return " ".join("".join(self.title_parts).split())

    @property
    def noindex(self) -> bool:
        return "noindex" in self.metas.get("robots", "").lower()


def expected_url(path: Path) -> str:
    relative = path.relative_to(ROOT).as_posix()
    if relative == "index.html":
        return f"{BASE_URL}/"
    return f"{BASE_URL}/{relative}"


def resolve_internal(source: Path, href: str) -> tuple[Path, str] | None:
    parsed = urlparse(href)
    if parsed.scheme in {"mailto", "tel", "javascript", "data"}:
        return None
    if parsed.scheme in {"http", "https"}:
        if parsed.netloc.lower() not in {"why57.com", "www.why57.com"}:
            return None
        raw_path = parsed.path
    elif parsed.scheme or parsed.netloc:
        return None
    else:
        raw_path = parsed.path

    raw_path = unquote(raw_path)
    if not raw_path:
        target = source
    elif raw_path.startswith("/"):
        target = ROOT / raw_path.lstrip("/")
    else:
        target = source.parent / raw_path
    if raw_path.endswith("/") or target == ROOT:
        target = target / "index.html"
    return target.resolve(), parsed.fragment


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []
    pages: dict[Path, PageParser] = {}

    for path in sorted(ROOT.glob("*.html")) + sorted((ROOT / "case-studies").glob("*.html")):
        parser = PageParser()
        try:
            parser.feed(path.read_text(encoding="utf-8"))
        except Exception as exc:  # HTMLParser should be forgiving; a crash is actionable.
            errors.append(f"{path.relative_to(ROOT)}: HTML parse failed: {exc}")
            continue
        pages[path.resolve()] = parser
        rel = path.relative_to(ROOT).as_posix()

        if not parser.title:
            errors.append(f"{rel}: missing <title>")
        elif not 30 <= len(parser.title) <= 70:
            warnings.append(f"{rel}: title length is {len(parser.title)} characters")

        description = parser.metas.get("description", "")
        if not parser.noindex and not description:
            errors.append(f"{rel}: indexable page is missing a meta description")
        elif description and not 70 <= len(description) <= 180:
            warnings.append(f"{rel}: description length is {len(description)} characters")

        if parser.h1_count != 1:
            errors.append(f"{rel}: expected one <h1>, found {parser.h1_count}")

        if not parser.canonicals:
            if not parser.noindex:
                errors.append(f"{rel}: indexable page is missing a canonical")
        elif len(parser.canonicals) != 1:
            errors.append(f"{rel}: expected one canonical, found {len(parser.canonicals)}")

        if parser.canonicals:
            canonical = parser.canonicals[0]
            if rel in CONSOLIDATED:
                target = f"{BASE_URL}/{CONSOLIDATED[rel]}"
                if not parser.noindex:
                    errors.append(f"{rel}: consolidated URL must be noindex")
                if canonical != target:
                    errors.append(f"{rel}: canonical should be {target}, found {canonical}")
                refresh = parser.metas.get("refresh", "")
                if CONSOLIDATED[rel] not in refresh:
                    errors.append(f"{rel}: refresh does not point to consolidated destination")
            elif not parser.noindex and canonical != expected_url(path):
                errors.append(f"{rel}: canonical should self-reference {expected_url(path)}, found {canonical}")

        for block_number, block in enumerate(parser.json_ld, 1):
            try:
                json.loads(block)
            except json.JSONDecodeError as exc:
                errors.append(f"{rel}: JSON-LD block {block_number} is invalid: {exc}")

        if rel in CORE_CONTENT:
            required_meta = {"og:title", "og:description", "og:image", "og:url", "og:type", "twitter:card", "author"}
            missing = sorted(key for key in required_meta if not parser.metas.get(key))
            if missing:
                errors.append(f"{rel}: missing core metadata: {', '.join(missing)}")
            if not parser.json_ld:
                errors.append(f"{rel}: core content page is missing JSON-LD")

    # Resolve links after every page has been parsed so anchors can be checked.
    for source, parser in pages.items():
        source_rel = source.relative_to(ROOT).as_posix()
        for href in parser.hrefs:
            resolved = resolve_internal(source, href)
            if not resolved:
                continue
            target, fragment = resolved
            try:
                target.relative_to(ROOT)
            except ValueError:
                errors.append(f"{source_rel}: internal link escapes site root: {href}")
                continue
            if not target.exists():
                errors.append(f"{source_rel}: broken internal link: {href}")
                continue
            target_parser = pages.get(target)
            if target_parser and not parser.noindex and target_parser.noindex:
                errors.append(f"{source_rel}: indexable page links to noindex page: {href}")
            if fragment and target_parser and fragment not in target_parser.ids:
                errors.append(f"{source_rel}: missing fragment target in {href}")

    # Duplicated metadata makes search intent harder to distinguish.
    for attr in ("title",):
        seen: dict[str, str] = {}
        for path, parser in pages.items():
            if parser.noindex:
                continue
            value = getattr(parser, attr)
            rel = path.relative_to(ROOT).as_posix()
            if value and value in seen:
                errors.append(f"{rel}: duplicate {attr} also used by {seen[value]}")
            elif value:
                seen[value] = rel

    # Sitemap should include every indexable public HTML page and no noindex page.
    sitemap_path = ROOT / "sitemap.xml"
    try:
        root = ET.parse(sitemap_path).getroot()
        namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        sitemap_urls = {node.text.strip() for node in root.findall("sm:url/sm:loc", namespace) if node.text}
    except (ET.ParseError, OSError) as exc:
        errors.append(f"sitemap.xml: could not parse: {exc}")
        sitemap_urls = set()

    expected_urls = {expected_url(path) for path, parser in pages.items() if not parser.noindex}
    for url in sorted(expected_urls - sitemap_urls):
        errors.append(f"sitemap.xml: missing indexable URL {url}")
    for url in sorted(sitemap_urls - expected_urls):
        errors.append(f"sitemap.xml: contains missing or noindex URL {url}")

    for message in warnings:
        print(f"WARN  {message}")
    for message in errors:
        print(f"ERROR {message}")
    print(f"Checked {len(pages)} HTML pages, {len(sitemap_urls)} sitemap URLs, and all local links.")
    print(f"Result: {len(errors)} error(s), {len(warnings)} warning(s).")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
