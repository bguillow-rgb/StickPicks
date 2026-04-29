#!/usr/bin/env bash
# Build the Astro site and replace the contents of ../docs with the build.
# GitHub Pages on this repo is configured to serve /docs from the main
# branch, so this is the publish step.
#
# Run from web/:  bash scripts/deploy-to-docs.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Building Astro site"
npm run build

DOCS_DIR="../docs"

echo "==> Replacing $DOCS_DIR with fresh build"
# Preserve nothing — public/CNAME is rebuilt into dist by Astro and copied
# below. This is intentionally destructive: if you have manual files in
# /docs that aren't in /web, move them into /web first.
rm -rf "$DOCS_DIR"
mkdir -p "$DOCS_DIR"
cp -R dist/. "$DOCS_DIR"/

echo "==> /docs now contains:"
ls "$DOCS_DIR"

echo ""
echo "Done. Commit the changes in /docs and push to publish."
