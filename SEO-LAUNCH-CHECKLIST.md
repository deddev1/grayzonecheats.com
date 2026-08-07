# SEO Launch Checklist — Gray Zone Warfare Cheats

**Domain:** https://grayzonecheats.com  
**Last verified:** 2026-07-28  
**Build check:** `npm run build` (runs `seo-optimize.py` + `seo-verify.mjs`)

Use this checklist before and immediately after submitting the site to Google Search Console.

---

## Pre-launch audit (completed)

| Check | Status | Notes |
|-------|--------|-------|
| Indexable pages | ✅ 17 pages | Homepage + product pages + blog hub + 7 articles + support + updates |
| Intentional noindex | ✅ 2 pages | `terms.html`, `privacy.html` only (`noindex, follow`) |
| Accidental noindex | ✅ None | No other pages carry `noindex` |
| Sitemap coverage | ✅ 17/17 URLs | `sitemap.xml` matches all indexable pages |
| Legal pages excluded from sitemap | ✅ | `terms.html` and `privacy.html` are not listed |
| Canonical URLs | ✅ | All point to `https://grayzonecheats.com/...` |
| Broken internal links | ✅ 0 | Verified by build script |
| `robots.txt` | ✅ | Allows `/`, disallows `/node_modules/`, lists both sitemaps |
| Homepage redirects | ✅ | `/index.html` → `/` (301), `/home` → `/` (301) |
| Structured data | ✅ | Organization, WebSite, BreadcrumbList, FAQ/Article where applicable |
| Image SEO | ✅ | Alt text, dimensions, image sitemap at `/sitemap-images.xml` |

### Indexable URL inventory

**Primary (high priority)**

- https://grayzonecheats.com/
- https://grayzonecheats.com/features.html
- https://grayzonecheats.com/esp.html
- https://grayzonecheats.com/aimbot.html
- https://grayzonecheats.com/radar.html
- https://grayzonecheats.com/faq.html
- https://grayzonecheats.com/pricing.html
- https://grayzonecheats.com/blog.html

**Blog articles**

- https://grayzonecheats.com/blog/beginner-guide-2026.html
- https://grayzonecheats.com/blog/map-guide.html
- https://grayzonecheats.com/blog/weapons-guide.html
- https://grayzonecheats.com/blog/updates-guide.html
- https://grayzonecheats.com/blog/esp-explained.html
- https://grayzonecheats.com/blog/features-guide.html
- https://grayzonecheats.com/blog/tips-and-tricks.html

**Secondary**

- https://grayzonecheats.com/support.html
- https://grayzonecheats.com/updates.html

**Excluded from indexing (by design)**

- https://grayzonecheats.com/terms.html
- https://grayzonecheats.com/privacy.html

---

## Google Search Console setup

### 1. Add property

