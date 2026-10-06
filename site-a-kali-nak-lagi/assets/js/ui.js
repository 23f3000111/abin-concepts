/* ABIN · shared UI glue for both concepts: helpers, pop-ups (<dialog>), lightbox with gallery, info pop-ups
   filled from data.js, toasts, the mobile menu, hover-to-play videos and animated accordions.
   Hooks: [data-open] [data-close] [data-lightbox] [data-gallery] [data-info] [data-menu-toggle] [data-copy]
          video[data-hover-play] details[data-animate] [data-year]. Dynamic text is always set with textContent. */
(function () {
  'use strict';
  var A = window.ABIN = window.ABIN || {};
  var doc = document, html = doc.documentElement;
  var $ = A.$ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = A.$$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  A.env = { reduce: reduce, fine: fine };
  html.classList.remove('no-js');
  html.classList.add('js');

  var text = A.setText = function (el, value) { if (el) el.textContent = value == null ? '' : String(value); };
  var ui = A.ui = {};

  /* ------------------------------------------------------------ pop-ups */
  var current = null, lastFocus = null, closing = false, closeTimer = 0;
  var lock = function (on) {
    html.classList.toggle('is-locked', on);
    if (A.lenis) { if (on) A.lenis.stop(); else A.lenis.start(); }
  };
  var finishClose = function (dlg, quiet) {
    clearTimeout(closeTimer);
    dlg.classList.remove('is-open', 'is-closing');
    if (dlg.open && typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
    $$('video', dlg).forEach(function (v) { v.pause(); });
    if (current === dlg) current = null;
    closing = false;
    if (!current && !html.classList.contains('is-menu-open')) lock(false);
    dlg.dispatchEvent(new CustomEvent('abin:close', { bubbles: true }));
    if (!quiet && lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* old browsers */ } }
  };
  ui.open = function (dlg, opener) {
    if (typeof dlg === 'string') dlg = doc.getElementById(dlg);
    if (!dlg) return;
    if (closing && current) finishClose(current, true);
    if (current && current !== dlg) finishClose(current, true);
    if (html.classList.contains('is-menu-open')) ui.menu(false);
    lastFocus = opener || doc.activeElement;
    current = dlg;
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
    lock(true);
    requestAnimationFrame(function () { requestAnimationFrame(function () { dlg.classList.add('is-open'); }); });
    dlg.dispatchEvent(new CustomEvent('abin:open', { bubbles: true }));
  };
  ui.close = function () {
    var dlg = current;
    if (!dlg || closing) return;
    closing = true;
    dlg.classList.remove('is-open');
    dlg.classList.add('is-closing');
    closeTimer = setTimeout(function () { finishClose(dlg); }, reduce ? 0 : 300);
  };
  ui.current = function () { return current; };
  doc.addEventListener('cancel', function (e) { if (e.target === current) { e.preventDefault(); ui.close(); } }, true);

  /* ----------------------------------------------------------- lightbox */
  var gallery = [], gIndex = 0;
  var lbFill = function (item) {
    var box = $('#dlg-lightbox');
    if (!box) return;
    var media = $('[data-lb-media]', box);
    while (media.firstChild) media.removeChild(media.firstChild);
    var el;
    if (item.type === 'video') {
      el = doc.createElement('video');
      el.src = item.src;
      if (item.poster) el.poster = item.poster;
      el.controls = true;
      el.playsInline = true;
      el.autoplay = true;
      el.setAttribute('playsinline', '');
    } else {
      el = doc.createElement('img');
      el.src = item.src;
      el.alt = item.alt || '';
      el.decoding = 'async';
    }
    media.appendChild(el);
    text($('[data-lb-caption]', box), item.caption || item.alt || '');
    var multi = gallery.length > 1;
    $$('[data-lb-prev],[data-lb-next]', box).forEach(function (b) { b.hidden = !multi; });
    text($('[data-lb-count]', box), multi ? (gIndex + 1) + ' / ' + gallery.length : '');
  };
  var itemFrom = function (t) {
    var src = t.getAttribute('data-lightbox');
    var img = $('img', t);
    return {
      src: src,
      type: t.getAttribute('data-type') || (/\.mp4(\?|$)/i.test(src) ? 'video' : 'image'),
      poster: t.getAttribute('data-poster') || '',
      alt: t.getAttribute('data-alt') || (img ? img.alt : ''),
      caption: t.getAttribute('data-caption') || ''
    };
  };
  ui.lightbox = function (item, opener) {
    var g = opener && opener.getAttribute('data-gallery');
    if (g) {
      var all = $$('[data-gallery="' + g + '"]');
      gallery = all.map(itemFrom);
      gIndex = Math.max(0, all.indexOf(opener));
    } else { gallery = [item]; gIndex = 0; }
    lbFill(gallery[gIndex]);
    ui.open('dlg-lightbox', opener);
  };
  var step = function (d) {
    if (gallery.length < 2) return;
    gIndex = (gIndex + d + gallery.length) % gallery.length;
    lbFill(gallery[gIndex]);
  };
  doc.addEventListener('keydown', function (e) {
    if (!current || current.id !== 'dlg-lightbox') return;
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });

  /* -------------------------------------------------------- info pop-up */
  var find = function (arr, id) { return (arr || []).filter(function (x) { return x.id === id; })[0]; };
  var flavour = function (id) { return find(A.data.flavours, id); };
  ui.infoContent = function (ref) {
    var parts = String(ref).split(':'), kind = parts[0], id = parts[1], d = A.data, x;
    if (kind === 'claims' && (x = find(d.claims, id))) {
      return { kicker: x.bm, title: x.title, body: x.long, icon: x.icon, cta: { label: 'Why Kali Kali', href: 'benefits.html' } };
    }
    if (kind === 'certs' && (x = find(d.certs, id))) return { kicker: x.body, title: x.title, body: x.long, img: x.img, imgAlt: x.title + ' mark' };
    if (kind === 'moments' && (x = find(d.moments, id))) {
      var f = flavour(x.pair);
      return { kicker: x.time + ' ' + x.ampm, title: x.title, body: x.text, img: x.img, imgAlt: x.title,
        cta: { label: 'Pair it with ' + f.name, href: 'product.html?f=' + f.id + '&s=60' },
        video: x.video ? { src: x.video, label: 'Watch the ad' } : null, flavour: f };
    }
    if (kind === 'channels' && (x = find(d.channels, id))) {
      return { kicker: 'Trade channel', title: x.title, body: x.text, img: x.img, imgAlt: x.title,
        cta: { label: 'Send a trade enquiry', href: 'contact.html#' + (html.getAttribute('data-trade-hash') || 'wholesale') } };
    }
    if (kind === 'flavours' && (x = flavour(id))) {
      return { kicker: x.bm + ' · ' + x.zh, title: x.name, body: x.blurb, img: x.img[60], imgAlt: 'Kali Kali ' + x.name + ' 60 g pack',
        cta: { label: 'See ' + x.name, href: 'product.html?f=' + x.id + '&s=60' }, flavour: x };
    }
    return null;
  };
  ui.info = function (ref, opener) {
    var c = ui.infoContent(ref), box = $('#dlg-info');
    if (!c || !box) return;
    text($('[data-i="kicker"]', box), c.kicker);
    text($('[data-i="title"]', box), c.title);
    text($('[data-i="body"]', box), c.body);
    var img = $('[data-i="img"]', box), icon = $('[data-i="icon"]', box);
    if (img) { img.hidden = !c.img; if (c.img) { img.src = c.img; img.alt = c.imgAlt || ''; } }
    if (icon) { icon.hidden = !c.icon; icon.innerHTML = c.icon ? A.icon(c.icon) : ''; }
    var cta = $('[data-i="cta"]', box);
    if (cta) { cta.hidden = !c.cta; if (c.cta) { cta.href = c.cta.href; text($('[data-i="cta-label"]', cta) || cta, c.cta.label); } }
    var vid = $('[data-i="video"]', box);
    if (vid) {
      vid.hidden = !c.video;
      if (c.video) { vid.setAttribute('data-lightbox', c.video.src); vid.setAttribute('data-caption', c.title); }
    }
    box.style.cssText = '';
    if (c.flavour) {
      var col = c.flavour.color;
      box.style.setProperty('--c', col.pack); box.style.setProperty('--c-pop', col.pop); box.style.setProperty('--c-deep', col.deep);
      box.style.setProperty('--c-tint', col.tint); box.style.setProperty('--c-on', col.on);
    }
    box.setAttribute('data-kind', ref.split(':')[0]);
    ui.open(box, opener);
  };

  /* ------------------------------------------------------------- toasts */
  ui.toast = function (message) {
    var wrap = $('.toasts');
    if (!wrap) {
      wrap = doc.createElement('div');
      wrap.className = 'toasts';
      wrap.setAttribute('role', 'status');
      wrap.setAttribute('aria-live', 'polite');
      doc.body.appendChild(wrap);
    }
    var t = doc.createElement('div');
    t.className = 'toast';
    t.textContent = message;
    wrap.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('is-in'); });
    setTimeout(function () { t.classList.remove('is-in'); setTimeout(function () { t.remove(); }, 400); }, 2600);
  };

  /* --------------------------------------------------------------- menu */
  ui.menu = function (force) {
    var on = typeof force === 'boolean' ? force : !html.classList.contains('is-menu-open');
    html.classList.toggle('is-menu-open', on);
    $$('[data-menu-toggle]').forEach(function (b) { b.setAttribute('aria-expanded', String(on)); });
    if (!current) lock(on);
  };
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && html.classList.contains('is-menu-open')) ui.menu(false); });

  /* ------------------------------------------------- delegated clicks */
  doc.addEventListener('click', function (e) {
    if (current && e.target === current) { ui.close(); return; }
    var t = e.target.closest('[data-open],[data-close],[data-lightbox],[data-info],[data-menu-toggle],[data-lb-prev],[data-lb-next],[data-copy]');
    if (!t) {
      if (html.classList.contains('is-menu-open') && e.target.closest('.menu a')) ui.menu(false);
      return;
    }
    if (t.hasAttribute('data-close')) { e.preventDefault(); ui.close(); return; }
    if (t.hasAttribute('data-menu-toggle')) { e.preventDefault(); ui.menu(); return; }
    if (t.hasAttribute('data-lb-prev')) { e.preventDefault(); step(-1); return; }
    if (t.hasAttribute('data-lb-next')) { e.preventDefault(); step(1); return; }
    if (t.hasAttribute('data-open')) { e.preventDefault(); ui.open(t.getAttribute('data-open'), t); return; }
    if (t.hasAttribute('data-lightbox')) { e.preventDefault(); ui.lightbox(itemFrom(t), t); return; }
    if (t.hasAttribute('data-info')) { e.preventDefault(); ui.info(t.getAttribute('data-info'), t); return; }
    if (t.hasAttribute('data-copy')) {
      e.preventDefault();
      var value = t.getAttribute('data-copy');
      var done = function () { ui.toast('Copied: ' + value); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(value).then(done, done); else done();
    }
  });

  /* ---------------------------------------------------- hover-play video */
  var vids = $$('video[data-hover-play]');
  vids.forEach(function (v) {
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('muted', '');
  });
  var play = function (v) { if (reduce) return; var p = v.play(); if (p && p.catch) p.catch(function () { /* autoplay refused */ }); };
  if (fine) {
    vids.forEach(function (v) {
      var host = v.closest('[data-hover-card]') || v;
      host.addEventListener('pointerenter', function () { play(v); });
      host.addEventListener('pointerleave', function () { v.pause(); });
    });
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.intersectionRatio >= 0.6) play(en.target); else en.target.pause(); });
    }, { threshold: [0, 0.6, 1] });
    vids.forEach(function (v) { io.observe(v); });
  }

  /* ---------------------------------------------------- animated <details> */
  doc.addEventListener('click', function (e) {
    var sum = e.target.closest('details[data-animate] > summary');
    if (!sum || reduce) return;
    var d = sum.parentElement, body = sum.nextElementSibling;
    if (!body || !body.animate) return;
    e.preventDefault();
    if (d.open) {
      var h = body.offsetHeight;
      d.classList.add('is-closing');
      body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 280, easing: 'cubic-bezier(.4,0,.2,1)' })
        .onfinish = function () { d.open = false; d.classList.remove('is-closing'); };
    } else {
      if (d.hasAttribute('data-exclusive')) {
        $$('details[data-animate][open]', d.parentElement).forEach(function (o) { if (o !== d) o.open = false; });
      }
      d.open = true;
      var full = body.offsetHeight;
      body.animate([{ height: '0px', opacity: 0 }, { height: full + 'px', opacity: 1 }], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
  });

  $$('[data-year]').forEach(function (el) { text(el, new Date().getFullYear()); });
}());
