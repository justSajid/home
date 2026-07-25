/**
 * justSajid — newspaper.js
 * Modern editorial interactive features
 * Vanilla ES6+ · No jQuery · Deferred
 * =========================================
 * Features:
 *  1.  Dark mode toggle (localStorage persistent)
 *  2.  Hamburger slide-in menu with overlay
 *  3.  Reading progress bar
 *  4.  Reading time calculator
 *  5.  Table of contents auto-generation
 *  6.  Copy-link share button with toast
 *  7.  Back-to-top button
 *  8.  Cookie/GDPR banner (localStorage persistent)
 *  9.  Smooth scroll for anchor links
 * 10.  Sticky topbar shadow on scroll
 * 11.  Keyboard navigation class
 * 12.  Social share (window.open popups)
 * 13.  Author box tab switching
 * 14.  Image lazy-load polyfill
 */

'use strict';

/* ─── Micro-utilities ─────────────────────────────────── */
const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ─── 1. DARK MODE TOGGLE ─────────────────────────────── */
function initDarkMode () {
  const root      = document.documentElement;
  const STORAGE_KEY = 'jsTheme';
  const DARK_CLS  = 'dark-mode';
  const LIGHT_CLS = 'light-mode';

  /* Apply saved preference before paint to avoid flash */
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark')  { root.classList.add(DARK_CLS);  root.classList.remove(LIGHT_CLS); }
  if (saved === 'light') { root.classList.add(LIGHT_CLS); root.classList.remove(DARK_CLS);  }

  function isDark () {
    if (saved === 'dark')  return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /* Update every toggle button's icon & aria */
  function updateButtons () {
    $$('.dark-mode-toggle').forEach(btn => {
      const dark = isDark();
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.textContent = dark ? '☀' : '◑';
    });
  }

  /* Inject toggle buttons (placed in .topbar-right by HTML injector) */
  $$('.dark-mode-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const nowDark = root.classList.contains(DARK_CLS) ||
        (!root.classList.contains(LIGHT_CLS) && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (nowDark) {
        root.classList.remove(DARK_CLS);
        root.classList.add(LIGHT_CLS);
        localStorage.setItem(STORAGE_KEY, 'light');
      } else {
        root.classList.remove(LIGHT_CLS);
        root.classList.add(DARK_CLS);
        localStorage.setItem(STORAGE_KEY, 'dark');
      }
      updateButtons();
    });
  });

  /* Respond to OS preference changes */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!localStorage.getItem(STORAGE_KEY)) updateButtons();
  });

  updateButtons();
}

/* Apply saved theme immediately (before DOMContentLoaded) to prevent FOUC */
(function applyThemeEarly () {
  const saved = localStorage.getItem('jsTheme');
  if (saved === 'dark')  document.documentElement.classList.add('dark-mode');
  if (saved === 'light') document.documentElement.classList.add('light-mode');
})();

/* ─── 2. HAMBURGER SLIDE-IN MENU ─────────────────────── */
function initHamburger () {
  const toggle  = $('#toggle-menu');
  const nav     = $('#wi-mainnav');
  if (!toggle || !nav) return;

  /* Create overlay if it doesn't exist */
  let overlay = $('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
  }

  function openNav () {
    document.body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    nav.removeAttribute('aria-hidden');
    /* Focus first link for keyboard users */
    const firstLink = $('a', nav);
    if (firstLink) setTimeout(() => firstLink.focus(), 350);
  }

  function closeNav () {
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    nav.setAttribute('aria-hidden', 'true');
  }

  toggle.addEventListener('click', () => {
    const isOpen = document.body.classList.contains('nav-open');
    isOpen ? closeNav() : openNav();
  });

  overlay.addEventListener('click', closeNav);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      closeNav();
      toggle.focus();
    }
  });

  /* Close when a nav link is clicked (for same-page navigation) */
  $$('a', nav).forEach(link => {
    link.addEventListener('click', () => closeNav());
  });
}

/* ─── 3. READING PROGRESS BAR ───────────────────────── */
function initReadingProgress () {
  if (!$('.entry-content')) return; /* single posts only */

  /* Create bar if not already in DOM */
  let bar = $('#reading-progress');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'reading-progress';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-label', 'Reading progress');
    document.body.prepend(bar);
  }

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docH      = document.documentElement.scrollHeight;
    const winH      = window.innerHeight;
    const pct       = (scrollTop / (docH - winH)) * 100;
    bar.style.width = Math.min(Math.max(pct, 0), 100) + '%';
    bar.setAttribute('aria-valuenow', String(Math.round(pct)));
  }, { passive: true });
}

/* ─── 4. READING TIME CALCULATOR ────────────────────── */
function initReadingTime () {
  const article = $('.entry-content');
  if (!article) return;

  const text    = article.textContent || '';
  const words   = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  const label   = `${minutes} min read`;

  /* Inject into every .meta-reading span */
  $$('.meta-reading').forEach(el => {
    /* Only update if empty or has placeholder */
    if (!el.textContent.trim() || el.textContent.includes('min read')) {
      el.textContent = label;
    }
  });
}

