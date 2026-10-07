/* ABIN · Concept B "Jagung Rangup" · motion core
   Lenis + GSAP, a header that steps aside on the way down, yellow veil page transitions (with a 000 to 100 counter
   on the first visit), a ring cursor with labels, blur-up / unmask / line reveals, counters, parallax, the label
   zoom lens, fly-to-bag and the footer wordmark. Page scenes live in travel.js and scenes.js. */
(function () {
  'use strict';
  var A = window.ABIN, $ = A.$, $$ = A.$$;
  var html = document.documentElement;
  var reduce = A.env.reduce, fine = A.env.fine;
  var hasGSAP = !!window.gsap;
  var fx = A.fx = {};
  window.__abinFx = true;
  html.classList.remove('fx-failed');
  if (hasGSAP) { gsap.registerPlugin(ScrollTrigger); if (window.SplitText) gsap.registerPlugin(SplitText); }
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* -------------------------------------------------------------- lenis */
  if (!reduce && window.Lenis && hasGSAP) {
    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    A.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  var scrollToEl = fx.scrollTo = function (el, offset) {
    if (!el) return;
    if (A.lenis) A.lenis.scrollTo(el, { offset: offset == null ? -100 : offset, duration: 1.3 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  /* ------------------------------------------- header: hide down, show up */
  var lastY = window.scrollY;
  var onScroll = function () {
    var y = window.scrollY, d = y - lastY;
    html.classList.toggle('is-scrolled', y > 24);
    if (y < 140) { html.classList.remove('is-hidden-header'); lastY = y; return; }
    if (Math.abs(d) < 8) return;
    html.classList.toggle('is-hidden-header', d > 0);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  document.addEventListener('focusin', function (e) { if (e.target.closest && e.target.closest('.site-header')) html.classList.remove('is-hidden-header'); });

  /* --------------------------------------------------- veil transitions */
  var veil = $('.veil'), leaving = false;
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href) return;
    if (href.charAt(0) === '#') {
      if (href.length > 1) { var tgt = document.getElementById(href.slice(1)); if (tgt) { e.preventDefault(); scrollToEl(tgt); } }
      return;
    }
    if (/^(mailto|tel|javascript):/i.test(href)) return;
    var url = new URL(a.href, location.href);
    if (url.protocol !== location.protocol || (url.origin !== location.origin && location.protocol !== 'file:')) return;
    var samePage = url.pathname === location.pathname && url.search === location.search;
    if (samePage && url.hash) {
      var el = document.getElementById(url.hash.slice(1));
      if (el) { e.preventDefault(); scrollToEl(el); history.replaceState(null, '', url.hash); }
      return;
    }
    if (samePage && !url.hash) return;
    if (leaving) { e.preventDefault(); return; }
    if (!veil || reduce || !hasGSAP) return;
    e.preventDefault();
    leaving = true;
    try { sessionStorage.setItem('abin-b-veil', '1'); } catch (er) { /* ignore */ }
    html.classList.add('is-leaving');
    gsap.timeline({ onComplete: function () { location.href = a.href; } })
      .fromTo(veil, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power3.inOut' })
      .fromTo('.veil__logo', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 0.32);
  });
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted || !veil) return;
    leaving = false;
    html.classList.remove('is-leaving', 'is-veiled', 'is-first');
    if (hasGSAP) { gsap.set(veil, { clearProps: 'clipPath' }); gsap.set('.veil__logo, .veil__inner', { clearProps: 'all' }); }
  });

  /* ------------------------------------- arrival: lift the veil, or not */
  var fontsReady = new Promise(function (res) {
    var done = false, go = function () { if (!done) { done = true; res(); } };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
    setTimeout(go, 1800);
  });
  fx.fontsReady = fontsReady;
  fx.ready = new Promise(function (res) {
    var seen = function () { try { sessionStorage.setItem('abin-b-seen', '1'); sessionStorage.removeItem('abin-b-veil'); } catch (e) { /* ignore */ } };
    if (!html.classList.contains('is-veiled') || !veil || !hasGSAP || reduce) {
      html.classList.remove('is-veiled', 'is-first');
      seen();
      res();
      return;
    }
    var first = html.classList.contains('is-first');
    var lift = function () {
      seen();
      gsap.timeline({ onComplete: function () {
        html.classList.remove('is-veiled', 'is-first');
        gsap.set(veil, { clearProps: 'clipPath' });
        gsap.set('.veil__logo, .veil__inner', { clearProps: 'all' });
      } })
        .to('.veil__inner', { y: -36, opacity: 0, duration: 0.4, ease: 'power2.in' })
        .fromTo(veil, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9, ease: 'power3.inOut' }, 0.12);
      setTimeout(res, 420);
    };
    if (first) {
      var count = $('[data-veil-count]', veil), o = { v: 0 };
      gsap.timeline()
        .fromTo('.veil__logo', { opacity: 0, y: 24, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' })
        .fromTo('.veil__line i', { width: '0%' }, { width: '100%', duration: 1.5, ease: 'power2.inOut' }, 0.1)
        .to(o, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: function () { count.textContent = ('00' + Math.round(o.v)).slice(-3); } }, 0.1);
      Promise.all([fontsReady, wait(1750)]).then(lift);
    } else fontsReady.then(lift);
  });

  /* ------------------------------------------------------------- cursor */
  var cursor = $('.cursor');
  if (cursor && fine && hasGSAP && !reduce) {
    html.classList.add('has-cursor');
    var label = $('.cursor__label', cursor);
    var qx = gsap.quickTo(cursor, 'x', { duration: 0.2, ease: 'power3' }), qy = gsap.quickTo(cursor, 'y', { duration: 0.2, ease: 'power3' });
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      qx(e.clientX); qy(e.clientY);
      cursor.classList.add('is-on');
      cursor.classList.toggle('is-hidden', !!(e.target.closest && e.target.closest('[data-zoom]')));
      var t = e.target.closest ? e.target.closest('[data-cursor], a, button, summary, label, select, [role="tab"]') : null;
      var lab = t && t.getAttribute('data-cursor');
      if (lab && label.textContent !== lab) label.textContent = lab;
      cursor.classList.toggle('is-big', !!lab);
      cursor.classList.toggle('is-link', !!t && !lab);
    }, { passive: true });
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget) cursor.classList.remove('is-on'); });
    window.addEventListener('pointerdown', function () { cursor.classList.add('is-down'); });
    window.addEventListener('pointerup', function () { cursor.classList.remove('is-down'); });
  }

  /* ------------------------------------------------------------ helpers */
  fx.rise = fx.popIn = function (els) {
    els = Array.prototype.slice.call(els || []);
    if (!hasGSAP || reduce) { els.forEach(function (e) { e.style.opacity = 1; }); return; }
    gsap.fromTo(els, { opacity: 0, y: 28, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out', stagger: 0.06, clearProps: 'filter,transform' });
  };
  fx.flyToBag = function (src, img) {
    var bag = $$('.bag-pill').filter(function (b) { return b.offsetParent !== null; })[0];
    if (!bag || !hasGSAP || reduce || !src || !img) return;
    var hdr = $('.site-header'), shift = html.classList.contains('is-hidden-header') && hdr ? hdr.offsetHeight : 0;
    html.classList.remove('is-hidden-header');
    var a = src.getBoundingClientRect(), b = bag.getBoundingClientRect();
    var f = document.createElement('img');
    f.src = img;
    f.alt = '';
    f.style.cssText = 'position:fixed;left:0;top:0;z-index:140;height:100px;width:auto;pointer-events:none;filter:drop-shadow(0 14px 14px rgba(19,35,74,.3))';
    document.body.appendChild(f);
    var x0 = a.left + a.width / 2 - 35, y0 = a.top + a.height / 2 - 50, x1 = b.right - 30, y1 = b.top + shift + b.height / 2 - 50;
    gsap.set(f, { x: x0, y: y0, scale: 0.5, rotate: -6 });
    gsap.timeline({ onComplete: function () {
      f.remove();
      bag.classList.remove('is-bump');
      void bag.offsetWidth;
      bag.classList.add('is-bump');
    } })
      .to(f, { scale: 1, duration: 0.25, ease: 'power3.out' })
      .to(f, { x: x1, duration: 0.8, ease: 'power2.inOut' }, 0.1)
      .to(f, { y: Math.min(y0, y1) - 120, rotate: 10, duration: 0.4, ease: 'power2.out' }, 0.1)
      .to(f, { y: y1, rotate: 0, duration: 0.42, ease: 'power2.in' }, 0.5)
      .to(f, { scale: 0.15, opacity: 0, duration: 0.22 }, 0.8);
  };
  document.addEventListener('abin:add', function (e) { if (e.detail && e.detail.el) fx.flyToBag(e.detail.el, e.detail.img); });

  /* label zoom lens: [data-zoom] wraps an <img> and a .zoom-lens */
  fx.zoom = function (box) {
    if (!fine || !box || box.__zoom) return;
    box.__zoom = true;
    var lens = $('.zoom-lens', box), img = $('img', box);
    if (!lens || !img) return;
    var Z = Number(box.getAttribute('data-zoom')) || 2.4;
    box.addEventListener('pointerleave', function () { lens.classList.remove('is-on'); });
    box.addEventListener('pointermove', function (e) {
      var bx = box.getBoundingClientRect(), r = img.getBoundingClientRect(), L = lens.offsetWidth;
      var ix = e.clientX - r.left, iy = e.clientY - r.top;
      var inside = ix >= 0 && iy >= 0 && ix <= r.width && iy <= r.height;
      lens.classList.toggle('is-on', inside);
      if (!inside) return;
      lens.style.left = (e.clientX - bx.left - L / 2) + 'px';
      lens.style.top = (e.clientY - bx.top - L / 2) + 'px';
      lens.style.backgroundImage = 'url("' + (img.currentSrc || img.src) + '")';
      lens.style.backgroundSize = (r.width * Z) + 'px ' + (r.height * Z) + 'px';
      lens.style.backgroundPosition = (L / 2 - ix * Z) + 'px ' + (L / 2 - iy * Z) + 'px';
    });
  };
  $$('[data-zoom]').forEach(fx.zoom);

  /* ------------------------------------------------------------ reveals */
  if (!hasGSAP) { $$('[data-rise],[data-lines]').forEach(function (e) { e.style.opacity = 1; }); $$('[data-unmask]').forEach(function (e) { e.style.clipPath = 'none'; }); }
  fx.lines = function (h, opts) {
    if (!h || !hasGSAP) return null;
    if (reduce || !window.SplitText) { gsap.set(h, { opacity: 1 }); return null; }
    var s = new SplitText(h, { type: 'lines,words', linesClass: 'ln' });
    $$('.ln', h).forEach(function (l) { l.style.overflow = 'hidden'; l.style.paddingBottom = '.1em'; l.style.marginBottom = '-.1em'; });
    gsap.set(h, { opacity: 1 });
    return gsap.from(s.words, Object.assign({ yPercent: 118, duration: 1.1, ease: 'power4.out', stagger: 0.035 }, opts || {}));
  };
  var reveals = function () {
    if (!hasGSAP) return;
    var rises = $$('[data-rise]');
    if (reduce) { $$('[data-rise],[data-lines]').forEach(function (e) { e.style.opacity = 1; }); $$('[data-unmask]').forEach(function (e) { e.style.clipPath = 'none'; }); return; }
    if (rises.length) {
      gsap.set(rises, { opacity: 0, y: 34, filter: 'blur(8px)' });
      ScrollTrigger.batch(rises, {
        start: 'top 90%', once: true,
        onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out', stagger: 0.08, overwrite: true, clearProps: 'filter,transform' }); }
      });
    }
    $$('[data-unmask]').forEach(function (el) {
      var arch = el.getAttribute('data-unmask') === 'arch';
      var r = arch ? ' round 999px 999px 26px 26px' : ' round 26px';
      var st = { trigger: el, start: 'top 86%', once: true };
      gsap.fromTo(el, { clipPath: (arch ? 'inset(100% 0% 0% 0%' : 'inset(16% 12% 16% 12%') + r + ')' },
        { clipPath: 'inset(0% 0% 0% 0%' + r + ')', duration: 1.4, ease: 'power3.inOut', scrollTrigger: st });
      var media = $('img, video', el);
      if (media) gsap.fromTo(media, { scale: 1.22 }, { scale: 1, duration: 1.7, ease: 'power3.out', scrollTrigger: st });
    });
    $$('[data-lines]').forEach(function (h) {
      fx.lines(h, { scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
    });
  };
  var counters = function () {
    $$('[data-count]').forEach(function (el) {
      var n = Number(el.getAttribute('data-count')), dec = (String(n).split('.')[1] || '').length, o = { v: 0 };
      var fmt = function (v) { return dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-MY'); };
      if (!hasGSAP || reduce) { el.textContent = fmt(n); return; }
      el.textContent = fmt(0);
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () {
        gsap.to(o, { v: n, duration: 1.6, ease: 'power3.out', onUpdate: function () { el.textContent = fmt(o.v); } });
      } });
    });
  };
  var ambient = function () {
    if (!hasGSAP || reduce) return;
    $$('[data-par]').forEach(function (el) {
      gsap.to(el, { yPercent: Number(el.getAttribute('data-par')), ease: 'none', scrollTrigger: { trigger: el.closest('section') || el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  };

  /* --------------------------------------------- footer: the wordmark rises */
  var footer = function () {
    var mark = $('.footer__mark');
    if (!mark || !hasGSAP || reduce) return;
    var word = $('.footer__word', mark), pack = $('.footer__pack', mark);
    if (window.SplitText && word) {
      var s = new SplitText(word, { type: 'chars', charsClass: 'fch' });
      gsap.from(s.chars, { yPercent: 100, duration: 1, ease: 'power4.out', stagger: 0.045, scrollTrigger: { trigger: mark, start: 'top 92%', once: true } });
    }
    if (pack) gsap.fromTo(pack, { yPercent: 55 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: mark, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } });
  };

  /* ------------------------------------- page colour: [data-bg] sections */
  /* every section in <main> may name a canvas (sky, yellow, a flavour id, or "flavour" for the picked flavour);
     html[data-canvas] follows the section under the middle of the viewport and base.css maps it to the
     background, text ink and button colours */
  var bgOf = function (sec) { return (sec && sec.getAttribute('data-bg')) || 'sky'; };
  fx.setBg = fx.setCanvas = function (name) { if (html.getAttribute('data-canvas') !== name) html.setAttribute('data-canvas', name); };
  var pageBg = function () {
    var secs = $$('main > section');
    if (!secs.length) return;
    var at = function () {
      var mid = innerHeight * 0.5, cur = secs[0];
      secs.forEach(function (sec) { var r = sec.getBoundingClientRect(); if (r.top <= mid) cur = sec; });
      return cur;
    };
    fx.setBg(bgOf(at()));
    if (!hasGSAP) return;
    secs.forEach(function (sec) {
      ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: function (self) { if (self.isActive && !sec.hasAttribute('data-bg-own')) fx.setBg(bgOf(sec)); } });
    });
  };
  pageBg();
  Promise.all([fx.ready, new Promise(function (r) { window.addEventListener('load', r); })]).then(function () {
    setTimeout(function () { html.classList.remove('bg-instant'); }, 120);
  });

  /* ---------------------------------------------------------------- boot */
  fontsReady.then(function () { reveals(); footer(); if (hasGSAP) ScrollTrigger.refresh(); });
  counters();
  ambient();
  fx.ready.then(function () {
    html.dispatchEvent(new CustomEvent('abin:ready'));
    if (hasGSAP) ScrollTrigger.refresh();
  });
  window.addEventListener('load', function () {
    if (hasGSAP) ScrollTrigger.refresh();
    if (location.hash && !document.body.classList.contains('page-shop')) {
      var el = document.getElementById(location.hash.slice(1));
      if (el) setTimeout(function () { scrollToEl(el); }, 700);
    }
  });
}());
