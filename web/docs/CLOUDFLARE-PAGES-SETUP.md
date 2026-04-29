# Cloudflare Pages — Setup Walkthrough

Switching from GitHub Pages to Cloudflare Pages. **Free**, works with private GitHub repos via OAuth, auto-deploys on every push.

## One-time setup (~10 min)

### 1. Create the Pages project

1. Sign in to [Cloudflare](https://dash.cloudflare.com). If you don't have an account, the free tier is fine.
2. Workers & Pages → Pages → **Connect to Git**.
3. **GitHub** → authorize Cloudflare on your account → grant access to **bguillow-rgb/StickPicks** (private repo access works on free tier).
4. Select repo: `bguillow-rgb/StickPicks`.

### 2. Build settings

In the Cloudflare Pages "Set up builds and deployments" screen:

| Field | Value |
|---|---|
| **Project name** | `stickpicks` (or whatever — this is the *.pages.dev subdomain) |
| **Production branch** | `main` |
| **Framework preset** | `Astro` |
| **Build command** | `cd web && npm install && npm run build` |
| **Build output directory** | `web/dist` |
| **Root directory** | (leave blank) |

Click **Save and Deploy**. First build takes ~2-3 min. You'll get a temporary URL like `https://stickpicks.pages.dev` — verify the site looks right there before pointing the custom domain.

### 3. Environment variables

In Pages → your project → Settings → Environment variables → Production:

| Variable | Value | Required? |
|---|---|---|
| `NODE_VERSION` | `20` | Recommended |
| `PUBLIC_GA4_ID` | `G-XXXXXXXXXX` | Optional, fires GA4 |
| `PUBLIC_GSC_VERIFICATION` | (the value from GSC HTML-tag verification) | Optional, for GSC verification |
| `PUBLIC_INDEXNOW_KEY` | (key from `scripts/generate-indexnow-key.sh`) | Optional, for IndexNow |

After adding env vars, click **Retry deployment** on the latest deploy (or push a commit). Env vars only apply to new builds.

### 4. Custom domain (`stickpicks.app`)

In Pages → your project → Custom domains → **Set up a custom domain**:

1. Enter `stickpicks.app`.
2. Cloudflare detects how the domain is currently DNS-routed and gives you one of two paths:

**Path A — domain DNS already on Cloudflare:** Cloudflare adds the routing record automatically. Wait ~30 sec, done.

**Path B — domain DNS at another provider** (Namecheap, GoDaddy, etc.):
- Cloudflare gives you a `CNAME` target like `stickpicks.pages.dev`.
- Update your DNS at the registrar:
  - Remove the old `A` records pointing to GitHub Pages IPs (`185.199.108-111.153`).
  - Add a `CNAME` record: `stickpicks.app` → `stickpicks.pages.dev`.
  - For apex/root domain `CNAME` issues, Cloudflare offers `CNAME flattening` — your registrar may also support it. Otherwise use `A` records to Cloudflare's anycast IPs (Cloudflare gives you the values).
- Propagation: 5 min to several hours depending on TTL.

3. **Always Use HTTPS**: enable in SSL/TLS → Edge Certificates. Free.

### 5. Verify

Once the custom domain shows green in Cloudflare Pages:
- Open `https://stickpicks.app` — should show the new Astro site (hero with screenshot, FAQ section, Features link in nav, /about link in nav).
- Hit `https://stickpicks.app/about` — should render (was 404 on the old setup).
- Hit `https://stickpicks.app/sitemap-index.xml` — should serve XML.
- Hit `https://stickpicks.app/llms.txt` — should serve plain text.

## Future deploys

After this is wired up: **every `git push origin main` auto-deploys.**

You no longer need:
- `bash scripts/deploy-to-docs.sh` (this script is kept as a fallback but can be deleted).
- The `docs/` folder in the repo (Cloudflare Pages doesn't read it).

To deploy a new article: edit the markdown file in `web/src/content/articles/`, set `published: true`, push to main, Cloudflare auto-deploys in ~1 min.

After each deploy with new content, run the IndexNow ping locally to notify search engines:

```bash
cd web
PUBLIC_INDEXNOW_KEY=<your-key> bash scripts/indexnow-ping.sh
```

## Optional cleanup

Once Cloudflare Pages is verified working:
1. Delete `docs/` from the repo (Cloudflare Pages doesn't use it).
2. Delete `web/scripts/deploy-to-docs.sh` (no longer needed).
3. (Optional) Disable GitHub Pages in repo Settings → Pages → Source = "None" if it's still showing as enabled.

The DNS migration is reversible — keep a note of the old `A` records (`185.199.108-111.153`) in case you ever need to roll back.
