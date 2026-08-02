#!/usr/bin/env python3
"""Apply technical SEO fixes across static HTML pages (no UI changes)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE_DIRS = [ROOT, ROOT / "blog"]
THEME = "#0a0612"
ORG = {
    "@type": "Organization",
    "@id": "https://grayzonecheats.com/#organization",
    "name": "Gray Zone Warfare Cheats",
    "url": "https://grayzonecheats.com/",
    "logo": {
        "@type": "ImageObject",
        "url": "https://grayzonecheats.com/images/logo.png",
    },
}
WEBSITE = {
    "@type": "WebSite",
    "@id": "https://grayzonecheats.com/#website",
    "name": "Gray Zone Warfare Cheats",
    "url": "https://grayzonecheats.com/",
    "publisher": {"@id": "https://grayzonecheats.com/#organization"},
}

BLOG_BREADCRUMBS = {
    "features-guide.html": "Features Guide",
    "tips-and-tricks.html": "Tips and Tricks",
    "updates-guide.html": "Updates Guide",
    "esp-explained.html": "ESP Explained",
    "weapons-guide.html": "Weapons Guide",
}


def canonical_url(rel: str) -> str:
    if rel == "index.html":
        return "https://grayzonecheats.com/"
    return f"https://grayzonecheats.com/{rel.replace(chr(92), '/')}"


def inject_after_viewport(html: str, snippet: str) -> str:
    if snippet.strip() in html:
        return html
    return html.replace(
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + snippet,
        1,
    )


def ensure_head_basics(html: str, rel: str, noindex: bool) -> str:
    html = inject_after_viewport(html, f'  <meta name="theme-color" content="{THEME}">')
    if not noindex:
        if 'name="googlebot"' not in html:
            html = inject_after_viewport(
                html,
                '  <meta name="googlebot" content="index, follow, max-image-preview:large">',
            )
        if 'name="color-scheme"' not in html:
            html = inject_after_viewport(html, '  <meta name="color-scheme" content="dark">')
    if 'rel="apple-touch-icon"' not in html:
        html = html.replace(
            '<link rel="icon" href="/images/logo.png" type="image/png">',
            '<link rel="icon" href="/images/logo.png" type="image/png">\n  <link rel="apple-touch-icon" href="/images/logo.png">',
            1,
        )
    if 'fonts.googleapis.com' in html and 'preconnect" href="https://fonts.googleapis.com"' not in html:
        if '<link rel="stylesheet" href="/assets/css/styles.css">' in html:
            html = html.replace(
                '<link rel="stylesheet" href="/assets/css/styles.css">',
                '  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link rel="stylesheet" href="/assets/css/styles.css">',
                1,
            )
        elif 'fonts.googleapis.com/css2' in html:
            html = html.replace(
                '<link rel="stylesheet" href="https://fonts.googleapis.com/css2',
                '  <link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link rel="stylesheet" href="https://fonts.googleapis.com/css2',
                1,
            )
    # fix empty nav logo alt
    html = html.replace(
        'alt="" width="64" height="77" class="nav__logo"',
        'alt="Gray Zone Warfare Cheats logo" width="64" height="77" class="nav__logo"',
    )
    return html


def ensure_hreflang(html: str, rel: str, noindex: bool) -> str:
    if noindex:
        return html
    url = canonical_url(rel)
    block = (
        f'  <link rel="alternate" hreflang="en" href="{url}">\n'
        f'  <link rel="alternate" hreflang="x-default" href="{url}">'
    )
    if 'hreflang="x-default"' in html:
        return html
    if 'rel="canonical"' in html:
        return re.sub(
            r'(<link rel="canonical" href="[^"]+">)\n?',
            r"\1\n" + block + "\n",
            html,
            count=1,
        )
    return html


def og_image_from_html(html: str) -> str | None:
    m = re.search(r'property="og:image" content="([^"]+)"', html)
    return m.group(1) if m else None


def ensure_social_meta(html: str, rel: str, noindex: bool) -> str:
    if noindex:
        return html
    og = og_image_from_html(html)
    if not og:
        return html
    inserts = []
    if 'og:locale' not in html:
        inserts.append('  <meta property="og:locale" content="en_US">')
    if 'og:site_name' not in html:
        inserts.append('  <meta property="og:site_name" content="Gray Zone Warfare Cheats">')
    if 'og:image:alt' not in html:
        inserts.append('  <meta property="og:image:alt" content="Gray Zone Warfare Lamang Island screenshot">')
    if 'twitter:image' not in html:
        inserts.append(f'  <meta name="twitter:image" content="{og}">')
    if inserts and 'property="og:image"' in html:
        html = html.replace(
            re.search(r'<meta property="og:image" content="[^"]+">', html).group(0),
            re.search(r'<meta property="og:image" content="[^"]+">', html).group(0) + "\n" + "\n".join(inserts),
            1,
        )
    if 'twitter:card' not in html:
        title_m = re.search(r"<title>([^<]+)</title>", html)
        desc_m = re.search(r'<meta name="description" content="([^"]+)"', html)
        title = title_m.group(1) if title_m else "Gray Zone Warfare Cheats"
        desc = desc_m.group(1) if desc_m else ""
        tw = [
            '  <meta name="twitter:card" content="summary_large_image">',
            f'  <meta name="twitter:title" content="{title}">',
            f'  <meta name="twitter:description" content="{desc}">',
        ]
        if 'twitter:image' in html:
            html = html.replace(
                re.search(r'<meta name="twitter:image" content="[^"]+">', html).group(0),
                "\n".join(tw) + "\n" + re.search(r'<meta name="twitter:image" content="[^"]+">', html).group(0),
                1,
            )
        else:
            html = html.replace("</head>", "\n".join(tw) + "\n</head>", 1)
    return html


def legal_schema(rel: str, page_name: str) -> dict:
    url = canonical_url(rel)
    return {
        "@context": "https://schema.org",
        "@graph": [
            ORG,
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://grayzonecheats.com/"},
                    {"@type": "ListItem", "position": 2, "name": page_name, "item": url},
                ],
            },
            {
                "@type": "WebPage",
                "name": page_name,
                "url": url,
                "isPartOf": {"@id": "https://grayzonecheats.com/#website"},
            },
            WEBSITE,
        ],
    }


def augment_schema(html: str, rel: str, noindex: bool) -> str:
    m = re.search(
        r'<script type="application/ld\+json">\s*(\{.*?\})\s*</script>',
        html,
        re.DOTALL,
    )
    if not m:
        if rel == "terms.html":
            payload = json.dumps(legal_schema(rel, "Terms of Service"), separators=(",", ":"))
            return html.replace("</head>", f'  <script type="application/ld+json">{payload}</script>\n</head>', 1)
        if rel == "privacy.html":
            payload = json.dumps(legal_schema(rel, "Privacy Policy"), separators=(",", ":"))
            return html.replace("</head>", f'  <script type="application/ld+json">{payload}</script>\n</head>', 1)
        if noindex:
            return html
        graph = [ORG, WEBSITE]
        if rel.startswith("blog/"):
            name = BLOG_BREADCRUMBS.get(Path(rel).name, Path(rel).stem.replace("-", " ").title())
            graph.insert(
                0,
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://grayzonecheats.com/"},
                        {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://grayzonecheats.com/blog.html"},
                        {"@type": "ListItem", "position": 3, "name": name, "item": canonical_url(rel)},
                    ],
                },
            )
        payload = json.dumps({"@context": "https://schema.org", "@graph": graph}, separators=(",", ":"))
        return html.replace("</head>", f'  <script type="application/ld+json">{payload}</script>\n</head>', 1)

    data = json.loads(m.group(1))
    graph = data.get("@graph", [data])
    types = {node.get("@type") for node in graph if isinstance(node, dict)}

    if rel == "index.html":
        return html  # homepage schema is maintained manually

    if "Organization" not in types:
        graph.insert(0, ORG)
    if not noindex and rel != "blog.html" and "WebSite" not in types and "Blog" not in types:
        graph.insert(1 if graph and graph[0].get("@type") == "Organization" else 0, WEBSITE)

    if rel.startswith("blog/") and "BreadcrumbList" not in types:
        fname = Path(rel).name
        if fname in BLOG_BREADCRUMBS:
            name = BLOG_BREADCRUMBS[fname]
            graph.insert(
                0,
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://grayzonecheats.com/"},
                        {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://grayzonecheats.com/blog.html"},
                        {"@type": "ListItem", "position": 3, "name": name, "item": canonical_url(rel)},
                    ],
                },
            )

    if rel == "blog.html" and "WebSite" not in types:
        graph.append(WEBSITE)

    # link publisher on Article nodes
    for node in graph:
        if node.get("@type") == "Article" and "publisher" not in node:
            node["publisher"] = {"@id": "https://grayzonecheats.com/#organization"}

    new_json = json.dumps({"@context": "https://schema.org", "@graph": graph}, separators=(",", ":"))
    return html[: m.start(1)] + new_json + html[m.end(1) :]


def process_file(path: Path) -> None:
    rel = str(path.relative_to(ROOT)).replace("\\", "/")
    if rel == "index.html":
        rel_key = "index.html"
    else:
        rel_key = rel
    html = path.read_text()
    noindex = 'content="noindex' in html
    html = ensure_head_basics(html, rel_key, noindex)
    html = ensure_hreflang(html, rel_key, noindex)
    html = ensure_social_meta(html, rel_key, noindex)
    html = augment_schema(html, rel_key, noindex)
    path.write_text(html)


def main() -> None:
    for base in SITE_DIRS:
        for path in sorted(base.glob("*.html")):
            process_file(path)
            print(f"optimized: {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
