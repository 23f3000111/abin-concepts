/* ABIN · Concept A "Kali Nak Lagi!" · motion core
   Lenis + GSAP, the first-visit popcorn loader, circle-wipe page transitions from the click point,
   reveals, counters, marquees that lean with scroll speed, idle floats, parallax, pointer tilt,
   fly-to-bag, synthesized crunch / pop sounds (with a remembered mute), and Kali the mascot. */
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

  /* -------------------------------------------------------------- sound */
  var sound = A.sound = { on: true, gestured: false, ctx: null };
  try { sound.on = localStorage.getItem('abin-a-sound') !== 'off'; } catch (e) { /* default on */ }
  var syncSound = function () { $$('.nav__sound').forEach(function (b) { b.setAttribute('aria-pressed', String(sound.on)); }); };
  syncSound();
  var mark = function () { sound.gestured = true; };
  window.addEventListener('pointerdown', mark, { once: true, capture: true });
  window.addEventListener('keydown', mark, { once: true, capture: true });
  sound.audio = function () {
    if (!sound.on || !sound.gestured) return null;
    try {
      if (!sound.ctx) sound.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (sound.ctx.state === 'suspended') sound.ctx.resume();
      return sound.ctx;
    } catch (e) { return null; }
  };
  /* a crunch = three quick filtered-noise cracks */
  fx.crunch = function (gain) {
    var ac = sound.audio();
    if (!ac) return;
    var g0 = gain || 1;
    [0, 0.035 + Math.random() * 0.03, 0.09 + Math.random() * 0.03].forEach(function (t0, i) {
      var len = 0.06 + Math.random() * 0.05, n = Math.floor(ac.sampleRate * len);
      var buf = ac.createBuffer(1, n, ac.sampleRate), ch = buf.getChannelData(0);
      for (var j = 0; j < n; j++) ch[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / n, 2.6);
      var src = ac.createBufferSource(), hp = ac.createBiquadFilter(), bp = ac.createBiquadFilter(), g = ac.createGain();
      src.buffer = buf;
      hp.type = 'highpass'; hp.frequency.value = 700;
      bp.type = 'bandpass'; bp.frequency.value = 1400 + Math.random() * 2400; bp.Q.value = 0.9;
      g.gain.value = 0.6 * g0 * (i ? 0.55 : 1);
      src.connect(hp); hp.connect(bp); bp.connect(g); g.connect(ac.destination);
      src.start(ac.currentTime + t0);
    });
  };
  /* a pop = short rising triangle blip (adding to the bag, buttons) */
  fx.pop = function (pitch) {
    var ac = sound.audio();
    if (!ac) return;
    var t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(), p = pitch || 1;
    o.type = 'triangle';
    o.frequency.setValueAtTime(330 * p, t);
    o.frequency.exponentialRampToValueAtTime(900 * p, t + 0.08);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g); g.connect(ac.destination);
    o.start(t); o.stop(t + 0.22);
  };
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.nav__sound');
    if (!b) return;
    sound.on = !sound.on;
    syncSound();
    try { localStorage.setItem('abin-a-sound', sound.on ? 'on' : 'off'); } catch (er) { /* ignore */ }
    if (sound.on) fx.crunch(0.8);
    A.ui.toast(sound.on ? 'Crunch sounds on' : 'Crunch sounds off');
  });

  /* -------------------------------------------------------------- lenis */
  if (!reduce && window.Lenis && hasGSAP) {
    var lenis = new Lenis({ lerp: 0.12, smoothWheel: true, wheelMultiplier: 1 });
    A.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  var scrollToEl = fx.scrollTo = function (el, offset) {
    if (!el) return;
    if (A.lenis) A.lenis.scrollTo(el, { offset: offset == null ? -110 : offset, duration: 1.2 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };
  var setHeaderH = function () { var h = $('.site-header'); if (h) html.style.setProperty('--header-h', h.offsetHeight + 'px'); };
  setHeaderH();
  window.addEventListener('resize', setHeaderH);
  var onScroll = function () { html.classList.toggle('is-scrolled', window.scrollY > 40); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --------------------------------------------------- page transitions */
  var wipe = $('.wipe'), leaving = false;
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
    if (/^(mailto|tel|javascript|https?):/i.test(href) && new URL(a.href, location.href).origin !== location.origin) return;
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
    if (!wipe || reduce || !hasGSAP) return;
    e.preventDefault();
    leaving = true;
    try { sessionStorage.setItem('abin-a-wipe', '1'); } catch (er) { /* ignore */ }
    fx.pop(0.75);
    var x = e.clientX || innerWidth / 2, y = e.clientY || innerHeight / 2;
    html.classList.add('is-leaving');
    gsap.fromTo(wipe, { clipPath: 'circle(0% at ' + x + 'px ' + y + 'px)' },
      { clipPath: 'circle(150% at ' + x + 'px ' + y + 'px)', duration: 0.7, ease: 'power3.inOut', onComplete: function () { location.href = a.href; } });
    gsap.fromTo($('img', wipe), { scale: 0.3, rotate: -20, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'back.out(2.2)' });
  });
  window.addEventListener('pageshow', function (e) {
    if (e.persisted && wipe) {
      leaving = false;
      html.classList.remove('is-leaving', 'is-arriving');
      if (hasGSAP) gsap.set(wipe, { clipPath: 'circle(0% at 50% 50%)' });
    }
  });

  /* --------------------------------------------- intro: loader or wipe-in */
  var fontsReady = new Promise(function (res) {
    var done = false, go = function () { if (!done) { done = true; res(); } };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
    setTimeout(go, 1800);
  });
  fx.ready = new Promise(function (res) {
    var loader = $('.loader');
    var finish = function () {
      try { sessionStorage.setItem('abin-a-seen', '1'); sessionStorage.removeItem('abin-a-wipe'); } catch (e) { /* ignore */ }
      res();
    };
    if (html.classList.contains('is-loading') && loader && hasGSAP && !reduce) {
      var box = $('.loader__kernels', loader), imgs = ['kernel-1', 'kernel-2', 'kernel-3'];
      for (var i = 0; i < 18; i++) {
        var k = document.createElement('img');
        k.src = 'assets/img/kernels/' + imgs[i % 3] + '.webp';
        k.alt = '';
        k.style.left = (4 + Math.random() * 92) + '%';
        k.style.width = (34 + Math.random() * 34) + 'px';
        box.appendChild(k);
        var up = innerHeight * (0.45 + Math.random() * 0.5);
        gsap.timeline({ repeat: -1, delay: Math.random() * 1.4 })
          .to(k, { y: -up, rotate: gsap.utils.random(-260, 260), duration: 0.55 + Math.random() * 0.3, ease: 'power2.out' })
          .to(k, { y: 0, rotate: '+=' + gsap.utils.random(-120, 120), duration: 0.55 + Math.random() * 0.3, ease: 'power2.in' });
      }
      var tl = gsap.timeline();
      tl.from('.loader__logo', { scale: 0.3, rotate: -12, opacity: 0, duration: 1.1, ease: 'elastic.out(1, .5)' })
        .from('.loader__note', { y: 16, opacity: 0, duration: 0.5, ease: 'back.out(2)' }, 0.3)
        .to('.loader__bar i', { width: '72%', duration: 1, ease: 'power2.out' }, 0.2);
      Promise.all([fontsReady, new Promise(function (r) { setTimeout(r, 1400); })]).then(function () {
        gsap.timeline({ onComplete: function () { loader.remove(); } })
          .to('.loader__bar i', { width: '100%', duration: 0.3, ease: 'power2.in' })
          .to('.loader__logo', { scale: 1.15, duration: 0.22, ease: 'power2.in' })
          .add(function () { html.classList.remove('is-loading'); finish(); })
          .to(loader, { clipPath: 'circle(0% at 50% 50%)', duration: 0.75, ease: 'power3.inOut' }, '+=.02');
      });
    } else {
      if (loader) loader.remove();
      html.classList.remove('is-loading');
      if (html.classList.contains('is-arriving') && wipe && hasGSAP && !reduce) {
        fontsReady.then(function () {
          gsap.fromTo(wipe, { clipPath: 'circle(150% at 50% 50%)' }, {
            clipPath: 'circle(0% at 50% 50%)', duration: 0.75, ease: 'power3.inOut',
            onComplete: function () { html.classList.remove('is-arriving'); }
          });
          setTimeout(finish, 260);
        });
      } else { html.classList.remove('is-arriving'); finish(); }
    }
  });

  /* ------------------------------------------------------------ helpers */
  fx.popIn = function (els) {
    els = Array.prototype.slice.call(els || []);
    if (!hasGSAP || reduce) { els.forEach(function (e) { e.style.opacity = 1; }); return; }
    gsap.fromTo(els, { opacity: 0, y: 26, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.7)', stagger: 0.05, clearProps: 'transform' });
  };
  fx.burst = function (el, colors) {
    if (!hasGSAP || reduce || !el) return;
    var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    colors = colors || ['#FFD21E', '#FF7A1A', '#E8402A', '#4FA62E', '#2F6FE4'];
    for (var i = 0; i < 18; i++) {
      var d = document.createElement('i'), s = 8 + Math.random() * 14;
      d.className = 'confetti';
      d.style.cssText = 'position:fixed;left:0;top:0;z-index:130;pointer-events:none;width:' + s + 'px;height:' + (s * (0.6 + Math.random() * 0.8)) + 'px;border-radius:' + (Math.random() < 0.5 ? '50%' : '3px') + ';background:' + colors[i % colors.length] + ';border:2px solid #2A1609';
      document.body.appendChild(d);
      var a = Math.random() * Math.PI * 2, dist = 70 + Math.random() * 150;
      gsap.fromTo(d, { x: cx - s / 2, y: cy - s / 2, scale: 0.3, rotate: 0 }, {
        x: cx - s / 2 + Math.cos(a) * dist, y: cy - s / 2 + Math.sin(a) * dist - 50, scale: 1, rotate: gsap.utils.random(-220, 220),
        opacity: 0, duration: 0.9 + Math.random() * 0.6, ease: 'power2.out', onComplete: d.remove.bind(d)
      });
    }
  };
  fx.flyToBag = function (src, img) {
    var bag = $$('.bag-btn').filter(function (b) { return b.offsetParent !== null; })[0];
    if (!bag || !hasGSAP || reduce || !src) return;
    var a = src.getBoundingClientRect(), b = bag.getBoundingClientRect();
    var f = document.createElement('img');
    f.src = img;
    f.alt = '';
    f.style.cssText = 'position:fixed;left:0;top:0;z-index:140;height:96px;width:auto;pointer-events:none;filter:drop-shadow(0 10px 10px rgba(42,22,9,.35))';
    document.body.appendChild(f);
    var x0 = a.left + a.width / 2 - 34, y0 = a.top + a.height / 2 - 48, x1 = b.left + b.width / 2 - 34, y1 = b.top + b.height / 2 - 48;
    gsap.set(f, { x: x0, y: y0, scale: 0.6, rotate: -10 });
    gsap.timeline({ onComplete: function () {
      f.remove();
      bag.classList.remove('is-bump');
      void bag.offsetWidth;
      bag.classList.add('is-bump');
    } })
      .to(f, { scale: 1, duration: 0.22, ease: 'back.out(2)' })
      .to(f, { x: x1, duration: 0.78, ease: 'power1.inOut' }, 0.08)
      .to(f, { y: Math.min(y0, y1) - 140, rotate: 18, duration: 0.38, ease: 'power2.out' }, 0.08)
      .to(f, { y: y1, rotate: 0, duration: 0.42, ease: 'power2.in' }, 0.46)
      .to(f, { scale: 0.2, opacity: 0, duration: 0.2 }, 0.78);
  };
  document.addEventListener('abin:add', function (e) {
    fx.pop(1.1);
    if (e.detail && e.detail.el) fx.flyToBag(e.detail.el, e.detail.img);
    kaliSay(pick(['Sedap! It is in your bag.', 'Good pick! Kali nak lagi?', 'Crunch secured.']), 2600, true);
  });

  /* ------------------------------------------------------------ reveals */
  if (!hasGSAP) { $$('[data-pop],[data-split]').forEach(function (e) { e.style.opacity = 1; }); }
  var reveals = function () {
    if (!hasGSAP) return;
    if (reduce) { gsap.set('[data-pop],[data-split]', { opacity: 1 }); return; }
    gsap.set('[data-pop]', { opacity: 0, y: 44, scale: 0.92 });
    ScrollTrigger.batch('[data-pop]', {
      start: 'top 90%', once: true,
      onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: 'back.out(1.6)', stagger: 0.08, overwrite: true, clearProps: 'transform' }); }
    });
    $$('[data-split]').forEach(function (h) {
      if (!window.SplitText) { gsap.set(h, { opacity: 1 }); return; }
      var split = new SplitText(h, { type: 'words,chars', wordsClass: 'word', charsClass: 'ltr' });
      gsap.set(h, { opacity: 1 });
      gsap.from(split.chars, {
        yPercent: 80, opacity: 0, scale: 0.5, rotate: function () { return gsap.utils.random(-18, 18); },
        duration: 0.8, ease: 'back.out(2.4)', stagger: 0.02,
        scrollTrigger: { trigger: h, start: 'top 88%', once: true }
      });
    });
  };
  var counters = function () {
    $$('[data-count]').forEach(function (el) {
      var n = Number(el.getAttribute('data-count')), o = { v: 0 }, fmt = function (v) { return Math.round(v).toLocaleString('en-MY'); };
      if (!hasGSAP || reduce) { el.textContent = fmt(n); return; }
      el.textContent = '0';
      ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: function () {
        gsap.to(o, { v: n, duration: 1.8, ease: 'power3.out', onUpdate: function () { el.textContent = fmt(o.v); } });
        gsap.fromTo(el, { scale: 0.6 }, { scale: 1, duration: 1.2, ease: 'elastic.out(1, .5)' });
      } });
    });
  };
  var ambient = function () {
    if (!hasGSAP || reduce) return;
    $$('[data-float]').forEach(function (el, i) {
      var amp = Number(el.getAttribute('data-float')) || 12;
      gsap.to(el, { y: i % 2 ? amp : -amp, rotate: i % 2 ? 3 : -3, duration: 2.4 + (i % 4) * 0.45, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });
    $$('[data-par]').forEach(function (el) {
      gsap.to(el, { yPercent: Number(el.getAttribute('data-par')), ease: 'none', scrollTrigger: { trigger: el.closest('section') || el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('[data-spin]').forEach(function (el) {
      gsap.to(el, { rotate: Number(el.getAttribute('data-spin')) || 360, ease: 'none', scrollTrigger: { trigger: el.closest('section') || el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $$('.marquee__row').forEach(function (row, i) {
      var skew = gsap.quickTo(row, 'skewX', { duration: 0.4, ease: 'power3' });
      if (A.lenis) A.lenis.on('scroll', function (l) { skew(gsap.utils.clamp(-10, 10, l.velocity * (i % 2 ? -0.3 : 0.3))); });
    });
    if (fine) {
      $$('[data-tilt]').forEach(function (el) {
        var max = Number(el.getAttribute('data-tilt')) || 10;
        var rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' }), ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
        el.style.transformPerspective = '900px';
        el.addEventListener('pointermove', function (e) {
          var r = el.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * max * 2);
          rx(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
        });
        el.addEventListener('pointerleave', function () { rx(0); ry(0); });
      });
    }
  };


  /* ------------------------------------------------------- hero entrance */
  var heroIn = function () {
    var hero = $('.hero');
    if (!hero || !hasGSAP || reduce) return;
    var tl = gsap.timeline();
    var title = $('.hero__title');
    if (window.SplitText && title) {
      var split = new SplitText(title, { type: 'chars', charsClass: 'ltr' });
      tl.from(split.chars, { yPercent: 120, scale: 0.3, rotate: function () { return gsap.utils.random(-30, 30); }, opacity: 0, duration: 1.1, ease: 'elastic.out(1, .5)', stagger: 0.035 }, 0.15);
    }
    tl.from('.hero__pill', { y: 26, opacity: 0, duration: 0.6, ease: 'back.out(2)' }, 0)
      .from('.hero__note', { scale: 0, rotate: -12, opacity: 0, duration: 0.8, ease: 'back.out(2.6)' }, 0.75)
      .from('.hero__lead, .hero__cta > *, .hero__trust > *', { y: 24, opacity: 0, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.06 }, 0.85)
      .from('.stage__blob', { scale: 0.2, opacity: 0, duration: 1.3, ease: 'elastic.out(1, .6)' }, 0.1)
      .from('.stage__ring', { opacity: 0, scale: 0.85, duration: 1 }, 0.5)
      .from('.stage__pack', { y: 240, opacity: 0, duration: 1.1, ease: 'back.out(1.3)', stagger: 0.12 }, 0.35)
      .from('.orb', { scale: 0, opacity: 0, duration: 0.8, ease: 'back.out(2.4)', stagger: 0.1 }, 1)
      .from('.stage__badge', { scale: 0, rotate: -90, duration: 0.9, ease: 'back.out(2)' }, 1.3)
      .from('.hero__hint', { opacity: 0, y: 12, duration: 0.6 }, 1.8);
    $$('.stage__pack').forEach(function (p, i) { gsap.to(p, { y: i % 2 ? -10 : -16, duration: 2.4 + i * 0.35, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.8 + i * 0.2 }); });
    $$('.orb').forEach(function (o, i) { gsap.to(o, { y: i % 2 ? 12 : -12, rotate: i % 2 ? 5 : -5, duration: 2.2 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 }); });
    if (fine) {
      var layers = [['.stage__blob', 14], ['.stage__pack--1, .stage__pack--3', 26], ['.stage__pack--2, .stage__pack--4', 18], ['.orb', -30], ['.stage__badge', -16]];
      var movers = layers.map(function (l) {
        var els = $$(l[0], hero);
        return { d: l[1], x: gsap.quickTo(els, 'x', { duration: 0.9, ease: 'power3' }), yp: gsap.quickTo(els, 'yPercent', { duration: 0.9, ease: 'power3' }) };
      });
      hero.addEventListener('pointermove', function (e) {
        var nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
        movers.forEach(function (m) { m.x(nx * m.d); m.yp(ny * m.d * 0.1); });
      });
    }
    gsap.to('.hero__copy', { yPercent: 10, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__stage', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  };

  /* --------------------------------------------------------- Kali mascot */
  var kali = $('.kali'), say = kali && $('[data-kali-say]', kali), sayTimer = 0;
  var pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  var TIPS = [
    'Psst! Tap the corn sticks to crunch them.',
    'It’s 3PM somewhere. Snack time!',
    'Spicy is our best seller. Pedas sangat!',
    'Seaweed and Original are vegan-friendly.',
    'Every pack is halal, gluten-free and plant-based.',
    'Running a shop? Ask about wholesale cartons.',
    'Kali cuba, kali nak lagi!'
  ];
  var tipIndex = 0;
  function kaliSay(msg, ms, quiet) {
    if (!say) return;
    say.textContent = msg;
    say.classList.add('is-on');
    clearTimeout(sayTimer);
    sayTimer = setTimeout(function () { say.classList.remove('is-on'); }, ms || 3200);
    if (!quiet && kali) { kali.classList.remove('is-wiggle'); void kali.offsetWidth; kali.classList.add('is-wiggle'); }
  }
  fx.kaliSay = kaliSay;
  if (kali) {
    kali.addEventListener('click', function () { kaliSay(TIPS[tipIndex++ % TIPS.length]); fx.crunch(0.5); });
    var pupils = $$('.eye-pupil', kali);
    if (fine && pupils.length) {
      window.addEventListener('pointermove', function (e) {
        var r = kali.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * 0.45;
        var dx = e.clientX - cx, dy = e.clientY - cy, d = Math.max(1, Math.hypot(dx, dy));
        var tx = (dx / d) * 2.6, ty = (dy / d) * 2.6;
        pupils.forEach(function (p) { p.style.transform = 'translate(' + tx + 'px,' + ty + 'px)'; });
      }, { passive: true });
    }
    if (hasGSAP && !reduce) {
      fx.ready.then(function () {
        gsap.from(kali, { y: 160, duration: 1, delay: 1.6, ease: 'back.out(1.6)' });
        gsap.to($('.kali__arm', kali), { rotate: -18, transformOrigin: '12px 100px', duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1, repeatDelay: 1.4 });
        gsap.to($('.kali__crumbs', kali), { y: -3, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
    }
    setTimeout(function () {
      if (A.ui.current()) return;
      var hero = $('.hero');
      kaliSay(hero && window.scrollY < innerHeight * 0.6 ? TIPS[0] : 'Tap me for snack tips!', 4200, true);
      tipIndex = 1;
    }, 9000);
  }
  document.addEventListener('abin:quiz', function (e) {
    var f = A.data.flavours.filter(function (x) { return x.id === e.detail.flavour; })[0];
    if (f) kaliSay('Ooh, ' + f.name + '! ' + f.tagline + '.', 3600);
  });

  /* ---------------------------------------------------------------- boot */
  fontsReady.then(function () { reveals(); if (hasGSAP) ScrollTrigger.refresh(); });
  counters();
  ambient();
  fx.ready.then(function () {
    heroIn();
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