- [ ] Go to [Google Search Console](https://search.google.com/search-console)
- [ ] Add property: **Domain** `grayzonecheats.com` (recommended) or **URL prefix** `https://grayzonecheats.com/`
- [ ] Verify ownership via one of:
  - DNS TXT record (best for domain property)
  - HTML file upload
  - HTML meta tag
  - Google Analytics / Tag Manager (if already installed)

### 2. Submit sitemaps

- [ ] Open **Sitemaps** in the left menu
- [ ] Submit: `https://grayzonecheats.com/sitemap.xml`
- [ ] Submit: `https://grayzonecheats.com/sitemap-images.xml`
- [ ] Confirm both show **Success** status (may take 24–48 hours)

### 3. Request indexing for key URLs

Use **URL Inspection** → **Request indexing** for these priority pages first:

- [ ] `https://grayzonecheats.com/`
- [ ] `https://grayzonecheats.com/features.html`
- [ ] `https://grayzonecheats.com/esp.html`
- [ ] `https://grayzonecheats.com/aimbot.html`
- [ ] `https://grayzonecheats.com/radar.html`
- [ ] `https://grayzonecheats.com/pricing.html`
- [ ] `https://grayzonecheats.com/faq.html`
- [ ] `https://grayzonecheats.com/blog.html`

Then request indexing for blog articles in batches.

### 4. Confirm crawlability

After verification, check **URL Inspection** on the homepage:

- [ ] **Page fetch:** Successful
- [ ] **Indexing allowed:** Yes
- [ ] **User-declared canonical:** `https://grayzonecheats.com/`
- [ ] **Google-selected canonical:** matches user-declared canonical

Repeat spot checks on `esp.html` and one blog article.

---

## Cloudflare / hosting checks

- [ ] **HTTPS** enforced on all pages (no mixed content warnings)
- [ ] **www → apex redirect** configured in Cloudflare dashboard: `www.grayzonecheats.com` → `https://grayzonecheats.com/` (301)
- [ ] **Legacy domain redirects** (if any) point to `https://grayzonecheats.com/`
- [ ] **DNS proxied** — `grayzonecheats.com` A/CNAME records show orange cloud (not DNS-only)
- [ ] **No geo-blocking WAF rules** — Security → WAF has no country/region block rules
- [ ] **Global edge delivery** — `curl -sI https://grayzonecheats.com/` returns `cf-ray` and `Content-Language: en`
- [ ] **Worldwide schema** — Organization `areaServed` and Offer `eligibleRegion` set to Worldwide (run `npm run build`)
- [ ] Deploy latest build: `npm run deploy`
- [ ] Live `robots.txt` returns:
  ```
  https://grayzonecheats.com/robots.txt
  ```
- [ ] Live sitemap returns valid XML:
  ```
  https://grayzonecheats.com/sitemap.xml
  ```

---

## Internal link crawl path

Google should discover all important pages via:

| Source | Links to |
|--------|----------|
| Main navigation | Features, ESP, Aimbot, Radar, FAQ, Pricing, Blog |
| Footer | All primary pages + Support + Updates + legal (noindex) |
| Homepage body | Features, ESP, Aimbot, Radar, Pricing, FAQ, Support, Updates |
| Blog hub (`blog.html`) | All 7 blog articles |
| Blog articles | Related posts + hub + product pages |
| BreadcrumbList schema | Parent pages on every inner page |

No orphan indexable pages — all 17 indexable URLs are linked from nav, footer, or hub pages.

---

## Post-submission monitoring (first 2 weeks)

### Coverage

- [ ] **Pages** → no unexpected **Excluded** or **Error** entries
- [ ] Confirm `terms.html` / `privacy.html` show as **Excluded by noindex** (expected)
- [ ] No **Duplicate without user-selected canonical** warnings
- [ ] No **Crawled – currently not indexed** on priority pages (if found, improve internal links and request indexing again)

### Enhancements

- [ ] **Breadcrumbs** detected on inner pages
- [ ] **FAQ** rich results eligible on homepage and FAQ page
- [ ] **Articles** detected on blog posts

### Performance

- [ ] **Core Web Vitals** — check mobile and desktop reports
- [ ] **Mobile Usability** — no errors
- [ ] Fix any **Page experience** issues flagged

### Manual checks

- [ ] Search `site:grayzonecheats.com` — confirm indexed pages appear
- [ ] Search branded terms: `gray zone warfare cheats`, `grayzonecheats`
- [ ] Spot-check SERP titles/descriptions match on-page meta tags

---

## Ongoing maintenance

| Task | Frequency |
|------|-----------|
| Run `npm run build` before every deploy | Each deploy |
| Update `lastmod` in `sitemap.xml` when pages change | Per content update |
| Add new blog URLs to `sitemap.xml` | Per new article |
| Re-request indexing after major content changes | As needed |
| Review GSC Coverage + Performance reports | Weekly (first month), then monthly |
| Check Updates page reflects current GZW build | After game patches |

---

## Quick verification commands

```bash
# Full SEO build + verification
npm run build

# Confirm robots.txt and sitemap are reachable (after deploy)
curl -sI https://grayzonecheats.com/robots.txt
curl -sI https://grayzonecheats.com/sitemap.xml

# Spot-check homepage robots directive
curl -s https://grayzonecheats.com/ | grep -i 'robots\|canonical'
```

---

## Sign-off

| Role | Name | Date | Ready? |
|------|------|------|--------|
| Technical SEO | | | ☐ |
| Content | | | ☐ |
| Deploy / Hosting | | | ☐ |

**Site status:** Ready for Google Search Console submission as of 2026-07-28.
