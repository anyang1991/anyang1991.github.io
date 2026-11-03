#!/usr/bin/env python3
"""Daily Scholar fetch + push, invoked by launchd (com.anyang.scholar-updater).

macOS 27 blocks launchd execution of home-directory shell scripts
("Operation not permitted"), while /opt/homebrew python3 reading a
home-dir script file is unaffected. The runtime copy of this file and
update_scholar.py lives in ~/Library/Application Support/scholar-updater/;
the repo keeps the sources under scripts/.

Usage: scholar_daily.py [--no-jitter]
"""
import datetime
import json
import os
import random
import re
import subprocess
import sys
import time
import urllib.parse
import urllib.request

REPO = "/Users/anyang/.zcode/workspace/default/个人网站"
UPDATER = os.path.expanduser(
    "~/Library/Application Support/scholar-updater/update_scholar.py")
PY = "/opt/homebrew/bin/python3"
GIT = "/opt/homebrew/bin/git"
LOG = os.path.expanduser("~/Library/Logs/scholar-updater.log")
GROUP = "🔰 选择节点"          # ClashX selector group used for proxied traffic
RATELIMIT_EXIT = 42            # update_scholar.py exits 42 on 403/429


def log(msg):
    stamp = datetime.datetime.now().strftime("%F %T")
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(f"{stamp} {msg}\n")


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def find_clash_api():
    """ClashX binds its external-controller port randomly; discover it."""
    out = run(["/usr/sbin/lsof", "-iTCP", "-sTCP:LISTEN", "-P", "-n"]).stdout
    for line in out.splitlines():
        if "ClashX" not in line or "127.0.0.1" not in line:
            continue
        port = line.rsplit(":", 1)[1].split()[0]
        try:
            with urllib.request.urlopen(
                    f"http://127.0.0.1:{port}/version", timeout=2) as r:
                if r.status == 200:
                    return port
        except Exception:
            pass
    return None


def clash_switch(api, node):
    group = urllib.parse.quote(GROUP, safe="")
    body = json.dumps({"name": node}).encode()
    req = urllib.request.Request(
        f"http://127.0.0.1:{api}/proxies/{group}", data=body,
        method="PUT", headers={"Content-Type": "application/json"})
    urllib.request.urlopen(req, timeout=5)


def clash_current(api):
    group = urllib.parse.quote(GROUP, safe="")
    with urllib.request.urlopen(
            f"http://127.0.0.1:{api}/proxies/{group}", timeout=5) as r:
        return json.load(r).get("now")


def pick_candidates(all_nodes, current):
    """Prefer clean-looking regional nodes, skip junk/quality-flagged ones."""
    cands = []
    for n in all_nodes:
        if n == current or "下载" in n or "免费" in n or re.search(r"x0\.", n):
            continue
        if re.search(r"日本|新加坡|美国|韩国|台湾|香港", n):
            cands.append(n)
    return cands


def fetch_via_alt_exit():
    """On 403/429: switch the Clash exit node, retry once, switch back."""
    api = find_clash_api()
    if not api:
        log("clash api not found; cannot switch exit node")
        return False
    try:
        current = clash_current(api)
        group = urllib.parse.quote(GROUP, safe="")
        with urllib.request.urlopen(
                f"http://127.0.0.1:{api}/proxies/{group}", timeout=5) as r:
            all_nodes = json.load(r).get("all", [])
        for node in pick_candidates(all_nodes, current):
            try:
                clash_switch(api, node)
                time.sleep(2)
                log(f"exit switched to {node}; retrying fetch")
                r2 = run([PY, UPDATER])
                with open(LOG, "a", encoding="utf-8") as f:
                    f.write(r2.stdout + r2.stderr)
                if r2.returncode == 0:
                    log(f"fetch succeeded via {node}")
                    return True
            finally:
                clash_switch(api, current)  # always restore the user's node
        log("all alternate exits rate-limited too")
        return False
    except Exception as e:
        log(f"alt-exit attempt failed: {e}")
        return False


def main():
    no_jitter = "--no-jitter" in sys.argv[1:]
    os.chdir(REPO)
    if not no_jitter:
        delay = random.randint(0, 1200)  # spread requests across 0-20 min
        log(f"jitter: sleeping {delay}s")
        time.sleep(delay)

    r = run([PY, UPDATER])
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(r.stdout)
        f.write(r.stderr)

    if r.returncode == RATELIMIT_EXIT:
        if not fetch_via_alt_exit():
            log("fetch failed, keeping stale data")
            sys.exit(1)
    elif r.returncode != 0:
        log("fetch failed, keeping stale data")
        sys.exit(1)

    if run([GIT, "-C", REPO, "diff", "--quiet",
            "assets/data/scholar.json"]).returncode == 0:
        log("no change")
        return

    run([GIT, "-C", REPO, "add", "assets/data/scholar.json"])
    date = datetime.date.today().isoformat()
    run([GIT, "commit", "-q", "-m", f"scholar: daily stats update {date}"])
    for attempt in range(5):
        r = run([GIT, "-C", REPO, "push"])
        if r.returncode == 0:
            log(f"pushed {date}")
            return
        time.sleep(20)
    log("push failed after retries")
    sys.exit(1)


if __name__ == "__main__":
    main()
