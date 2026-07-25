/**
 * justSajid Static Site — Client-Side Search
 * Loads search-index.json and performs full-text filtering.
 * No dependencies — vanilla ES6+.
 *
 * Uses fully relative URLs so the site works from any path
 * (file://, localhost subdirectory, or custom domain root).
 */

'use strict';

/* ============================================================
   BASE PATH HELPER
   Resolves a root-relative path to a path relative to the
   current page, so links work whether the site is served from
   / or /justSajid-static/ or opened via file://.
   ============================================================ */
function siteBase() {
  /* search.html always lives at the site root, so its directory
     IS the site root.  We just need the directory of this page. */
  const loc  = window.location.pathname;
  /* Strip trailing filename (search.html) if present */
  const dir  = loc.endsWith('/') ? loc : loc.slice(0, loc.lastIndexOf('/') + 1);
  return dir;   /* e.g. "/justSajid-static/" or "/" */
}

function siteUrl(rootRelativePath) {
  /* rootRelativePath should start without a leading slash, e.g. "posts/foo/" */
  return siteBase() + rootRelativePath;
}

/* ============================================================
   SEARCH ENGINE
   ============================================================ */
class StaticSearch {
  constructor() {
    /* Resolve index URL relative to this page's directory */
    this.indexUrl = siteUrl('search-index.json');
    this.index    = [];
    this.loaded   = false;
  }

  async load() {
    if (this.loaded) return;
    try {
      const res  = await fetch(this.indexUrl);
      this.index = await res.json();
      this.loaded = true;
    } catch (err) {
      console.warn('Search index could not be loaded:', err);
    }
  }

  /**
   * Search the index for a query string.
   * Searches title, content, categories and tags fields.
   * Returns array of matching post objects, ranked by relevance.
   */
  search(query) {
    if (!query || query.trim().length < 2) return [];
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

    const scored = this.index.map((post) => {
      const titleLower   = (post.title   || '').toLowerCase();
      const contentLower = (post.content || '').toLowerCase();
      const catsLower    = (post.categories || []).map(c => c.name.toLowerCase()).join(' ');
      const tagsLower    = (post.tags || []).map(t => t.name.toLowerCase()).join(' ');

      let score = 0;
      for (const term of terms) {
        /* Title match = highest weight */
        const titleCount = (titleLower.match(new RegExp(escapeRegex(term), 'g')) || []).length;
        score += titleCount * 10;
        /* Category/tag match */
        if (catsLower.includes(term) || tagsLower.includes(term)) score += 5;
        /* Content match (capped) */
        const contentCount = (contentLower.match(new RegExp(escapeRegex(term), 'g')) || []).length;
        score += Math.min(contentCount, 20);
      }
      return { post, score };
    });

    return scored
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ post }) => post);
  }

  /**
   * Highlight search terms in a text string.
   */
  static highlight(text, query) {
    const terms = query.trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return escapeHtml(text);
    const pattern = terms.map(escapeRegex).join('|');
    const re = new RegExp(`(${pattern})`, 'gi');
    return escapeHtml(text).replace(re, '<mark>$1</mark>');
  }
}

/* ============================================================
   UTILITIES
   ============================================================ */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return dateStr; }
}

function truncate(text, maxLen = 200) {
  if (!text) return '';
  const plain = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + '…' : plain;
}

/* ============================================================
   SEARCH PAGE INITIALISER
   ============================================================ */
async function initSearchPage() {
  const searchInput  = document.getElementById('search-input');
  const resultsEl    = document.getElementById('search-results');
  const statusEl     = document.getElementById('search-status');
  if (!searchInput || !resultsEl) return;

  const engine = new StaticSearch();

  /* Get query from URL ?q=... */
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  if (initialQuery) {
    searchInput.value = initialQuery;
    await engine.load();
    displayResults(initialQuery, engine);
  }

  /* Live search on input */
  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const q = searchInput.value.trim();
    if (q.length < 2) {
      resultsEl.innerHTML = '';
      if (statusEl) statusEl.textContent = 'Type at least 2 characters to search.';
      return;
    }
    if (statusEl) statusEl.textContent = 'Searching…';
    debounceTimer = setTimeout(async () => {
      if (!engine.loaded) await engine.load();
      displayResults(q, engine);
    }, 300);
  });

  /* Search form submission (update URL) */
  const form = document.getElementById('search-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = searchInput.value.trim();
      if (!q) return;
      const url = new URL(window.location);
      url.searchParams.set('q', q);
      history.pushState({}, '', url);
      if (!engine.loaded) engine.load().then(() => displayResults(q, engine));
      else displayResults(q, engine);
    });
  }

  function displayResults(query, engine) {
    const results = engine.search(query);

    if (!results.length) {
      resultsEl.innerHTML = '';
      if (statusEl) statusEl.innerHTML = `No results found for <strong>"${escapeHtml(query)}"</strong>. Try different keywords.`;
      return;
    }

    if (statusEl) statusEl.innerHTML = `Found <strong>${results.length}</strong> result${results.length === 1 ? '' : 's'} for <strong>"${escapeHtml(query)}"</strong>`;

    resultsEl.innerHTML = results.map((post) => {
      const excerpt = truncate(post.content, 220);

      /* Build fully relative links from the site root directory */
      const postHref = siteUrl('posts/' + post.slug + '/');
      const cats = (post.categories || []).map(c =>
        `<a href="${siteUrl('categories/' + c.slug + '/')}" class="cat-link">${escapeHtml(c.name)}</a>`
      ).join(' ');

      const hilTitle   = StaticSearch.highlight(post.title, query);
      const hilExcerpt = StaticSearch.highlight(excerpt, query);

      return `<li class="search-result-item">
        <h3><a href="${postHref}">${hilTitle}</a></h3>
        <div class="search-result-meta">
          <time datetime="${escapeHtml(post.date)}">${formatDate(post.date)}</time>
          ${cats ? ' &bull; ' + cats : ''}
        </div>
        <p class="search-result-excerpt">${hilExcerpt}</p>
      </li>`;
    }).join('');
  }
}

/* ============================================================
   HEADER SEARCH REDIRECT
   ============================================================ */
function initHeaderSearch() {
  /* Forms already use relative action="search.html" — nothing extra needed */
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  /* Only run full search page logic if we are on search.html */
  if (document.getElementById('search-input')) {
    initSearchPage();
  }
  initHeaderSearch();
});
