/* ABIN · Concept B "Jagung Rangup" · the travelling pack and the home hero.
   One fixed Kali Kali pack moves between the [data-travel] boxes down the home page: position and size are
   interpolated between slots as you scroll, the pack turns in 3D on the way (both faces carry the front art, and a
   face swaps to a new flavour only while it is turned away), leans with scroll speed and casts a soft shadow. Long
   hops fade out and back in rather than drifting over other sections. At the "taste" slot it bursts into corn
   sticks and re-forms when you scroll back up. The hero adds orbiting sticks, the flavour picker and its entrance.
   Reduced motion, narrow screens or no GSAP: no traveller, the static pack in each slot stays. */
(function () {
  'use strict';
  var A = window.ABIN, $ = A.$, $$ = A.$$, data = A.data, fx = A.fx || {};
  var html = document.documentElement;
  var reduce = A.env.reduce, fine = A.env.fine, hasGSAP = !!window.gsap;
  var hero = $('.hero');
  if (!hero) return;
  var FLAV = {};
  data.flavours.forEach(function (f) { FLAV[f.id] = f; });
  var travel = A.travel = { flavour: 'spicy', active: false };
  var clamp01 = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var smooth = function (t) { return t * t * (3 - 2 * t); };

  data.flavours.forEach(function (f) { var im = new Image(); im.src = f.img[60]; var st = new Image(); st.src = f.img.stick; });

  /* ---------------------------------------------------- flavour switch */
  var listeners = [];
  travel.onFlavour = function (fn) { listeners.push(fn); };
  travel.setFlavour = function (id) {
    var f = FLAV[id];
    if (!f || id === travel.flavour) return;
    travel.flavour = id;
    html.style.setProperty('--flavour-tint', f.color.tint);
    $$('[data-travel] .slot__img').forEach(function (im) { im.src = f.img[60]; im.alt = 'Kali Kali ' + f.name + ' 60 g pack'; });
    if (card) card.setAttribute('aria-label', 'Quick view of Kali Kali ' + f.name);
    if (travel.active) gsap.to(st, { flip: st.flip + 360, duration: 1.15, ease: 'power3.inOut' });
    listeners.forEach(function (fn) { fn(f); });
    document.dispatchEvent(new CustomEvent('abin:flavour', { detail: { id: id } }));
  };

  /* --------------------------------------------------------- traveller */
  var el = $('.traveller'), card = el && $('.traveller__card', el), shadow = el && $('.traveller__shadow', el);
  var faces = el ? $$('.traveller__face', el) : [];
  var slots = $$('[data-travel]');
  var BW = 392, BH = 560;
  var st = { form: 0, dy: -90, flip: 0, pop: 0, burst: false, vel: 0, spin: 0, shown: false };
  var faceFlav = [null, null];
  var setFace = function (i, id) {
    if (!faces[i] || faceFlav[i] === id) return;
    faceFlav[i] = id;
    faces[i].style.backgroundImage = 'url("' + FLAV[id].img[60] + '")';
  };
  travel.active = !!(el && card && hasGSAP && !reduce && slots.length > 1 && window.matchMedia('(min-width: 900px)').matches);

  var burstLayer = null;
  var burst = function (x, y, h) {
    st.burst = true;
    gsap.to(st, { pop: 1, duration: 0.32, ease: 'power2.in', overwrite: 'auto' });
    if (burstLayer) burstLayer.remove();
    var layer = burstLayer = document.createElement('div');
    layer.className = 'burst';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    var src = FLAV[travel.flavour].img.stick, vh = innerHeight;
    for (var i = 0; i < 18; i++) {
      var s = document.createElement('img'), w = h * (0.2 + Math.random() * 0.16);
      s.src = src;
      s.alt = '';
      s.className = 'burst__stick';
      s.style.width = w + 'px';
      layer.appendChild(s);
      var a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5, d = h * (0.45 + Math.random() * 0.85);
      gsap.set(s, { x: x - w / 2, y: y - w * 0.14, rotate: Math.random() * 360, scale: 0.35 });
      gsap.to(s, { x: '+=' + Math.cos(a) * d * 1.3, duration: 1.7, ease: 'power1.out' });
      gsap.to(s, { y: '+=' + Math.sin(a) * d, duration: 0.5, ease: 'power2.out' });
      gsap.to(s, { y: '+=' + vh, duration: 1.15, delay: 0.5, ease: 'power2.in' });
      gsap.to(s, { rotate: '+=' + gsap.utils.random(-520, 520), scale: 1, duration: 1.7, ease: 'power1.out' });
      gsap.to(s, { opacity: 0, duration: 0.35, delay: 1.3 });
    }
    setTimeout(function () { layer.remove(); if (burstLayer === layer) burstLayer = null; }, 1900);
    document.dispatchEvent(new CustomEvent('abin:burst'));
  };
  var reform = function () {
    st.burst = false;
    gsap.to(st, { pop: 0, duration: 0.8, ease: 'back.out(1.8)', overwrite: 'auto' });
  };

  var frame = function () {
    if (document.hidden || !st.shown) return;
    var vh = innerHeight, S = window.scrollY;
    var info = slots.map(function (s) {
      var r = s.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height, doc: r.top + S + r.height / 2 };
    });
    var anchors = info.map(function (s, k) { return k === 0 ? 0 : s.doc - vh / 2; });
    var i = 0;
    while (i < anchors.length - 1 && S >= anchors[i + 1]) i++;
    var last = i >= anchors.length - 1;
    var a = info[i], b = info[last ? i : i + 1];
    var span = last ? 1 : Math.max(1, anchors[i + 1] - anchors[i]);
    var raw = last ? 0 : clamp01((S - anchors[i]) / span), t = smooth(raw);
    var x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t, h = a.h + (b.h - a.h) * t;
    var vis = 1;
    if (!last && span > vh * 1.5) vis = raw < 0.5 ? clamp01(1 - (raw - 0.1) / 0.14) : clamp01((raw - 0.76) / 0.14);

    var end = anchors[anchors.length - 1];
    if (!st.burst && S >= end - 4) {
      if (st.form < 0.99) { st.burst = true; st.pop = 1; } else burst(x, y, h);
    } else if (st.burst && S < end - 180) reform();

    st.spin += (gsap.utils.clamp(-50, 50, st.vel * 1.6) - st.spin) * 0.08;
    var turn = (last ? 0 : t * 360) + st.flip + st.spin;
    var tilt = (last ? 0 : Math.sin(t * Math.PI) * -9) + gsap.utils.clamp(-7, 7, st.vel * 0.22);
    var k = (h / BH) * st.form * (1 - st.pop * 0.4);
    el.style.transform = 'translate3d(' + (x - BW * k / 2).toFixed(1) + 'px,' + (y - BH * k / 2 + st.dy).toFixed(1) + 'px,0) scale(' + k.toFixed(4) + ')';
    el.style.opacity = (vis * (1 - st.pop)).toFixed(3);
    card.style.transform = 'rotateZ(' + tilt.toFixed(2) + 'deg) rotateY(' + turn.toFixed(2) + 'deg)';
    var ang = ((turn % 360) + 360) % 360, front = ang < 90 || ang > 270;
    setFace(front ? 1 : 0, travel.flavour);
    shadow.style.transform = 'translateX(-50%) scaleX(' + (0.4 + 0.6 * Math.abs(Math.cos(turn * Math.PI / 180))).toFixed(3) + ')';
    el.classList.toggle('is-clickable', vis > 0.6 && st.pop < 0.1 && st.form > 0.9);
  };

  if (travel.active) {
    html.classList.add('has-traveller');
    el.hidden = false;
    setFace(0, travel.flavour);
    setFace(1, travel.flavour);
    if (A.lenis) A.lenis.on('scroll', function (l) { st.vel = l.velocity || 0; });
    gsap.ticker.add(function () { st.vel *= 0.92; });
    gsap.ticker.add(frame);
    card.addEventListener('click', function () { if (A.shop) A.shop.quick(travel.flavour + '-60', card); });
  }
  travel.formIn = function () {
    if (!travel.active) return;
    st.shown = true;
    gsap.to(st, { form: 1, duration: 1.5, ease: 'elastic.out(1, .65)' });
    gsap.to(st, { dy: 0, duration: 1.1, ease: 'power3.out' });
  };

  /* ------------------------------------------------- hero: orbiting sticks */
  var slot = $('[data-travel="hero"]', hero), orbit = $$('.orbit__s', hero);
  var geo = { cx: 0, cy: 0, rx: 0, ry: 0, w: 0 };
  var measure = function () {
    var hr = hero.getBoundingClientRect(), r = slot.getBoundingClientRect();
    geo.cx = r.left - hr.left + r.width / 2;
    geo.cy = r.top - hr.top + r.height / 2;
    geo.rx = r.width * 0.98;
    geo.ry = r.height * 0.15;
    geo.w = r.height * 0.34;
    orbit.forEach(function (s) { s.style.width = geo.w + 'px'; });
  };
  var orbitOn = orbit.length && slot && hasGSAP && !reduce;
  var ang = 0, TILT = -10 * Math.PI / 180, cosT = Math.cos(TILT), sinT = Math.sin(TILT);
  var orbitFrame = function (time, dt) {
    if (document.hidden) return;
    var fade = clamp01(1 - window.scrollY / (innerHeight * 0.55));
    if (fade <= 0) { orbit.forEach(function (s) { s.style.opacity = 0; }); return; }
    ang += (dt / 1000) * (0.32 + Math.min(1.2, Math.abs(st.vel) * 0.02));
    orbit.forEach(function (s, k) {
      var a = ang + k * Math.PI / 2, ox = Math.cos(a) * geo.rx, oy = Math.sin(a) * geo.ry;
      var px = ox * cosT - oy * sinT, py = ox * sinT + oy * cosT, depth = Math.sin(a);
      var sc = 0.72 + 0.28 * (depth + 1) / 2;
      s.style.transform = 'translate3d(' + (geo.cx + px - geo.w / 2).toFixed(1) + 'px,' + (geo.cy + py - geo.w * 0.14).toFixed(1) + 'px,0) rotate(' + ((a * 57.3 * 0.5 + k * 47) % 360).toFixed(1) + 'deg) scale(' + sc.toFixed(3) + ')';
      s.style.zIndex = depth > 0 ? 15 : 5;
      s.style.opacity = (fade * (0.7 + 0.3 * (depth + 1) / 2)).toFixed(3);
      var blur = depth < -0.3;
      if (s.__blur !== blur) { s.__blur = blur; s.style.filter = blur ? 'blur(1.6px)' : 'none'; }
    });
  };
  if (orbitOn) {
    measure();
    window.addEventListener('resize', measure);
    gsap.ticker.add(orbitFrame);
  }

  /* ------------------------------------------------------- hero: picker */
  var scramble = fx.scramble = function (node, to) {
    if (!node) return;
    if (reduce || !hasGSAP) { node.textContent = to; return; }
    var len = Math.max(node.textContent.length, to.length), o = { p: 0 };
    gsap.to(o, { p: 1, duration: 0.7, ease: 'none', overwrite: true, onUpdate: function () {
      var n = Math.floor(o.p * len), out = '';
      for (var c = 0; c < len; c++) {
        var ch = to.charAt(c);
        out += c < n || ch === ' ' || ch === '' ? ch : (/[0-9]/.test(ch) ? String(Math.random() * 10 | 0) : ch);
      }
      node.textContent = out;
    }, onComplete: function () { node.textContent = to; } });
  };
  var syncHero = function (f) {
    hero.style.setProperty('--ink', f.color.deep);
    $$('.picker button[data-f]', hero).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-f') === f.id)); });
    scramble($('[data-hero="ean"]', hero), 'EAN ' + f.barcode[60]);
    scramble($('[data-hero="kcal"]', hero), f.kcal + ' kcal per 30 g');
    var shopBtn = $('[data-hero="shop"]', hero);
    if (shopBtn) shopBtn.href = 'product.html?f=' + f.id + '&s=60';
    A.setText($('[data-hero="shop-label"]', hero), 'Shop ' + f.name);
    orbit.forEach(function (s, k) {
      var img = $('img', s);
      if (!hasGSAP || reduce) { img.src = f.img.stick; return; }
      gsap.timeline()
        .to(img, { scale: 0, duration: 0.22, delay: k * 0.05, ease: 'power2.in' })
        .add(function () { img.src = f.img.stick; })
        .to(img, { scale: 1, duration: 0.6, ease: 'back.out(2.2)' });
    });
  };
  travel.onFlavour(syncHero);
  hero.addEventListener('click', function (e) {
    var b = e.target.closest('.picker button[data-f]');
    if (b) travel.setFlavour(b.getAttribute('data-f'));
  });

  /* ----------------------------------------------------- hero: entrance */
  var heroIn = function () {
    if (!hasGSAP || reduce) { travel.formIn(); return; }
    var tl = gsap.timeline();
    if (window.SplitText) {
      var split = new SplitText($$('.hero__w', hero), { type: 'chars', charsClass: 'hch' });
      tl.from(split.chars, { yPercent: 108, duration: 1.15, ease: 'power4.out', stagger: 0.05 }, 0.05);
    }
    tl.from('.hero__disc', { scale: 0.3, opacity: 0, duration: 1.4, ease: 'power3.out' }, 0)
      .add(travel.formIn, 0.3)
      .from('.picker > *', { x: -26, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07 }, 0.55)
      .from('.hero__copy > *', { y: 24, opacity: 0, filter: 'blur(6px)', duration: 0.9, ease: 'power3.out', stagger: 0.08, clearProps: 'filter,transform' }, 0.65)
      .from('.hero__label', { opacity: 0, duration: 0.5, stagger: 0.08 }, 0.85)
      .from('.hero__scroll', { opacity: 0, duration: 0.6 }, 1.2);
    if (orbitOn) tl.from($$('.orbit__s img', hero), { scale: 0, duration: 0.9, ease: 'back.out(2)', stagger: 0.08 }, 0.9);
    $$('.hero__label', hero).forEach(function (n) { if (n.textContent) { var to = n.textContent; n.textContent = to.replace(/[0-9]/g, '0'); tl.add(function () { scramble(n, to); }, 1); } });
    gsap.to('.hero__word', { yPercent: -35, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  };
  Promise.all([fx.ready, fx.fontsReady]).then(heroIn);
}());
