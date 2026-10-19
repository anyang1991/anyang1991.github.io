#!/usr/bin/env python3
"""Fetch Google Scholar profile stats into assets/data/scholar.json.
Runs daily via GitHub Actions. Exits non-zero without writing on failure,
so the site keeps serving the last good data."""
import datetime
import json
import re
import sys
import time
import urllib.request

USER = "1vLLs6wAAAAJ"
URL = f"https://scholar.google.com/citations?user={USER}&hl=en"
OUT = "assets/data/scholar.json"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")


def fetch_html():
    req = urllib.request.Request(URL, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        html = r.read().decode("utf-8", "ignore")
    if "gsc_rsb_std" not in html:
        raise ValueError("profile page did not load (captcha or redirect)")
    return html


def parse(html):
    def num(s):
        return int(s.replace(",", ""))

    cells = re.findall(r'class="gsc_rsb_std">([\d,]+)<', html)
    if len(cells) < 6:
        raise ValueError("stats table incomplete")
    citations, h_index, i10_index = num(cells[0]), num(cells[2]), num(cells[4])

    years = re.findall(r'class="gsc_g_t"[^>]*>(\d{4})<', html)
    counts = re.findall(r'class="gsc_g_al">([\d,]+)<', html)
    if not years or len(years) != len(counts):
        raise ValueError("citation histogram incomplete")
    cites_per_year = {y: num(c) for y, c in zip(years, counts)}

    publications = len(re.findall(r'class="gsc_a_t"', html))
    if publications == 0:
        raise ValueError("article list empty")

    return {
        "updated": datetime.date.today().isoformat(),
        "citations": citations,
        "h_index": h_index,
        "i10_index": i10_index,
        "publications": publications,
        "cites_per_year": cites_per_year,
    }


def main():
    last_err = None
    for attempt in range(3):
        try:
            data = parse(fetch_html())
            with open(OUT, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                f.write("\n")
            print("updated:", json.dumps(data, ensure_ascii=False))
            return
        except Exception as e:
            last_err = e
            print(f"attempt {attempt + 1} failed: {e}", file=sys.stderr)
            time.sleep(20)
    print(f"giving up, keeping stale data: {last_err}", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    main()
