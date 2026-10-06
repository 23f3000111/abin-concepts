/* ABIN · Concept A · the Crunch Field
   Real corn-stick sprites (one per flavour) and corn kernels tumble down a canvas. Hover a stick (mouse) or tap it
   (touch) and it snaps: two halves spin apart, crumbs fly, a comic word pops ("KRAP!") and a synthesized crunch
   plays (muted with the header sound toggle). Tapping empty space drops a fresh stick from that spot.
   Canvas: canvas[data-crunch="<count>"] inside [data-crunch-host]. Pauses off-screen and in background tabs;
   draws one still frame under prefers-reduced-motion. */
(function () {
  'use strict';
  var A = window.ABIN, $$ = A.$$;
  var reduce = A.env.reduce, fine = A.env.fine;
  var WORDS = ['KRAP!', 'RANGUP!', 'CRUNCH!', 'SEDAP!', 'KRUP!'];
  var CRUMBS = { spicy: ['#E2662B', '#C6421E', '#F29A3A'], cheese: ['#F2B33A', '#E8A019', '#FFD67A'], original: ['#F3D57E', '#E8BF55', '#FFF0B8'], seaweed: ['#BCD66C', '#8DB244', '#2F4A1F'], kernel: ['#FFC21A', '#F5B800'] };

  var loadImg = function (src) {
    return new Promise(function (res) {
      var i = new Image();
      i.onload = function () { res(i); };
      i.onerror = function () { res(null); };
      i.src = src;
    });
  };
  /* pre-scale each sprite once so per-frame drawImage calls stay cheap */
  var bake = function (img, w) {
    var c = document.createElement('canvas'), h = Math.round(img.height * w / img.width);
    c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    return c;
  };

  function Field(canvas, host, opts) {
    this.c = canvas;
    this.g = canvas.getContext('2d');
    this.host = host;
    this.count = opts.count;
    this.sprites = opts.sprites;   /* [{c: canvas, kind: 'spicy'|..., stick: bool}] */
    this.sticks = [];
    this.halves = [];
    this.crumbs = [];
    this.words = [];
    this.mx = -999; this.my = -999; this.lastMove = 0;
    this.running = false; this.visible = true;
    this.avoid = opts.avoid || null;
    this.resize();
    for (var i = 0; i < this.count; i++) this.sticks.push(this.make(null));
    var self = this;
    if ('ResizeObserver' in window) new ResizeObserver(function () { self.resize(); }).observe(host);
    if (reduce) { this.draw(0); return; }
    host.addEventListener('pointermove', function (e) {
      if (e.target.closest('a, button, input, select, textarea, .stage')) { self.mx = self.my = -999; return; }
      var r = self.c.getBoundingClientRect();
      self.mx = e.clientX - r.left; self.my = e.clientY - r.top; self.lastMove = performance.now();
    }, { passive: true });
    host.addEventListener('pointerleave', function () { self.mx = self.my = -999; });
    host.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a, button, input, select, textarea, label, .stage')) return;
      var r = self.c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, hit = false;
      self.sticks.forEach(function (s) { if (s.alive && self.hits(s, x, y, 16)) { self.snap(s, true); hit = true; } });
      if (!hit) self.drop(x, y);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { self.visible = en[0].isIntersecting; if (self.visible) self.start(); }).observe(host);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) self.start(); });
    this.start();
  }
  Field.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = this.host.clientWidth, h = this.host.clientHeight;
    this.w = w; this.h = h; this.dpr = dpr;
    this.c.width = Math.round(w * dpr); this.c.height = Math.round(h * dpr);
    this.c.style.width = w + 'px'; this.c.style.height = h + 'px';
    this.g.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduce && this.sticks && this.sticks.length) this.draw(0);
  };
  /* sticks keep clear of the headline column on wide screens (opts.avoid = fraction of width) */
  Field.prototype.spawnX = function () {
    if (this.avoid && this.w > 900 && Math.random() < 0.82) return this.w * (this.avoid + Math.random() * (1 - this.avoid));
    return Math.random() * this.w;
  };
  Field.prototype.make = function (y) {
    var sp = this.sprites[(Math.random() * this.sprites.length) | 0];
    var small = this.w < 700;
    var len = sp.stick ? (small ? 64 : 84) + Math.pow(Math.random(), 1.4) * (small ? 70 : 110) : 22 + Math.random() * 22;
    return {
      sp: sp, len: len, th: len * sp.c.height / sp.c.width,
      x: this.spawnX(), y: y == null ? Math.random() * this.h : y,
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.014,
      vy: 0.32 + Math.random() * 0.62, ph: Math.random() * 6.28, amp: 8 + Math.random() * 18,
      alive: true, born: y == null ? 0 : 1
    };
  };
  Field.prototype.hits = function (s, x, y, pad) {
    var dx = x - s.cx, dy = y - s.y, c = Math.cos(s.rot), n = Math.sin(s.rot);
    var along = dx * c + dy * n, across = -dx * n + dy * c;
    return Math.abs(along) < s.len / 2 + pad && Math.abs(across) < s.th / 2 + pad;
  };
  Field.prototype.drop = function (x, y) {
    var s = this.make(y);
    s.x = x; s.cx = x; s.vy = 1.4; s.born = 1;
    s.sp = this.sprites.filter(function (p) { return p.stick; })[(Math.random() * 4) | 0] || s.sp;
    s.len = 110 + Math.random() * 60; s.th = s.len * s.sp.c.height / s.sp.c.width;
    this.sticks.push(s);
    if (this.sticks.length > this.count + 10) this.sticks.splice(0, 1);
    if (A.fx && A.fx.pop) A.fx.pop(0.6 + Math.random() * 0.3);
  };
  Field.prototype.snap = function (s, loud) {
    s.alive = false;
    var self = this, c = Math.cos(s.rot), n = Math.sin(s.rot), q = s.len / 4;
    [-1, 1].forEach(function (k) {
      self.halves.push({ sp: s.sp, side: k, len: s.len, th: s.th, x: s.cx + c * q * k, y: s.y + n * q * k, rot: s.rot,
        vr: k * (0.05 + Math.random() * 0.07), vx: c * k * (1.4 + Math.random() * 1.6) + (Math.random() - 0.5), vy: n * k * 1.2 - 2.4 - Math.random() * 1.5, life: 1 });
    });
    var cols = CRUMBS[s.sp.kind] || CRUMBS.kernel, count = s.sp.stick ? 16 : 7;
    for (var i = 0; i < count; i++) {
      var a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 4.2;
      this.crumbs.push({ x: s.cx, y: s.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, r: 1.5 + Math.random() * 3.6, c: cols[i % cols.length], rot: Math.random() * 6, life: 1 });
    }
    if (s.sp.stick && s.len > 90 && Math.random() < 0.7) this.words.push({ x: s.cx, y: s.y - 10, t: WORDS[(Math.random() * WORDS.length) | 0], rot: (Math.random() - 0.5) * 0.4, life: 1 });
    if (A.fx && A.fx.crunch) A.fx.crunch(loud ? 1 : 0.65);
    setTimeout(function () {
      var i = self.sticks.indexOf(s);
      if (i > -1) self.sticks[i] = self.make(-80);
    }, 800 + Math.random() * 1600);
  };
  Field.prototype.start = function () {
    if (this.running || reduce || !this.visible || document.hidden) return;
    this.running = true;
    var self = this;
    var tick = function (t) {
      if (!self.visible || document.hidden) { self.running = false; return; }
      self.frame(t / 1000);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  Field.prototype.drawSprite = function (sp, x, y, rot, len, th, alpha, half) {
    var g = this.g;
    g.save();
    g.globalAlpha = alpha;
    g.translate(x, y);
    g.rotate(rot);
    if (half) {
      /* (x, y) is the centre of this half: clip to its extent and offset the whole stick behind it */
      g.beginPath();
      g.rect(-len / 4, -th, len / 2, th * 2);
      g.clip();
      g.drawImage(sp.c, -len / 2 - half * len / 4, -th / 2, len, th);
    } else {
      g.drawImage(sp.c, -len / 2, -th / 2, len, th);
    }
    g.restore();
  };
  Field.prototype.draw = function (t) {
    var g = this.g;
    g.clearRect(0, 0, this.w, this.h);
    for (var i = 0; i < this.sticks.length; i++) {
      var s = this.sticks[i];
      if (!s.alive) continue;
      s.cx = s.x + Math.sin(t * 0.7 + s.ph) * s.amp;
      var sc = 1 - (s.born || 0);
      this.drawSprite(s.sp, s.cx, s.y, s.rot, s.len * sc, s.th * sc, 1, 0);
    }
  };
  Field.prototype.frame = function (t) {
    var g = this.g, self = this, i;
    var hover = fine && this.mx > -900 && performance.now() - this.lastMove < 120;
    for (i = 0; i < this.sticks.length; i++) {
      var s = this.sticks[i];
      if (!s.alive) continue;
      s.y += s.vy;
      s.rot += s.vr;
      if (s.born > 0) s.born = Math.max(0, s.born - 0.05);
      if (s.y > this.h + s.len) { this.sticks[i] = this.make(-s.len); continue; }
      s.cx = s.x + Math.sin(t * 0.7 + s.ph) * s.amp;
      if (hover && this.hits(s, this.mx, this.my, 2)) this.snap(s, false);
    }
    g.clearRect(0, 0, this.w, this.h);
    for (i = 0; i < this.sticks.length; i++) {
      var k = this.sticks[i];
      if (!k.alive) continue;
      var sc = 1 - k.born;
      this.drawSprite(k.sp, k.cx, k.y, k.rot, k.len * sc, k.th * sc, 1, 0);
    }
    for (i = this.halves.length - 1; i >= 0; i--) {
      var h = this.halves[i];
      h.life -= 0.016;
      if (h.life <= 0) { this.halves.splice(i, 1); continue; }
      h.x += h.vx; h.y += h.vy; h.vy += 0.14; h.rot += h.vr;
      this.drawSprite(h.sp, h.x, h.y, h.rot, h.len, h.th, Math.min(1, h.life * 1.6), h.side);
    }
    for (i = this.crumbs.length - 1; i >= 0; i--) {
      var q = this.crumbs[i];
      q.life -= 0.022;
      if (q.life <= 0) { this.crumbs.splice(i, 1); continue; }
      q.x += q.vx; q.y += q.vy; q.vy += 0.16; q.vx *= 0.99; q.rot += 0.1;
      g.save();
      g.globalAlpha = Math.min(1, q.life * 1.4);
      g.translate(q.x, q.y); g.rotate(q.rot);
      g.fillStyle = q.c;
      g.beginPath();
      g.moveTo(-q.r, -q.r * 0.6); g.lineTo(q.r * 0.8, -q.r); g.lineTo(q.r, q.r * 0.7); g.lineTo(-q.r * 0.7, q.r);
      g.closePath(); g.fill();
      g.restore();
    }
    for (i = this.words.length - 1; i >= 0; i--) {
      var w = this.words[i];
      w.life -= 0.015;
      if (w.life <= 0) { this.words.splice(i, 1); continue; }
      w.y -= 0.8;
      var grow = Math.min(1, (1 - w.life) * 6);
      g.save();
      g.globalAlpha = Math.min(1, w.life * 1.8);
      g.translate(w.x, w.y); g.rotate(w.rot); g.scale(0.6 + grow * 0.4, 0.6 + grow * 0.4);
      g.font = '400 34px Anton, Impact, sans-serif';
      g.textAlign = 'center';
      g.lineJoin = 'round';
      g.lineWidth = 9; g.strokeStyle = '#2A1609'; g.strokeText(w.t, 0, 0);
      g.lineWidth = 5; g.strokeStyle = '#FFFFFF'; g.strokeText(w.t, 0, 0);
      g.fillStyle = '#FF7A1A'; g.fillText(w.t, 0, 0);
      g.restore();
    }
  };
  A.CrunchField = Field;

  /* --------------------------------------------------------------- boot */
  var hosts = $$('canvas[data-crunch]');
  if (!hosts.length) return;
  var srcs = A.data.flavours.map(function (f) { return { src: f.img.stick, kind: f.id, stick: true }; })
    .concat([1, 2, 3].map(function (n) { return { src: 'assets/img/kernels/kernel-' + n + '.webp', kind: 'kernel', stick: false }; }));
  Promise.all(srcs.map(function (s) { return loadImg(s.src); })).then(function (imgs) {
    var sprites = [];
    imgs.forEach(function (img, i) { if (img) sprites.push({ c: bake(img, srcs[i].stick ? 360 : 90), kind: srcs[i].kind, stick: srcs[i].stick }); });
    /* two sticks for every kernel */
    var weighted = sprites.filter(function (s) { return s.stick; }).concat(sprites.filter(function (s) { return s.stick; })).concat(sprites.filter(function (s) { return !s.stick; }));
    hosts.forEach(function (cv) {
      var host = cv.closest('[data-crunch-host]') || cv.parentElement;
      var n = Number(cv.getAttribute('data-crunch')) || 18;
      if (innerWidth < 700) n = Math.round(n * 0.5);
      var avoid = Number(cv.getAttribute('data-avoid')) || 0;
      var start = function () { (A.crunchFields = A.crunchFields || []).push(new Field(cv, host, { count: n, sprites: weighted, avoid: avoid })); };
      if (A.fx && A.fx.ready) A.fx.ready.then(start); else start();
    });
  });
}());
