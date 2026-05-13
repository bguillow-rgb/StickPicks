#!/usr/bin/env bash
# Stick Picks — safe-ota.sh
#
# Ported from Pour Picks (2026-05-12) after a regression there shipped
# multiple OTAs from a stale worktree and reverted 25 production commits.
# Different trunk layout here: Stick Picks runs PARALLEL LINEAGES —
# `main` holds the marketing-site path (Astro at /web → /docs), and iOS
# app code ships from `claude/build-N` branches (currently
# claude/build-17 forked off claude/build-14-resubmit). Per Mark Z's
# review this is acceptable for the rejection cycle and should be
# unified to a single trunk post-approval. Until then, this script
# accepts either `main` OR a `claude/build-*` branch as the OTA source.
#
# Refuses to publish if ANY of the following are true:
#   1. Current branch isn't `main` or `claude/build-*`.
#   2. The current tree has uncommitted changes.
#   3. Current branch is behind its origin counterpart (fetch + pull first).
#   4. `npm run typecheck` fails.
#
# Usage:
#   bash scripts/safe-ota.sh "Your update message"
#   bash scripts/safe-ota.sh --branch=production "Your update message"
#
# Defaults: --branch=production --platform=ios (matches the only EAS
# channel + the only build target Stick Picks publishes today).

set -euo pipefail

BRANCH="production"
PLATFORM="ios"
MESSAGE=""

# Parse args.
while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch=*) BRANCH="${1#*=}"; shift ;;
    --branch) BRANCH="$2"; shift 2 ;;
    --platform=*) PLATFORM="${1#*=}"; shift ;;
    --platform) PLATFORM="$2"; shift 2 ;;
    --help|-h)
      echo "Usage: $0 [--branch=production] [--platform=ios] \"message\""
      echo ""
      echo "  Runtime channel is read from app.json's version field"
      echo "  (runtimeVersion.policy = appVersion). To target an older"
      echo "  runtime, ship from a git worktree checked out to a commit"
      echo "  that had that version — don't try to override at update time."
      echo ""
      echo "  --platform defaults to ios. The bundle export crashes on"
      echo "  platform=all because of an AsyncStorage/Supabase init that"
      echo "  references \`window\` outside a browser. Override only if"
      echo "  you've actually fixed that path."
      exit 0
      ;;
    *) MESSAGE="$1"; shift ;;
  esac
done

if [[ -z "$MESSAGE" ]]; then
  echo "✗ Refusing: no update message. Usage: $0 \"Your message\"" >&2
  exit 1
fi

red()   { printf "\033[31m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
dim()   { printf "\033[2m%s\033[0m\n" "$*"; }

echo "→ Pre-flight checks for OTA: \"$MESSAGE\""

# 1) Must be on main or claude/build-*. The Build-17 cycle ships from
#    claude/build-17. Once we unify the trunks post-approval, this
#    check tightens to main-only.
current_branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$current_branch" != "main" && ! "$current_branch" =~ ^claude/build-[0-9]+$ ]]; then
  red "✗ Refusing: current branch is \"$current_branch\"."
  red "  Allowed branches: main, or claude/build-N (where N is the iOS build number)."
  red "  Stale-worktree OTAs are the most common cause of production regressions."
  exit 1
fi
green "✓ On allowed branch ($current_branch)"

# 2) Tree is clean.
if [[ -n "$(git status --porcelain)" ]]; then
  red "✗ Refusing: uncommitted changes in working tree."
  git status --short
  exit 1
fi
green "✓ Tree clean"

# 3) Fetch + ensure not behind origin/$current_branch.
git fetch origin "$current_branch" --quiet
behind="$(git rev-list --count "HEAD..origin/$current_branch")"
if [[ "$behind" -gt 0 ]]; then
  red "✗ Refusing: local $current_branch is $behind commit(s) behind origin/$current_branch."
  red "  Run \`git pull --ff-only\` and try again."
  exit 1
fi
ahead="$(git rev-list --count "origin/$current_branch..HEAD")"
if [[ "$ahead" -gt 0 ]]; then
  dim "  (Note: local $current_branch is $ahead commit(s) ahead of origin/$current_branch; push when done.)"
fi
green "✓ In sync with origin/$current_branch"

# 4) Typecheck.
echo "→ Running typecheck..."
if ! npm run --silent typecheck >/tmp/safe-ota-typecheck.log 2>&1; then
  red "✗ Refusing: typecheck failed."
  tail -20 /tmp/safe-ota-typecheck.log >&2
  exit 1
fi
green "✓ Typecheck clean"

# 5) Final confirm — show what's about to ship.
echo ""
dim "Last 3 commits going into this bundle:"
git log -3 --oneline | sed 's/^/  /'
echo ""
echo "→ Publishing to EAS Update (branch=$BRANCH platform=$PLATFORM)"

npx eas-cli update \
  --branch="$BRANCH" \
  --platform="$PLATFORM" \
  --message="$MESSAGE" \
  --non-interactive
