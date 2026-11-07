/* ============================================================
   TIKUM INSOM — Main JS
   Author: InsomniaDev
   Folder-based routing + page transition + logo support.
   ============================================================ */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------
     1. ENTRANCE ANIMATIONS
     ----------------------------------------------------------- */
  function initEntranceAnimations() {
    var targets = document.querySelectorAll('[data-anim]');
    if (!targets.length) return;

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
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* -----------------------------------------------------------
     2. ACTIVE NAV STATE — support folder dan .html
     ----------------------------------------------------------- */
  function initActiveNav() {
    var path = window.location.pathname
      .replace(/\/index\.html$/, '/')
      .replace(/\.html$/, '')
      .replace(/\/+$/, '');

    var segment = path.split('/').pop() || 'home';

    var selector = [
      '.desktop-nav .nav-pill',
      '.bottom-nav .bottom-nav-item'
    ].join(',');

    document.querySelectorAll(selector).forEach(function (el) {
      var href = (el.getAttribute('href') || '')
        .replace(/\.\.\//g, '')
        .replace(/\.html$/, '')
        .replace(/\/+$/, '')
        .split('/')
        .pop() || 'home';

      if (href === segment) {
        el.classList.add('is-active');
      } else {
        el.classList.remove('is-active');
      }
    });
  }

  /* -----------------------------------------------------------
     3. PAGE TRANSITION — fade out saat klik link internal,
        fade in otomatis via CSS animation saat halaman baru load
     ----------------------------------------------------------- */
  function initPageTransition() {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var link = e.target.closest('a[href]');
      if (!link) return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;

      var href = link.getAttribute('href');
      if (!href) return;
      if (
        href.charAt(0) === '#' ||
        href.indexOf('http') === 0 ||
        href.indexOf('mailto:') === 0 ||
        href.indexOf('tel:') === 0 ||
        href.indexOf('javascript:') === 0
      ) return;

      e.preventDefault();

      if (reducedMotion) {
        window.location.href = href;
        return;
      }

      document.documentElement.classList.add('leaving');

      setTimeout(function () {
        window.location.href = href;
      }, 180);
    });

    // Kalau user balik lewat tombol Back (bfcache), bersihkan state
    window.addEventListener('pageshow', function () {
      document.documentElement.classList.remove('leaving');
    });
  }

  /* -----------------------------------------------------------
     4. SMOOTH ANCHOR SCROLL
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
     5. BUTTON TAP FEEDBACK
     ----------------------------------------------------------- */
  function initButtonFeedback() {
    if (reducedMotion) return;
    document.querySelectorAll('.btn').forEach(function (btn) {
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
     6. HEADER SCROLL SHADOW
     ----------------------------------------------------------- */
  function initHeaderScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var ticking = false, lastY = window.scrollY;
    function update() {
      var y = window.scrollY;
      if (y > 8 && lastY <= 8) header.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
      else if (y <= 8 && lastY > 8) header.style.boxShadow = 'none';
      lastY = y; ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  /* -----------------------------------------------------------
     7. PARALLAX HERO (desktop only)
     ----------------------------------------------------------- */
  function initHeroParallax() {
    if (reducedMotion) return;
    if (window.matchMedia('(max-width: 900px)').matches) return;
    var title = document.querySelector('.hero-title');
    if (!title) return;
    var ticking = false;
    function update() {
      title.style.transform = 'translate3d(0,' + (window.scrollY * -0.06) + 'px,0)';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  /* -----------------------------------------------------------
     8. PREFETCH — biar pindah halaman makin instan
     ----------------------------------------------------------- */
  function initPrefetch() {
    var prefetched = new Set();
    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      if (href.charAt(0) === '#' || href.indexOf('http') === 0) return;
      if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
      if (href.charAt(href.length - 1) !== '/' && href.indexOf('.html') === -1) return;

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
     9. INIT
     ----------------------------------------------------------- */
  function boot() {
    initActiveNav();
    initEntranceAnimations();
    initPageTransition();
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