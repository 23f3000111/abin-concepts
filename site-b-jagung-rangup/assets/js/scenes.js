/* ABIN · Concept B "Jagung Rangup" · page scenes. Home: the scroll-lit statement, pack callouts that draw in, the
   full-bleed photo reveal, nutrition numbers that roll when the flavour changes, marquees that speed up with the
   scroll, the pinned "A day with Kali Kali" timeline (the page colour follows each panel), the taste-the-crunch
   burst, the channel list's follow-the-cursor photo and the review cycle. Inner pages: the story timeline that
   fills as you scroll, struck-through "never inside" words, the sticky claims deep-dive and the energy bars.
   Every scene only runs when its markup is on the page. */
(function () {
  'use strict';
  var A = window.ABIN, $ = A.$, $$ = A.$$, data = A.data, fx = A.fx || {};
  var reduce = A.env.reduce, fine = A.env.fine, hasGSAP = !!window.gsap;
  var setText = A.setText;
  var FLAV = {};
  data.flavours.forEach(function (f) { FLAV[f.id] = f; });
  var travel = A.travel;
  var current = function () { return FLAV[travel ? travel.flavour : 'spicy']; };
  var onFlavour = function (fn) { if (travel) travel.onFlavour(fn); };
  var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var setBg = fx.setBg || function () {};

  /* ------------------------------------------------ scroll-lit statement */
  var lit = function () {
    if (!hasGSAP || reduce || !window.SplitText) return;
    $$('[data-lit]').forEach(function (el) {
      new SplitText(el, { type: 'words', wordsClass: 'lw' });
      var items = $$('.lw, .pill-img', el);
      gsap.set(items, { opacity: 0.14 });
      var pills = $$('.pill-img', el);
      if (pills.length) gsap.set(pills, { scale: 0.55 });
      gsap.to(items, { opacity: 1, scale: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 42%', scrub: 0.4 } });
    });
  };

  /* ----------------------------------------------------- anatomy callouts */
  var anatomy = function () {
    var stage = $('[data-anatomy]');
    if (!stage) return;
    var kcal = $('[data-anat-kcal]', stage);
    var sync = function (f) { setText(kcal, f.kcal + ' kcal, ' + f.daily + '% of your day per 30 g.'); };
    onFlavour(sync);
    sync(current());
    if (!hasGSAP || reduce) return;
    var paths = $$('.anatomy__lines path', stage), dots = $$('.anatomy__lines circle', stage), calls = $$('.callout', stage);
    paths.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    gsap.set(dots, { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(calls, { opacity: 0, y: 16 });
    gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top 48%', once: true } })
      .to(dots, { scale: 1, duration: 0.5, ease: 'back.out(3)', stagger: 0.07 })
      .to(paths, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut', stagger: 0.07 }, 0.15)
      .to(calls, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07, clearProps: 'transform' }, 0.55);
  };

  /* --------------------------------------------------- full-bleed reveal */
  var revealFull = function () {
    if (!hasGSAP || reduce) return;
    $$('[data-reveal-full]').forEach(function (frame) {
      var media = $('.reveal-full__img', frame), img = $('img', media), copy = $$('.reveal-full__copy > *', frame);
      gsap.timeline({ scrollTrigger: { trigger: frame.parentElement, start: 'top 65%', end: 'bottom bottom', scrub: 0.5 } })
        .fromTo(media, { clipPath: 'inset(16% 22% 16% 22% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', duration: 1 })
        .fromTo(img, { scale: 1.3 }, { scale: 1, ease: 'none', duration: 1 }, 0)
        .fromTo(copy, { opacity: 0, y: 46 }, { opacity: 1, y: 0, ease: 'power2.out', duration: 0.35, stagger: 0.08 }, 0.62);
    });
  };

  /* ------------------------------------------- nutrition: rolling numbers */
  var roll = function (el, value) {
    if (!el) return;
    var str = String(value);
    if (el.__len !== str.length) {
      while (el.firstChild) el.removeChild(el.firstChild);
      el.__strips = [];
      for (var i = 0; i < str.length; i++) {
        var col = document.createElement('span'), strip = document.createElement('span');
        col.className = 'roll__col';
        col.setAttribute('aria-hidden', 'true');
        strip.className = 'roll__strip';
        for (var d = 0; d < 10; d++) { var s = document.createElement('span'); s.textContent = d; strip.appendChild(s); }
        col.appendChild(strip);
        el.appendChild(col);
        el.__strips.push(strip);
      }
      el.__sr = document.createElement('span');
      el.__sr.className = 'sr';
      el.appendChild(el.__sr);
      el.__len = str.length;
    }
    el.__strips.forEach(function (strip, k) { strip.style.setProperty('--d', str.charAt(k)); });
    el.__sr.textContent = str;
  };
  var nutrition = function () {
    var sec = $('.nutri');
    if (!sec) return;
    var DIET = { vegetarian: 'Vegetarian', vegan: 'Vegan-friendly' };
    var rk = $('[data-roll="kcal"]', sec), rd = $('[data-roll="daily"]', sec);
    var heat = $('[data-nut="heat"]', sec), heatLabel = $('[data-nut="heat-label"]', sec), diet = $('[data-nut="diet"]', sec);
    var shown = reduce || !hasGSAP, cur = current();
    var draw = function (f) {
      cur = f;
      $$('[data-nut-f]', sec).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-nut-f') === f.id)); });
      if (shown) { roll(rk, f.kcal); roll(rd, f.daily); }
      $$('i', heat).forEach(function (d, k) { d.classList.toggle('is-on', k < f.heat); });
      heat.setAttribute('aria-label', 'Heat level ' + f.heat + ' of 3');
      setText(heatLabel, f.heat ? 'Properly pedas' : 'No chilli heat');
      if (diet.textContent !== DIET[f.diet]) {
        setText(diet, DIET[f.diet]);
        if (hasGSAP && !reduce) gsap.fromTo(diet, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
      }
    };
    roll(rk, shown ? cur.kcal : '000');
    roll(rd, shown ? cur.daily : '0');
    if (!shown) ScrollTrigger.create({ trigger: sec, start: 'top 55%', once: true, onEnter: function () { shown = true; roll(rk, cur.kcal); roll(rd, cur.daily); } });
    sec.addEventListener('click', function (e) {
      var b = e.target.closest('[data-nut-f]');
      if (!b) return;
      var f = FLAV[b.getAttribute('data-nut-f')];
      if (travel) travel.setFlavour(f.id); else draw(f);
    });
    onFlavour(draw);
    draw(cur);
  };

  /* ------------------------------------------ marquees lean on the scroll */
  var marquees = function () {
    if (reduce || !hasGSAP || !A.lenis) return;
    var tracks = $$('[data-marquee]'), boost = 0;
    A.lenis.on('scroll', function (l) { boost = Math.max(boost, Math.min(5, Math.abs(l.velocity || 0) * 0.15)); });
    gsap.ticker.add(function () {
      boost *= 0.95;
      tracks.forEach(function (t) {
        var an = t.getAnimations ? t.getAnimations()[0] : null;
        if (an) an.playbackRate = 1 + boost;
      });
    });
  };

  /* ---------------------------------------- pinned "A day with Kali Kali" */
  var day = function () {
    var sec = $('[data-day]');
    if (!sec) return;
    var track = $('.day__track', sec), panels = $$('.day__panel', sec), bars = $$('.day__bar li', sec);
    var tints = panels.map(function (p) { return p.getAttribute('data-canvas'); });
    var paint = function (p, active) {
      var n = panels.length, i = Math.min(n - 1, Math.round(p * (n - 1)));
      bars.forEach(function (b, k) { b.style.setProperty('--p', clamp01(p * n - k).toFixed(3)); });
      panels.forEach(function (x, k) { x.classList.toggle('is-on', k === i); });
      if (active) setBg(tints[i]);
    };
    if (!hasGSAP || reduce || !window.matchMedia('(min-width: 900px)').matches) {
      sec.classList.add('is-static');
      bars.forEach(function (b) { b.style.setProperty('--p', 1); });
      if (hasGSAP) ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: function (self) { if (self.isActive) setBg(tints[0]); } });
      return;
    }
    var dist = function () { return Math.max(0, track.scrollWidth - innerWidth); };
    gsap.to(track, {
      x: function () { return -dist(); },
      ease: 'none',
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return '+=' + dist(); },
        pin: $('.day__pin', sec), scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 1,
        onUpdate: function (self) { paint(self.progress, self.isActive); },
        onToggle: function (self) { if (self.isActive) paint(self.progress, true); }
      }
    });
    gsap.from(panels, { opacity: 0, y: 40, duration: 1, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: sec, start: 'top 70%', once: true } });
  };

  /* ---------------------------------------------- taste: the pack bursts */
  var taste = function () {
    var sec = $('.taste');
    if (!sec) return;
    document.addEventListener('abin:burst', function () { sec.classList.add('is-burst'); });
    document.addEventListener('abin:reform', function () { sec.classList.remove('is-burst'); });
  };

  /* --------------------------------------- channels: follow-the-cursor photo */
  var partner = function () {
    var fl = $('.hover-img');
    if (!fl || !fine || reduce || !hasGSAP) return;
    var img = $('img', fl);
    var qx = gsap.quickTo(fl, 'x', { duration: 0.55, ease: 'power3' }), qy = gsap.quickTo(fl, 'y', { duration: 0.55, ease: 'power3' });
    var W = 300, H = 225;
    $$('.channels li').forEach(function (li) {
      li.addEventListener('pointerenter', function (e) {
        img.src = li.getAttribute('data-img');
        if (!fl.classList.contains('is-on')) { gsap.set(fl, { x: e.clientX - W - 30, y: e.clientY - H / 2 }); }
        fl.classList.add('is-on');
      });
      li.addEventListener('pointerleave', function () { fl.classList.remove('is-on'); });
      li.addEventListener('pointermove', function (e) { qx(e.clientX - W - 30); qy(e.clientY - H / 2); });
    });
    window.addEventListener('scroll', function () { fl.classList.remove('is-on'); }, { passive: true });
  };

  /* ------------------------------------------------------- review cycle */
  var quotes = function () {
    var sec = $('.quotes');
    if (!sec) return;
    var qs = $$('.quote', sec), tabs = $$('[data-q-go]', sec), i = 0, active = false, paused = false;
    var tint = function (k) { return qs[k].getAttribute('data-flavour') || 'sky'; };
    var show = function (k, focus) {
      if (k === i) return;
      var old = qs[i], next = qs[k];
      i = k;
      tabs.forEach(function (t, n) { t.setAttribute('aria-selected', String(n === k)); t.tabIndex = n === k ? 0 : -1; });
      if (focus) tabs[k].focus();
      if (active) setBg(tint(k));
      if (!hasGSAP || reduce) { old.hidden = true; next.hidden = false; return; }
      gsap.killTweensOf([old, next]);
      gsap.to(old, { opacity: 0, y: -18, duration: 0.3, ease: 'power2.in', onComplete: function () { old.hidden = true; } });
      next.hidden = false;
      gsap.fromTo(next, { opacity: 0, y: 26, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, delay: 0.22, ease: 'power3.out', clearProps: 'filter' });
    };
    tabs.forEach(function (t, n) {
      t.tabIndex = n === 0 ? 0 : -1;
      t.addEventListener('click', function () { show(n); });
      t.addEventListener('keydown', function (e) {
        var d = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        show((i + d + qs.length) % qs.length, true);
      });
    });
    sec.addEventListener('pointerenter', function () { paused = true; });
    sec.addEventListener('pointerleave', function () { paused = false; });
    sec.addEventListener('focusin', function () { paused = true; });
    sec.addEventListener('focusout', function () { paused = false; });
    if (hasGSAP) ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: function (self) { active = self.isActive; if (active) setBg(tint(i)); } });
    if (!reduce) setInterval(function () { if (!paused && active && !document.hidden) show((i + 1) % qs.length); }, 6500);
  };

  /* ----------------------------------------------- about: story timeline */
  var timeline = function () {
    var tl = $('[data-timeline]');
    if (!tl) return;
    if (!hasGSAP || reduce) { tl.style.setProperty('--fill', 1); return; }
    gsap.to(tl, { '--fill': 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 70%', end: 'bottom 60%', scrub: 0.4 } });
    $$('.timeline__item', tl).forEach(function (item, i) {
      gsap.from(item, { x: i % 2 ? 60 : -60, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 88%', once: true } });
    });
  };

  /* ------------------------------------- benefits: "never inside" strikes */
  var inout = function () {
    var box = $('[data-inout]');
    if (!box) return;
    if (!hasGSAP || reduce) { box.classList.add('is-struck'); return; }
    ScrollTrigger.create({ trigger: box, start: 'top 72%', once: true, onEnter: function () { box.classList.add('is-struck'); } });
  };

  /* ------------------------------------------ benefits: claims deep-dive */
  var deep = function () {
    var items = $$('.deep__item');
    if (!items.length) return;
    var imgs = $$('[data-deep-img]');
    var show = function (item) {
      var id = item.getAttribute('data-deep');
      items.forEach(function (x) { x.classList.toggle('is-on', x === item); });
      imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-deep-img') === id); });
    };
    if (!hasGSAP || reduce) { items.forEach(function (x) { x.classList.add('is-on'); }); return; }
    show(items[0]);
    items.forEach(function (item) {
      ScrollTrigger.create({ trigger: item, start: 'top 55%', end: 'bottom 55%', onToggle: function (self) { if (self.isActive) show(item); } });
    });
  };

  /* --------------------------------------------- benefits: energy bars */
  var kcalBars = function () {
    var list = $('[data-kcal]');
    if (!list) return;
    if (!hasGSAP || reduce) { list.classList.add('is-in'); return; }
    ScrollTrigger.create({ trigger: list, start: 'top 80%', once: true, onEnter: function () { list.classList.add('is-in'); } });
  };

  /* ---------------------------------------------------------------- boot */
  timeline();
  inout();
  deep();
  kcalBars();
  anatomy();
  revealFull();
  nutrition();
  marquees();
  day();
  taste();
  partner();
  quotes();
  Promise.resolve(fx.fontsReady).then(function () {
    lit();
    if (hasGSAP) { ScrollTrigger.sort(); ScrollTrigger.refresh(); }
  });
}());
