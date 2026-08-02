#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const siteDirs = ['', 'blog'];
const htmlFiles = [];

for (const dir of siteDirs) {
  const base = dir ? join(root, dir) : root;
  for (const name of readdirSync(base)) {
    if (!name.endsWith('.html')) continue;
    htmlFiles.push(join(base, name));
  }
}

const errors = [];
const ORG_ID = 'https://grayzonecheats.com/#organization';
const SITE_ORIGIN = 'https://grayzonecheats.com';
const INTENTIONAL_NOINDEX = new Set(['terms.html', 'privacy.html']);

function isNoindex(html) {
  return /content="noindex/i.test(html);
}

function expectedCanonical(rel) {
  if (rel === 'index.html') return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}/${rel}`;
}

function toSitemapLoc(rel) {
  if (rel === 'index.html') return `${SITE_ORIGIN}/`;
  return `${SITE_ORIGIN}/${rel}`;
}

// --- Sitemap parity ---
const sitemapXml = readFileSync(join(root, 'sitemap.xml'), 'utf8');
const sitemapLocs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/\/$/, ''));

const indexableRels = htmlFiles
  .map((f) => relative(root, f).replace(/\\/g, '/'))
  .filter((rel) => {
    const html = readFileSync(join(root, rel), 'utf8');
    return !isNoindex(html);
  });

const indexableLocs = indexableRels.map((rel) => toSitemapLoc(rel).replace(/\/$/, ''));
const sitemapSet = new Set(sitemapLocs.map((u) => u.replace(/\/$/, '')));
const indexableSet = new Set(indexableLocs);

for (const rel of indexableRels) {
  const loc = toSitemapLoc(rel).replace(/\/$/, '');
  if (!sitemapSet.has(loc)) errors.push(`sitemap.xml: missing indexable page ${loc}`);
}

for (const loc of sitemapLocs) {
  const normalized = loc.replace(/\/$/, '');
  if (!indexableSet.has(normalized)) errors.push(`sitemap.xml: lists non-indexable or missing page ${loc}`);
}

for (const rel of INTENTIONAL_NOINDEX) {
  const loc = toSitemapLoc(rel).replace(/\/$/, '');
  if (sitemapSet.has(loc)) errors.push(`sitemap.xml: should not list noindex page ${rel}`);
}

// --- Per-page checks ---
for (const file of htmlFiles) {
  const rel = relative(root, file).replace(/\\/g, '/');
  const html = readFileSync(file, 'utf8');
  const noindex = isNoindex(html);

  if (noindex && !INTENTIONAL_NOINDEX.has(rel)) {
    errors.push(`${rel}: unexpected noindex (only terms.html and privacy.html should be noindex)`);
  }
  if (!noindex && INTENTIONAL_NOINDEX.has(rel)) {
    errors.push(`${rel}: listed as intentional noindex but missing noindex robots tag`);
  }

  if (!noindex && !html.includes('rel="canonical"')) errors.push(`${rel}: missing canonical`);
  if (!noindex && !html.includes('name="description"')) errors.push(`${rel}: missing description`);
  if (!html.includes('name="viewport"')) errors.push(`${rel}: missing viewport`);
  if (!noindex && !html.includes('og:image')) errors.push(`${rel}: missing og:image`);
  if (!noindex && !html.includes('twitter:card')) errors.push(`${rel}: missing twitter:card`);
  if (!noindex && !html.includes('hreflang')) errors.push(`${rel}: missing hreflang`);
  if (!html.includes('theme-color')) errors.push(`${rel}: missing theme-color`);
  if (!html.includes('application/ld+json')) errors.push(`${rel}: missing structured data`);
  if (!noindex && rel !== 'index.html' && !html.includes('BreadcrumbList')) errors.push(`${rel}: missing BreadcrumbList schema`);
  if (!html.includes('"@type": "Organization"') && !html.includes('"@type":"Organization"')) {
    errors.push(`${rel}: missing Organization schema`);
  }
  if (!noindex && rel !== 'index.html' && !html.includes('"@type": "WebSite"') && !html.includes('"@type":"WebSite"') && !html.includes('"@type": "Blog"') && !html.includes('"@type":"Blog"')) {
    errors.push(`${rel}: missing WebSite schema`);
  }
  if (rel === 'index.html' && !html.includes('FAQPage')) errors.push(`${rel}: missing FAQPage schema`);

  if (!noindex) {
    const canonMatch = html.match(/rel="canonical"\s+href="([^"]+)"/);
    if (canonMatch) {
      const canonical = canonMatch[1];
      const expected = expectedCanonical(rel);
      if (canonical !== expected) {
        errors.push(`${rel}: canonical mismatch (got ${canonical}, expected ${expected})`);
      }
    }
  }

  const imgs = [...html.matchAll(/<img\b[^>]*>/g)];
  for (const [tag] of imgs) {
    if (!/alt=/.test(tag)) errors.push(`${rel}: img missing alt`);
    if (/alt=""/.test(tag)) errors.push(`${rel}: img empty alt`);
    if (!/width=/.test(tag)) errors.push(`${rel}: img missing width`);
    if (!/height=/.test(tag)) errors.push(`${rel}: img missing height`);
    if (!/decoding=/.test(tag)) errors.push(`${rel}: img missing decoding`);
  }

  const internal = [...html.matchAll(/href="(\/[^"#?]+)"/g)].map((m) => m[1]);
  for (const href of internal) {
    if (href.startsWith('/images/') || href.startsWith('/assets/')) continue;
    const target = join(root, href.replace(/^\//, ''));
    try {
      if (!statSync(target).isFile()) errors.push(`${rel}: broken link ${href}`);
    } catch {
      errors.push(`${rel}: broken link ${href}`);
    }
  }
}

// --- robots.txt references sitemaps ---
const robotsTxt = readFileSync(join(root, 'robots.txt'), 'utf8');
if (!robotsTxt.includes('Sitemap: https://grayzonecheats.com/sitemap.xml')) {
  errors.push('robots.txt: missing sitemap.xml reference');
}
if (!robotsTxt.includes('Sitemap: https://grayzonecheats.com/sitemap-images.xml')) {
  errors.push('robots.txt: missing sitemap-images.xml reference');
}

if (errors.length) {
  console.error('SEO verification failed:\n' + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}

console.log(`SEO verification passed for ${htmlFiles.length} HTML files (${indexableRels.length} indexable, ${INTENTIONAL_NOINDEX.size} intentional noindex).`);
