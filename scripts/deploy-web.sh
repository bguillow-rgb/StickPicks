#!/usr/bin/env bash
# Build and assemble the full stickpicks.app publish tree in /docs:
#   /docs           → Astro marketing + SEO site (owns search/indexing)
#   /docs/app       → Expo web single-page app (baseUrl=/app, noindex)
#
# GitHub Pages serves the committed /docs from main. Run from the repo root:
#   bash scripts/deploy-web.sh
# Then review, commit /docs, and push to publish.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> [1/4] Building Astro marketing site (web/dist)"
( cd web && npm run build )

echo "==> [2/4] Exporting Expo web app (SPA, baseUrl=/app → dist-web)"
npx expo export --platform web --output-dir dist-web

echo "==> [3/4] Assembling /docs"
rm -rf docs
mkdir -p docs/app
cp -R web/dist/. docs/
cp -R dist-web/. docs/app/

echo "==> [4/4] Injecting SPA deep-link restore into /docs/app/index.html"
# Runs synchronously before the deferred entry bundle, so expo-router boots on
# the original deep-link URL that the marketing 404 stashed in sessionStorage.
node -e '
  const fs = require("fs");
  const f = "docs/app/index.html";
  let html = fs.readFileSync(f, "utf8");
  const snippet = "<script>(function(){var r=sessionStorage.getItem(\"spa:redirect\");if(r){sessionStorage.removeItem(\"spa:redirect\");history.replaceState(null,\"\",r);}})();</script>";
  if (!html.includes("spa:redirect")) {
    html = html.replace("</head>", snippet + "</head>");
    fs.writeFileSync(f, html);
    console.log("    injected restore snippet");
  } else {
    console.log("    restore snippet already present");
  }
'

echo ""
echo "==> /docs assembled:"
ls docs
echo "==> /docs/app:"
ls docs/app
echo ""
echo "Done. Review, then: git add docs && git commit && git push to publish."
