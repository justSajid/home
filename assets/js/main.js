/**
 * justSajid Static Site — Main JavaScript
 * Vanilla ES6+ — no jQuery dependency
 * Features:
 *   - Mobile navigation toggle
 *   - Sticky header on scroll
 *   - Smooth scroll for anchor links
 *   - Reading progress bar
 *   - Back-to-top button
 *   - Author box tabs
 *   - Post share links
 *   - Table of contents generation
 */

'use strict';

/* ============================================================
   UTILITIES
   ============================================================ */
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

/* ============================================================
   MOBILE NAVIGATION TOGGLE
   ============================================================ */
function initMobileNav() {
  const toggle = $('#toggle-menu');
  const nav    = $('#wi-mainnav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close nav on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });
}

/* ============================================================
   STICKY HEADER ON SCROLL
   ============================================================ */
function initStickyTopbar() {
  const topbar = $('#wi-topbar');
  if (!topbar) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    // Add .is-sticky class when scrolled past header
    if (currentScroll > 80) {
      topbar.classList.add('is-sticky');
    } else {
      topbar.classList.remove('is-sticky');
    }
    lastScroll = currentScroll;
  }, { passive: true });
}

/* ============================================================
   READING PROGRESS BAR
   ============================================================ */
function initReadingProgress() {
  // Only active on single post pages
  const article = $('.entry-content');
  if (!article) return;

  // Create progress bar element
  const bar = document.createElement('div');
  bar.id = 'reading-progress';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Reading progress');
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrollTop    = window.pageYOffset;
    const docHeight    = document.documentElement.scrollHeight;
    const winHeight    = window.innerHeight;
    const progress     = scrollTop / (docHeight - winHeight) * 100;
    bar.style.width    = Math.min(Math.max(progress, 0), 100) + '%';
    bar.setAttribute('aria-valuenow', String(Math.round(progress)));
  }, { passive: true });
}

/* ============================================================
   BACK TO TOP BUTTON
   ============================================================ */
function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  // Smooth scroll to top
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================================ */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update URL without reload
      history.pushState(null, '', `#${targetId}`);
    });
  });
}

/* ============================================================
   SOCIAL SHARE BUTTONS
   ============================================================ */
function initShareButtons() {
  $$('.share[data-href]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = btn.getAttribute('data-href');
      window.open(url, '_blank', 'width=600,height=400,noopener,noreferrer');
    });
  });
}

/* ============================================================
   AUTHOR BOX TABS
   ============================================================ */
function initAuthorTabs() {
  const navLinks = $$('.authorbox-nav a[data-href]');
  if (!navLinks.length) return;

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-href').replace('#', '');

      // Deactivate all tabs
      $$('.authorbox-nav li').forEach(li => li.classList.remove('active'));
      $$('.authorbox-tab').forEach(tab => tab.classList.remove('active'));

      // Activate clicked tab
      link.parentElement.classList.add('active');
      const target = document.getElementById(targetId);
      if (target) target.classList.add('active');
    });
  });
}

/* ============================================================
   TABLE OF CONTENTS AUTO-GENERATION
   ============================================================ */
function initTOC() {
  const article = $('.entry-content');
  const tocContainer = $('#toc');
  if (!article || !tocContainer) return;

  const headings = $$('h2, h3', article);
  if (headings.length < 3) {
    // Hide TOC if fewer than 3 headings
    const tocWrapper = tocContainer.closest('.toc');
    if (tocWrapper) tocWrapper.style.display = 'none';
    return;
  }

  const list = document.createElement('ol');
  headings.forEach((heading, i) => {
    // Add ID if missing
    if (!heading.id) {
      heading.id = 'toc-' + i + '-' + heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    const li = document.createElement('li');
    if (heading.tagName === 'H3') li.style.paddingLeft = '1rem';
    const a = document.createElement('a');
    a.href = '#' + heading.id;
    a.textContent = heading.textContent;
    li.appendChild(a);
    list.appendChild(li);
  });

  tocContainer.appendChild(list);
}

/* ============================================================
   IMAGE LAZY LOAD POLYFILL (for older browsers)
   ============================================================ */
function initLazyImages() {
  if ('loading' in HTMLImageElement.prototype) return; // native support

  // IntersectionObserver fallback
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });

    $$('img[loading="lazy"]').forEach((img) => {
      if (img.dataset.src) observer.observe(img);
    });
  }
}

/* ============================================================
   KEYBOARD NAVIGATION — mark body class when using keyboard
   ============================================================ */
function initKeyboardNav() {
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
  });
}

/* ============================================================
   INIT ALL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initStickyTopbar();
  initReadingProgress();
  initBackToTop();
  initSmoothScroll();
  initShareButtons();
  initAuthorTabs();
  initTOC();
  initLazyImages();
  initKeyboardNav();
});
