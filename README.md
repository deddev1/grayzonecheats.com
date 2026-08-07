# Gray Zone Warfare Cheats

Static website for Gray Zone Warfare cheat product pages.

## Buy / checkout URL

All purchase buttons use the checkout URL configured in `assets/js/main.js` (`BUY_URL`).
## Pages

| Page | File |
|------|------|
| Home | `index.html` |
| Aimbot | `aimbot.html` |
| ESP | `esp.html` |
| Pricing | `pricing.html` |
| FAQ | `faq.html` |
| Support | `support.html` |
| Updates | `updates.html` |
| Terms | `terms.html` |
| Privacy | `privacy.html` |

## Local preview

### In this Cloud Agent (Cursor)

The dev server runs **inside the agent VM**, not on your laptop. `localhost` on your computer only works after Cursor forwards the port.

1. Make sure the server is running (command below).
2. In the **agent panel**, click the **plug icon** (top-right) → **Ports**.
3. Open forwarded port **8080** (or the alternate port Cursor shows if 8080 is busy locally).
4. Use **Open in Browser** from that menu.

```bash
cd /workspace
python3 -m http.server 8080 --bind 0.0.0.0
```

If `localhost:8080` still fails, close stale forwards in the plug menu and reopen port 8080, or try the port number Cursor assigns (e.g. `localhost:xxxxx`).

### On your own machine (outside Cloud Agent)

Clone the repo locally, then:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`

## Deployment

Canonical domain: **https://grayzonecheats.com**

### Cloudflare Pages (recommended)

This is a **static HTML site** — no build step.

#### Option A — Git integration (simplest)

| Setting | Value |
|---------|-------|
| **Production branch** | `main` (after merging the site PR) |
| **Framework preset** | **None** |
| **Build command** | *(leave empty)* |
| **Build output directory** | `/` (root) |
| **Deploy command** | *(leave empty)* |

`_redirects` and `_headers` in the repo root are used automatically. `wrangler.jsonc` configures Workers static assets for CI deploys.

#### Option B — Workers Builds (CI/CD)

1. In Cloudflare **Settings → Build**, **remove** the `CLOUDFLARE_API_TOKEN` environment variable.
2. Set build and deploy commands:

| Setting | Value |
|---------|-------|
| **Build command** | `npm run build` |
| **Deploy command** | `npx wrangler deploy` |

`wrangler.jsonc` uses Workers static assets (`assets.directory: "."`). `_redirects`, `_headers`, and `.assetsignore` are applied automatically.

Alternatively, set deploy command to `npm run deploy` to run the SEO build step and deploy in one step.

Cloudflare Workers Builds inject their own credentials in CI — no API token env var is needed.

**Local deploy (one-time auth):**

```bash
npm install
npx wrangler login
npm run deploy
```

For interactive login + deploy in one step:

```bash
npm run deploy:local
```

**Common deploy errors:**

| Error | Fix |
|-------|-----|
| `Missing entry-point to Worker script or to assets directory` | Ensure `wrangler.jsonc` has `"assets": { "directory": "." }` and deploy uses `npx wrangler deploy` |
| `Configuration file for Pages projects does not support 'assets'` | You are on Pages deploy (`wrangler pages deploy`); use Workers deploy (`npx wrangler deploy`) with `assets` config instead |
| `wrangler: not found` | Commit `package-lock.json`, run `npm ci`, and use `npx wrangler` in deploy scripts |
| Auth / token errors | Remove `CLOUDFLARE_API_TOKEN` from build env; run `npx wrangler login` locally |
| Build init timeout | Confirm branch has the full site; set framework to **None** |

Custom domain: add `grayzonecheats.com` under **Custom domains** after a successful deploy.

### Other hosts

Point DNS to Netlify, Vercel, or Apache. Redirect rules in `_redirects`, `vercel.json`, and `.htaccess` enforce HTTPS, non-www, and redirect the legacy `grayzonewarfare.com` domain.

## SEO files

- `robots.txt` — crawl rules and sitemap references
- `sitemap.xml` — indexable pages only (excludes terms/privacy noindex pages)
- `sitemap-images.xml` — self-hosted hero, gallery, and logo images

### Cloudflare domain redirects (required)

`_redirects` only handles path redirects (`/index.html` → `/`). Host-level redirects must be set in the **Cloudflare dashboard**:

1. Go to **Rules → Redirect Rules** (or **Bulk Redirects**)
2. Add rules:
   - `www.grayzonecheats.com/*` → `https://grayzonecheats.com/$1` (301)
   - `grayzonewarfare.com/*` → `https://grayzonecheats.com/$1` (301)
   - `www.grayzonewarfare.com/*` → `https://grayzonecheats.com/$1` (301)

`vercel.json` and `.htaccess` handle these redirects on Vercel and Apache hosts.
