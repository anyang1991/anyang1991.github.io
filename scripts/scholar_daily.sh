#!/bin/bash
# Daily Google Scholar fetch + push. Invoked by launchd
# (~/Library/LaunchAgents/com.anyang.scholar-updater.plist) at 08:00.
# GitHub Actions cannot do this: Scholar 403-blocks datacenter IPs.
set -u
REPO="/Users/anyang/.zcode/workspace/default/个人网站"
LOG="$HOME/Library/Logs/scholar-updater.log"
PY="/opt/homebrew/bin/python3"
GIT="/opt/homebrew/bin/git"

log() { echo "$(date '+%F %T') $*" >> "$LOG"; }

cd "$REPO" || { log "cannot cd to repo"; exit 1; }

# jitter: spread the request across a random 0-20 min so it doesn't
# hit Scholar at the same second every day
if [ "${SCHOLAR_NO_JITTER:-0}" != "1" ]; then
  sleep $((RANDOM % 1200))
fi

if ! "$PY" scripts/update_scholar.py >> "$LOG" 2>&1; then
  log "fetch failed, keeping stale data"
  exit 1
fi

if ! "$GIT" diff --quiet assets/data/scholar.json; then
  "$GIT" add assets/data/scholar.json
  "$GIT" commit -q -m "scholar: daily stats update $(date +%F)"
  ok=0
  for _ in 1 2 3 4 5; do
    if "$GIT" push -q 2>/dev/null; then ok=1; break; fi
    sleep 20
  done
  if [ "$ok" = 1 ]; then log "pushed $(date +%F)"; else log "push failed after retries"; exit 1; fi
else
  log "no change"
fi
