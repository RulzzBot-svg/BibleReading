#!/usr/bin/env python3
"""Turn a public-domain KJV JSON file into per-book chapter files and icons.

The King James Version is in the public domain. The source compilation is
https://github.com/thiagobodruk/bible (json/en_kjv.json). Book names in that
file are Portuguese; this script keeps the English verse text and writes
stable English ids.
"""

from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE_URL = "https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json"
CACHE = Path("/tmp/bible-src/en_kjv.json")

# Source abbreviation -> app id, in canonical order.
ABBREV_TO_ID = {
    "gn": "genesis",
    "ex": "exodus",
    "lv": "leviticus",
    "nm": "numbers",
    "dt": "deuteronomy",
    "js": "joshua",
    "jz": "judges",
    "rt": "ruth",
    "1sm": "1samuel",
    "2sm": "2samuel",
    "1rs": "1kings",
    "2rs": "2kings",
    "1cr": "1chronicles",
    "2cr": "2chronicles",
    "ed": "ezra",
    "ne": "nehemiah",
    "et": "esther",
    "jó": "job",
    "sl": "psalms",
    "pv": "proverbs",
    "ec": "ecclesiastes",
    "ct": "song",
    "is": "isaiah",
    "jr": "jeremiah",
    "lm": "lamentations",
    "ez": "ezekiel",
    "dn": "daniel",
    "os": "hosea",
    "jl": "joel",
    "am": "amos",
    "ob": "obadiah",
    "jn": "jonah",
    "mq": "micah",
    "na": "nahum",
    "hc": "habakkuk",
    "sf": "zephaniah",
    "ag": "haggai",
    "zc": "zechariah",
    "ml": "malachi",
    "mt": "matthew",
    "mc": "mark",
    "lc": "luke",
    "jo": "john",
    "atos": "acts",
    "rm": "romans",
    "1co": "1corinthians",
    "2co": "2corinthians",
    "gl": "galatians",
    "ef": "ephesians",
    "fp": "philippians",
    "cl": "colossians",
    "1ts": "1thessalonians",
    "2ts": "2thessalonians",
    "1tm": "1timothy",
    "2tm": "2timothy",
    "tt": "titus",
    "fm": "philemon",
    "hb": "hebrews",
    "tg": "james",
    "1pe": "1peter",
    "2pe": "2peter",
    "1jo": "1john",
    "2jo": "2john",
    "3jo": "3john",
    "jd": "jude",
    "ap": "revelation",
}


def load_source() -> list:
    if not CACHE.exists():
        CACHE.parent.mkdir(parents=True, exist_ok=True)
        print(f"downloading {SOURCE_URL}")
        urllib.request.urlretrieve(SOURCE_URL, CACHE)
    with CACHE.open(encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, list) or len(data) != 66:
        raise SystemExit(f"expected 66 books, got {type(data)} {getattr(data, '__len__', lambda: '?')()}")
    return data


def write_bible(books: list) -> None:
    out_dir = ROOT / "public" / "bible"
    out_dir.mkdir(parents=True, exist_ok=True)
    catalog = []
    seen = set()
    total_chapters = 0
    total_verses = 0
    for book in books:
        abbrev = book["abbrev"]
        book_id = ABBREV_TO_ID.get(abbrev)
        if not book_id:
            raise SystemExit(f"unmapped abbreviation: {abbrev!r}")
        if book_id in seen:
            raise SystemExit(f"duplicate id {book_id}")
        seen.add(book_id)
        chapters = []
        verse_counts = []
        for chapter in book["chapters"]:
            verses = [str(verse).strip() for verse in chapter]
            if any(not verse for verse in verses):
                raise SystemExit(f"empty verse in {book_id}")
            chapters.append(verses)
            verse_counts.append(len(verses))
        payload = {"chapters": chapters}
        (out_dir / f"{book_id}.json").write_text(
            json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
        catalog.append(
            {"id": book_id, "chapters": len(chapters), "verseCounts": verse_counts}
        )
        total_chapters += len(chapters)
        total_verses += sum(verse_counts)
    missing = set(ABBREV_TO_ID.values()) - seen
    if missing:
        raise SystemExit(f"missing books: {sorted(missing)}")
    catalog_path = ROOT / "src" / "data" / "catalog.json"
    catalog_path.parent.mkdir(parents=True, exist_ok=True)
    catalog_path.write_text(
        json.dumps(
            {
                "translation": "KJV",
                "translationName": "King James Version",
                "license": "Public domain",
                "source": SOURCE_URL,
                "books": catalog,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"wrote {len(catalog)} books, {total_chapters} chapters, {total_verses} verses")


def _book_icon(size: int, maskable: bool) -> Image.Image:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    pine = (30, 61, 50, 255)
    paper = (246, 239, 228, 255)
    rubric = (141, 47, 42, 255)
    ink = (33, 27, 20, 255)
    if maskable:
        draw.rectangle((0, 0, size, size), fill=pine)
        pad = size * 0.18
    else:
        radius = int(size * 0.22)
        draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=pine)
        pad = size * 0.2
    left = pad
    right = size - pad
    top = size * 0.30
    bottom = size * 0.74
    mid = size / 2
    gap = max(2, size * 0.012)
    page_radius = max(4, int(size * 0.04))
    draw.rounded_rectangle((left, top, mid - gap, bottom), radius=page_radius, fill=paper)
    draw.rounded_rectangle((mid + gap, top, right, bottom), radius=page_radius, fill=paper)
    # A few rules on each page so the mark reads as a book at small sizes.
    rule = (210, 196, 176, 255)
    for index, y_frac in enumerate((0.38, 0.48, 0.58)):
        y = top + (bottom - top) * y_frac
        inset = size * 0.06
        draw.line((left + inset, y, mid - gap - inset, y), fill=rule, width=max(2, size // 80))
        end = right - inset - (size * 0.06 if index == 2 else 0)
        draw.line((mid + gap + inset, y, end, y), fill=rule, width=max(2, size // 80))
    ribbon_w = size * 0.055
    ribbon_x = mid + (right - mid) * 0.46
    ribbon_bottom = top + (bottom - top) * 0.46
    notch = top + (bottom - top) * 0.36
    draw.polygon(
        [
            (ribbon_x, top - size * 0.01),
            (ribbon_x + ribbon_w, top - size * 0.01),
            (ribbon_x + ribbon_w, ribbon_bottom),
            (ribbon_x + ribbon_w / 2, notch),
            (ribbon_x, ribbon_bottom),
        ],
        fill=rubric,
    )
    # Spine shadow
    draw.line((mid, top + 4, mid, bottom - 4), fill=ink, width=max(2, size // 90))
    return image


def write_icons() -> None:
    public = ROOT / "public"
    public.mkdir(parents=True, exist_ok=True)
    _book_icon(192, False).save(public / "pwa-192.png")
    _book_icon(512, False).save(public / "pwa-512.png")
    _book_icon(512, True).save(public / "maskable-512.png")
    _book_icon(180, False).save(public / "apple-touch-icon.png")
    print("wrote icons")


def main() -> None:
    if len(sys.argv) > 1:
        global CACHE
        CACHE = Path(sys.argv[1])
    write_bible(load_source())
    write_icons()


if __name__ == "__main__":
    main()
