# justSajid Static Site

A fully-functional, self-contained static HTML website converted from the original WordPress blog at **justsajid.azurewebsites.net**, authored by **Sajid Ali Khan**.

---

## Overview

| Item | Detail |
|------|--------|
| Original Site URL | http://justsajid.azurewebsites.net |
| Site Title | justSajid |
| Tagline | A Place For My Thoughts, Analytical Activities & Research |
| Total Posts Migrated | 141 |
| Total Pages | 1 (Contact) |
| Categories | 33 (with content) |
| Tags | 49 (with content) |
| Original Theme | Fox Magazine (justSajid-fx) by WiThemes |
| Backup Date | September 1, 2024 |

---

## Project Structure

```
justSajid-static/
├── index.html                  # Homepage (blog listing, page 1)
├── 404.html                    # Custom 404 page
├── search.html                 # Client-side search page
├── sitemap.xml                 # XML sitemap (178 URLs)
├── robots.txt                  # Robots directives
├── search-index.json           # Pre-built search index (141 posts)
│
├── blog/                       # Blog index
│   ├── index.html              # Page 1 of blog (same as homepage)
│   └── page/
│       ├── 2/index.html        # Paginated blog pages (2–15)
│       └── ...
│
├── posts/                      # Individual post pages (141 total)
│   └── [slug]/
│       └── index.html
│
├── pages/                      # Static pages
│   └── contact/
│       └── index.html
│
├── categories/                 # Category archive pages
│   └── [slug]/
│       └── index.html
│
├── tags/                       # Tag archive pages
│   └── [slug]/
│       └── index.html
│
└── assets/
    ├── css/
    │   ├── main.css            # Main stylesheet (CSS variables, components)
    │   └── responsive.css      # Responsive breakpoints
    ├── js/
    │   ├── main.js             # Core JS (nav, scroll, TOC, etc.)
    │   └── search.js           # Client-side search engine
    ├── images/
    │   ├── uploads/            # All WordPress media (organized by year/month)
    │   │   ├── 2016/
    │   │   ├── 2017/
    │   │   └── ...
    │   └── theme/              # Theme images (logo, placeholders)
    └── fonts/
        └── awesome/            # Font Awesome icon fonts
```

---

## WordPress Plugins & Static Equivalents

| Original Plugin | Function | Static Replacement |
|-----------------|----------|--------------------|
| All In One SEO Pack | SEO meta tags | Static `<meta>` tags on every page |
| Contact Form 7 | Contact form | LinkedIn link + static form (disabled) |
| Google Syntax Highlighter | Code blocks | CSS `pre/code` styling with dark theme |
| Master Slider | Featured slider | Static hero section with featured post |
| Google Site Kit / Sitemap Generator | Analytics & sitemap | `sitemap.xml` generated; add GA4 via `<script>` |
| Akismet | Spam filter | N/A (comments disabled) |
| WP Mail SMTP | Email delivery | N/A (static) |
| UpdraftPlus | Backup | N/A (static) |

---

## Features

### Design
- Faithful replication of Fox Magazine theme visual identity
- CSS custom properties (design tokens) for easy theming
- Dark mode support via `prefers-color-scheme`
- Fully responsive: mobile (320px+) → tablet → desktop → wide (1440px+)
- WCAG 2.1 AA compliant: skip links, focus states, ARIA labels, semantic HTML5

### JavaScript (Vanilla ES6+, no jQuery)
- Mobile hamburger navigation with keyboard support
- Sticky top navigation bar on scroll
- Reading progress bar on single posts
- Auto-generated Table of Contents for long posts
- Back-to-top button
- Smooth scroll for anchor links
- Client-side full-text search with live filtering and result highlighting

### Performance
- `loading="lazy"` on all images
- `defer` on all JavaScript
- System font stack fallback
- No render-blocking third-party scripts
- Google Fonts loaded asynchronously

---

## Deployment

### GitHub Pages

1. Push this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to **Deploy from branch → main → / (root)**
4. Your site will be live at `https://username.github.io/repository-name/`

For a custom domain:
```bash
echo "www.yourdomain.com" > CNAME
```

### Netlify

1. Drag and drop the `justSajid-static/` folder to [app.netlify.com](https://app.netlify.com)
2. Or connect your GitHub repo and set **Publish directory** to `justSajid-static`

For custom 404 and clean URLs, add `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/404.html"
  status = 404
```

### Vercel

```bash
npx vercel --prod justSajid-static/
```

Or via the Vercel dashboard: import GitHub repo and set root to `justSajid-static/`.

### Apache / Nginx Self-Hosting

For Apache, add to `.htaccess`:
```apache
ErrorDocument 404 /404.html
Options -Indexes
```

For Nginx:
```nginx
error_page 404 /404.html;
location / {
    try_files $uri $uri/ $uri/index.html =404;
}
```

---

## Re-enabling Dynamic Features

| Feature | Recommended Service |
|---------|---------------------|
| Comments | [Disqus](https://disqus.com/) or [Giscus](https://giscus.app/) (GitHub Discussions-based) |
| Contact Form | [Formspree](https://formspree.io/) or [Netlify Forms](https://www.netlify.com/products/forms/) |
| Search | Already implemented client-side via `search-index.json` |
| Analytics | Add Google Analytics 4 `<script>` to each page, or use [Plausible](https://plausible.io/) |
| Newsletter | [Mailchimp](https://mailchimp.com/) embed or [Buttondown](https://buttondown.email/) |

---

## Content Notes

- All 141 published blog posts have been fully migrated with original HTML content
- WordPress Gutenberg block comments (`<!-- wp:paragraph -->`) have been stripped
- Internal links to `justsajid.azurewebsites.net` have been converted to relative paths
- Upload images are referenced from `/assets/images/uploads/YYYY/MM/filename`
- Some posts reference external images (Facebook CDN, etc.) that may no longer be available
- Posts marked `[Internal]` in their title were published with `publish` status in WordPress and are included as-is

---

## Known Issues & Limitations

1. **Some internal post links** using `/?p=ID` format may not resolve — these would need a redirect map or JavaScript resolver
2. **Embedded Facebook/social images** from `fbcdn-sphotos-c-a.akamaihd.net` may be broken as these CDN URLs expire
3. **Contact form** is static-only — use Formspree or Netlify Forms to re-enable
4. **Comments** have been replaced with a placeholder — use Disqus or Giscus to restore
5. **Master Slider** featured slider has been replaced with a static hero section

---

## Credits

- Original WordPress Theme: Fox Magazine by WiThemes
- Blog Author: Sajid Ali Khan
- Static conversion: IBM Bob (AI-powered static site generator)
