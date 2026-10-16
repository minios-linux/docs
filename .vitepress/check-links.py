#!/usr/bin/env python3
"""Check rendered local links, fragments and duplicate IDs in every locale."""

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urljoin, urlsplit


ROOT = Path(__file__).resolve().parent / "dist"
BASE = "/docs/"
DOCS = ROOT.parent.parent


def fenced_blocks(text):
    blocks = []
    marker = None
    language = ""
    body = []
    for line in text.splitlines():
        if marker is None:
            opening = re.match(r"^ {0,3}(`{3,}|~{3,})(.*)$", line)
            if opening:
                marker, language = opening.groups()
                language = language.strip()
                body = []
        elif re.fullmatch(r" {0,3}" + re.escape(marker[0]) + "{" + str(len(marker)) + r",}\s*", line):
            # Diagram labels are intentionally translated; commands and other
            # technical examples must remain byte-for-byte equivalent.
            if language != "mermaid":
                blocks.append((language, "\n".join(body)))
            marker = None
        else:
            body.append(line)
    if marker is not None:
        raise ValueError("unclosed fenced code block")
    return blocks


def check_sources(errors):
    sources = [DOCS / "index.md"]
    for section in ("development", "getting-started", "installing-minios",
                    "maintenance-and-recovery", "preparing-and-customizing",
                    "reference", "using-minios"):
        sources.extend((DOCS / section).rglob("*.md"))
    languages = sorted((DOCS / "translations").iterdir())
    for source in sources:
        relative = source.relative_to(DOCS)
        try:
            expected = fenced_blocks(source.read_text(encoding="utf-8"))
        except ValueError as error:
            errors.add(f"{relative}: {error}")
            continue
        for language in languages:
            if not language.is_dir():
                continue
            target = language / relative
            if not target.is_file():
                errors.add(f"{target.relative_to(DOCS)}: missing translation page")
                continue
            text = target.read_text(encoding="utf-8")
            if "<!-- lokit:untranslated -->" in text:
                errors.add(f"{target.relative_to(DOCS)}: untranslated section")
            try:
                if fenced_blocks(text) != expected:
                    errors.add(f"{target.relative_to(DOCS)}: code examples differ from source")
            except ValueError as error:
                errors.add(f"{target.relative_to(DOCS)}: {error}")
    return len(sources), sum(language.is_dir() for language in languages)


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids = Counter()
        self.links = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids[attrs["id"]] += 1
        if tag == "a" and "href" in attrs:
            self.links.append(attrs["href"])


def resolve_page(path):
    target = ROOT / unquote(path[len(BASE):])
    for candidate in (target, Path(str(target) + ".html"), target / "index.html"):
        if candidate.is_file():
            return candidate
    return None


def main():
    pages = {path: Page(path.read_text(encoding="utf-8"))
             for path in ROOT.rglob("*.html")}
    if not pages:
        print("No rendered pages; run npm run docs:build first.", file=sys.stderr)
        return 1
    errors = set()
    source_count, language_count = check_sources(errors)
    checked = 0
    for path, page in pages.items():
        name = path.relative_to(ROOT).as_posix()
        for anchor, count in page.ids.items():
            if count > 1:
                errors.add(f"{name}: duplicate id {anchor!r}")
        url = BASE + name
        # Clean index routes must resolve relative home-page links as directories.
        if url.endswith("index.html"):
            url = url[:-len("index.html")]
        for href in page.links:
            link = urlsplit(href)
            if link.scheme or link.netloc or not href or href == "#":
                continue
            resolved = urlsplit(urljoin(url, href))
            if not resolved.path.startswith(BASE):
                errors.add(f"{name}: local link escapes site base: {href}")
                continue
            target = resolve_page(resolved.path)
            checked += 1
            if target is None:
                errors.add(f"{name}: missing local target: {href}")
            elif resolved.fragment and target in pages:
                if unquote(resolved.fragment) not in pages[target].ids:
                    errors.add(f"{name}: missing fragment: {href}")
    for error in sorted(errors):
        print(error, file=sys.stderr)
    print(f"Checked {len(pages)} rendered pages and {checked} local links; "
          f"{len(errors)} errors.")
    print(f"Checked technical examples and page coverage for {source_count} "
          f"source pages in {language_count} translation languages.")
    return bool(errors)


if __name__ == "__main__":
    sys.exit(main())
