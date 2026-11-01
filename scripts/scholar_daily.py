#!/usr/bin/env python3
"""Daily Scholar fetch + push, invoked by launchd (com.anyang.scholar-updater).

Python port of scripts/scholar_daily.sh: macOS 26.5 tightened launchd
execution of home-directory shell scripts ("Operation not permitted"),
while /opt/homebrew python3 reading a home-dir script file is unaffected.

Usage: scholar_daily.py [--no-jitter]
"""
import datetime
import os
import random
import subprocess
import sys
import time

REPO = "/Users/anyang/.zcode/workspace/default/个人网站"
PY = "/opt/homebrew/bin/python3"
GIT = "/opt/homebrew/bin/git"
LOG = os.path.expanduser("~/Library/Logs/scholar-updater.log")


def log(msg):
    stamp = datetime.datetime.now().strftime("%F %T")
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(f"{stamp} {msg}\n")


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def main():
    no_jitter = "--no-jitter" in sys.argv[1:]
    os.chdir(REPO)

    if not no_jitter:
        delay = random.randint(0, 1200)  # spread requests across 0-20 min
        log(f"jitter: sleeping {delay}s")
        time.sleep(delay)

    r = run([PY, "scripts/update_scholar.py"])
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(r.stdout)
        f.write(r.stderr)
    if r.returncode != 0:
        log("fetch failed, keeping stale data")
        sys.exit(1)

    if run([GIT, "diff", "--quiet", "assets/data/scholar.json"]).returncode == 0:
        log("no change")
        return

    run([GIT, "add", "assets/data/scholar.json"])
    date = datetime.date.today().isoformat()
    run([GIT, "commit", "-q", "-m", f"scholar: daily stats update {date}"])
    for attempt in range(5):
        r = run([GIT, "push"])
        if r.returncode == 0:
            log(f"pushed {date}")
            return
        time.sleep(20)
    log("push failed after retries")
    sys.exit(1)


if __name__ == "__main__":
    main()