/* ─── 5. TABLE OF CONTENTS ───────────────────────────── */
function initTOC () {
  const article     = $('.entry-content');
  const tocWrapper  = $('#toc-box');
  const tocList     = $('#toc');
  if (!article || !tocWrapper || !tocList) return;

  const headings = $$('h2, h3', article);
  if (headings.length < 3) return; /* not worth a TOC */

  tocWrapper.style.display = 'block';
  const ol = document.createElement('ol');

  headings.forEach((h, i) => {
    /* Add stable anchor ID */
    if (!h.id) {
      h.id = 'section-' + (i + 1) + '-' +
        h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
    }
    const li = document.createElement('li');
    if (h.tagName === 'H3') li.style.paddingLeft = '1.1rem';
    const a = document.createElement('a');
    a.href        = '#' + h.id;
    a.textContent = h.textContent.trim();
    li.appendChild(a);
    ol.appendChild(li);
  });

  tocList.appendChild(ol);
}

/* ─── 6. COPY-LINK SHARE ─────────────────────────────── */
function initCopyLink () {
  $$('.li-copy a, a[data-copy-link]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.preventDefault();
      const url = btn.dataset.url || window.location.href;
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        /* Fallback for older browsers */
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      /* Show "Copied!" feedback */
      const original = btn.innerHTML;
      btn.classList.add('copied');
      btn.innerHTML = btn.innerHTML.replace(btn.textContent, 'Copied!');
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = original;
      }, 2200);
    });
  });
}

/* ─── 7. BACK-TO-TOP ─────────────────────────────────── */
function initBackToTop () {
  const btn = $('#back-to-top');
  if (!btn) return;
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ─── 8. COOKIE BANNER ───────────────────────────────── */
function initCookieBanner () {
  const banner = $('#cookie-banner');
  if (!banner) return;
  if (localStorage.getItem('cookieAccepted') === '1') {
    banner.classList.add('hidden');
    return;
  }
  /* Delay to avoid layout shift */
  setTimeout(() => banner.classList.add('visible'), 800);

  const acceptBtn = $('.cookie-accept', banner);
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      banner.classList.remove('visible');
      setTimeout(() => banner.classList.add('hidden'), 450);
      localStorage.setItem('cookieAccepted', '1');
    });
  }
}

/* ─── 9. SMOOTH SCROLL ───────────────────────────────── */
function initSmoothScroll () {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', '#' + id);
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}

/* ─── 10. STICKY TOPBAR SHADOW ───────────────────────── */
function initStickyTopbar () {
  const topbar = $('#wi-topbar');
  if (!topbar) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 10) {
          topbar.style.boxShadow = '0 2px 12px rgba(0,0,0,.25)';
        } else {
          topbar.style.boxShadow = '';
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ─── 11. KEYBOARD NAVIGATION ────────────────────────── */
function initKeyboardNav () {
  document.addEventListener('mousedown', () => document.body.classList.remove('keyboard-nav'));
  document.addEventListener('keydown', e => {
    if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
  });
}

/* ─── 12. SHARE BUTTONS (POPUP) ──────────────────────── */
function initShareButtons () {
  $$('.post-share a[href]').forEach(btn => {
    const href = btn.getAttribute('href');
    if (!href || href === '#' || href.startsWith('javascript')) return;
    /* Skip WhatsApp (opens in native app, no popup needed) */
    if (href.startsWith('https://wa.me')) return;
    btn.addEventListener('click', e => {
      e.preventDefault();
      window.open(href, '_blank', 'width=620,height=440,noopener,noreferrer');
    });
  });
}

/* ─── 13. AUTHOR BOX TABS ────────────────────────────── */
function initAuthorTabs () {
  $$('.authorbox-nav a[data-href]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId = link.dataset.href.replace('#', '');
      const box = link.closest('#authorbox');
      if (!box) return;
      $$('.authorbox-nav li', box).forEach(li => li.classList.remove('active'));
      $$('.authorbox-tab', box).forEach(tab => tab.classList.remove('active'));
      link.parentElement.classList.add('active');
      const target = document.getElementById(targetId);
      if (target) target.classList.add('active');
    });
  });
}

/* ─── 14. LAZY-LOAD POLYFILL ─────────────────────────── */
function initLazyImages () {
  if ('loading' in HTMLImageElement.prototype) return;
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
        obs.unobserve(img);
      }
    });
  });
  $$('img[loading="lazy"][data-src]').forEach(img => obs.observe(img));
}

/* ─── INIT ALL ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initHamburger();
  initReadingProgress();
  initReadingTime();
  initTOC();
  initCopyLink();
  initBackToTop();
  initCookieBanner();
  initSmoothScroll();
  initStickyTopbar();
  initKeyboardNav();
  initShareButtons();
  initAuthorTabs();
  initLazyImages();
});
