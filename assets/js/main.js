/* ============================================================
   TIKUM INSOM — Main JS
   Author: InsomniaDev
   Fokus: performa, aksesibilitas, dan animasi ringan.
   ============================================================ */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------
     1. ENTRANCE ANIMATIONS — pakai IntersectionObserver
     ----------------------------------------------------------- */
  function initEntranceAnimations() {
    var targets = document.querySelectorAll('[data-anim]');
    if (!targets.length) return;

    // Kalau reduced motion, langsung tampil tanpa animasi
    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* -----------------------------------------------------------
     2. ACTIVE NAV STATE — sinkronkan berdasarkan path
     ----------------------------------------------------------- */
  function initActiveNav() {
    var path = window.location.pathname
      .replace(/\/+$/, '')
      .replace(/\.html$/, '')
      .split('/')
      .pop() || 'home';

    var selector = [
      '.desktop-nav .nav-pill',
      '.bottom-nav .bottom-nav-item'
    ].join(',');

    document.querySelectorAll(selector).forEach(function (el) {
      var href = (el.getAttribute('href') || '').replace(/\.html$/, '');
      if (href === path) {
        el.classList.add('is-active');
      } else {
        el.classList.remove('is-active');
      }
    });
  }

  /* -----------------------------------------------------------
     3. SMOOTH ANCHOR SCROLL (fallback untuk browser lama)
     ----------------------------------------------------------- */
  function initSmoothScroll() {
    if (reducedMotion) return;

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* -----------------------------------------------------------
     4. BUTTON TAP FEEDBACK (ripple halus, ringan)
     ----------------------------------------------------------- */
  function initButtonFeedback() {
    if (reducedMotion) return;

    var buttons = document.querySelectorAll('.btn');

    buttons.forEach(function (btn) {
      btn.addEventListener('pointerdown', function () {
        btn.style.transition = 'transform 90ms cubic-bezier(0.16,1,0.3,1)';
        btn.style.transform = 'scale(0.96)';
      });

      var reset = function () {
        btn.style.transform = '';
        btn.style.transition = '';
      };

      btn.addEventListener('pointerup', reset);
      btn.addEventListener('pointercancel', reset);
      btn.addEventListener('pointerleave', reset);
    });
  }

  /* -----------------------------------------------------------
     5. HEADER SCROLL SHADOW (opsional, super ringan)
     ----------------------------------------------------------- */
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var ticking = false;
    var lastY = window.scrollY;

    function update() {
      var y = window.scrollY;
      if (y > 8 && lastY <= 8) {
        header.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
      } else if (y <= 8 && lastY > 8) {
        header.style.boxShadow = 'none';
      }
      lastY = y;
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* -----------------------------------------------------------
     6. PARALLAX RINGAN UNTUK HERO TITLE (desktop only)
     ----------------------------------------------------------- */
  function initHeroParallax() {
    if (reducedMotion) return;
    if (window.matchMedia('(max-width: 900px)').matches) return;

    var title = document.querySelector('.hero-title');
    if (!title) return;

    var ticking = false;

    function update() {
      var y = window.scrollY;
      // transform ringan, hanya translateY
      title.style.transform = 'translate3d(0,' + (y * -0.06) + 'px,0)';
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* -----------------------------------------------------------
     7. PREFETCH — preload halaman saat user hover/tap
     ----------------------------------------------------------- */
  function initPrefetch() {
    if (!('link' in document.createElement('a'))) return;

    var prefetched = new Set();

    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http')) return;
      if (href.endsWith('.html') === false) return;

      var trigger = function () {
        if (prefetched.has(href)) return;
        prefetched.add(href);

        var linkEl = document.createElement('link');
        linkEl.rel = 'prefetch';
        linkEl.href = href;
        document.head.appendChild(linkEl);
      };

      link.addEventListener('pointerenter', trigger, { once: true });
      link.addEventListener('focus', trigger, { once: true });
    });
  }

  /* -----------------------------------------------------------
     8. INIT
     ----------------------------------------------------------- */
  function boot() {
    initActiveNav();
    initEntranceAnimations();
    initSmoothScroll();
    initButtonFeedback();
    initHeaderScroll();
    initHeroParallax();
    initPrefetch();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();