/* ABIN · shop glue for both concepts: the bag (localStorage), bag drawer, product cards from <template>s,
   filters + sort, quick-view pop-up, the product page template, and Concept B's retail/trade mode with
   drawn EAN-13 barcodes and a trade enquiry list. Pure maths lives in core.js. */
(function () {
  'use strict';
  var A = window.ABIN, $ = A.$, $$ = A.$$, core = A.core, data = A.data, text = A.setText;
  var doc = document, html = doc.documentElement;
  var KEY = html.getAttribute('data-store') || 'abin-bag';
  var LIST = core.skus(data), MAP = core.skuMap(data), IDS = LIST.map(function (s) { return s.id; });
  var FLAV = {};
  data.flavours.forEach(function (f) { FLAV[f.id] = f; });
  var SIZE = {};
  data.sizes.forEach(function (z) { SIZE[z.g] = z; });
  var DIET = { vegetarian: 'Vegetarian', vegan: 'Vegan-friendly' };
  var shop = A.shop = {};

  var themeVars = function (el, f) {
    if (!el || !f) return;
    var c = f.color;
    el.style.setProperty('--c', c.pack); el.style.setProperty('--c-pop', c.pop); el.style.setProperty('--c-deep', c.deep);
    el.style.setProperty('--c-tint', c.tint); el.style.setProperty('--c-on', c.on);
    el.setAttribute('data-flavour', f.id);
  };
  shop.themeVars = themeVars;
  var priceText = function (s) { return core.money(s.price) + (s.placeholder ? '*' : ''); };
  var skuFor = function (flavourId, g) { return MAP[flavourId + '-' + g]; };
  var productHref = function (s) { return s.kind === 'bundle' ? 'shop.html#' + s.id : 'product.html?f=' + s.flavour + '&s=' + s.size; };
  shop.productHref = productHref;

  /* ---------------------------------------------------------------- bag */
  var items = [];
  try { items = core.cartParse(localStorage.getItem(KEY), IDS); } catch (e) { items = []; }
  var save = function () { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* private mode */ } };
  var changed = function () {
    save();
    renderBag();
    doc.dispatchEvent(new CustomEvent('abin:bag', { detail: { count: core.cartCount(items) } }));
  };
  A.bag = {
    items: function () { return items.slice(); },
    add: function (id, qty, el) {
      var s = MAP[id];
      if (!s) return;
      items = core.cartAdd(items, id, qty == null ? 1 : qty);
      changed();
      doc.dispatchEvent(new CustomEvent('abin:add', { detail: { id: id, el: el || null, img: s.img } }));
      A.ui.toast('Added ' + (qty > 1 ? qty + ' × ' : '') + s.name + (s.size ? ' ' + s.size + ' g' : '') + ' to your bag');
    },
    set: function (id, qty) { items = core.cartSet(items, id, qty); changed(); },
    remove: function (id) { items = core.cartRemove(items, id); changed(); },
    clear: function () { items = []; changed(); },
    count: function () { return core.cartCount(items); },
    lines: function () { return core.cartLines(items, MAP); }
  };
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) { items = core.cartParse(e.newValue, IDS); renderBag(); }
  });

  var bagMessageOpts = function () {
    var bag = $('#bag');
    var val = function (n) { var f = bag && $('[name="' + n + '"]', bag); return f ? f.value.trim() : ''; };
    return { name: val('bag-name'), area: val('bag-area') };
  };
  var checkoutHref = function () {
    return core.waLink(data.links.waNumber, core.orderMessage(A.bag.lines(), bagMessageOpts()));
  };
  function renderBag() {
    var count = core.cartCount(items), lines = A.bag.lines();
    $$('[data-bag-count]').forEach(function (el) { text(el, count); el.toggleAttribute('data-empty', !count); });
    var bag = $('#bag');
    if (!bag) return;
    var list = $('[data-bag-list]', bag), tpl = $('#tpl-bag-line');
    if (list && tpl) {
      while (list.firstChild) list.removeChild(list.firstChild);
      lines.forEach(function (l) {
        var node = tpl.content.firstElementChild.cloneNode(true);
        node.setAttribute('data-id', l.id);
        var s = MAP[l.id];
        if (s.flavour) themeVars(node, FLAV[s.flavour]);
        var img = $('[data-slot="img"]', node);
        if (img) { img.src = s.kind === 'pack' ? l.img.replace('.webp', '-sm.webp') : l.img; img.alt = l.name; }
        text($('[data-slot="name"]', node), l.name);
        text($('[data-slot="label"]', node), s.size ? s.size + ' g' : l.label);
        text($('[data-slot="unit"]', node), priceText(s));
        text($('[data-slot="total"]', node), core.money(l.total));
        var q = $('[data-slot="qty"]', node);
        if (q) { if ('value' in q && q.tagName === 'INPUT') q.value = l.qty; else text(q, l.qty); }
        list.appendChild(node);
      });
    }
    text($('[data-bag-subtotal]', bag), core.money(core.cartSubtotal(lines)));
    var hasPlaceholder = lines.some(function (l) { return l.placeholder; });
    $$('[data-bag-note]', bag).forEach(function (n) { n.hidden = !hasPlaceholder; });
    $$('[data-bag-empty]', bag).forEach(function (n) { n.hidden = !!count; });
    $$('[data-bag-full]', bag).forEach(function (n) { n.hidden = !count; });
    $$('[data-bag-checkout]', bag).forEach(function (a) { a.href = checkoutHref(); });
    $$('[data-bag-shopee]', bag).forEach(function (a) { a.href = data.links.shopee; });
  }
  doc.addEventListener('input', function (e) {
    if (e.target.closest('#bag') && /^bag-/.test(e.target.name || '')) $$('#bag [data-bag-checkout]').forEach(function (a) { a.href = checkoutHref(); });
  });
  doc.addEventListener('click', function (e) {
    var t = e.target.closest('[data-add],[data-bag-step],[data-bag-remove],[data-bag-clear]');
    if (!t) return;
    if (t.hasAttribute('data-add')) {
      e.preventDefault();
      var card = t.closest('[data-sku]');
      var id = t.getAttribute('data-add') || (card && card.getAttribute('data-sku'));
      var qtyEl = card && $('[data-card-qty]', card);
      A.bag.add(id, qtyEl ? Number(qtyEl.value) || 1 : 1, card ? ($('img', card) || card) : t);
      return;
    }
    var line = t.closest('[data-id]'), lid = line && line.getAttribute('data-id');
    if (t.hasAttribute('data-bag-step') && lid) {
      var cur = (items.filter(function (it) { return it.id === lid; })[0] || { qty: 0 }).qty;
      A.bag.set(lid, cur + Number(t.getAttribute('data-bag-step')));
    } else if (t.hasAttribute('data-bag-remove') && lid) {
      A.bag.remove(lid);
    } else if (t.hasAttribute('data-bag-clear')) {
      A.bag.clear();
    }
  });
  doc.addEventListener('change', function (e) {
    var q = e.target.closest('#bag [data-slot="qty"]');
    if (q) { var line = q.closest('[data-id]'); A.bag.set(line.getAttribute('data-id'), q.value); }
  });

  /* -------------------------------------------------------------- cards */
  var fillCard = function (node, s) {
    var f = s.flavour ? FLAV[s.flavour] : null;
    node.setAttribute('data-sku', s.id);
    node.setAttribute('data-kind', s.kind);
    if (f) { themeVars(node, f); node.setAttribute('data-tags', f.tags.join(' ')); } else node.setAttribute('data-flavour', 'bundle');
    var img = $('[data-slot="img"]', node);
    if (img) { img.src = s.kind === 'pack' ? s.img.replace('.webp', '-sm.webp') : s.img; img.alt = s.name + (s.size ? ' ' + s.size + ' g pack' : ''); }
    text($('[data-slot="name"]', node), f ? f.name : data.bundles[0].name);
    text($('[data-slot="full"]', node), s.name);
    text($('[data-slot="label"]', node), s.size ? s.size + ' g' : s.label);
    text($('[data-slot="price"]', node), priceText(s));
    text($('[data-slot="bm"]', node), f ? f.bm : 'Satu setiap perisa');
    text($('[data-slot="tagline"]', node), f ? f.tagline : data.bundles[0].blurb);
    text($('[data-slot="kcal"]', node), f ? f.kcal + ' kcal / 30 g' : '4 flavours');
    text($('[data-slot="diet"]', node), f ? DIET[f.diet] : 'Gift-ready');
    var badge = $('[data-slot="badge"]', node);
    if (badge) { badge.hidden = !(f && f.badge); text(badge, f && f.badge); }
    $$('[data-slot="link"]', node).forEach(function (a) { a.href = productHref(s); });
    $$('[data-quick]', node).forEach(function (b) { b.setAttribute('data-quick', s.id); });
    var sizes = $('[data-size]', node);
    if (sizes) {
      sizes.hidden = s.kind !== 'pack';
      $$('button[data-g]', sizes).forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-g')) === s.size)); });
    }
  };
  shop.renderCards = function (container, skus) {
    var tpl = $('#' + (container.getAttribute('data-template') || 'tpl-card'));
    if (!tpl) return;
    while (container.firstChild) container.removeChild(container.firstChild);
    skus.forEach(function (s, i) {
      var node = tpl.content.firstElementChild.cloneNode(true);
      fillCard(node, s);
      node.style.setProperty('--i', i);
      container.appendChild(node);
    });
    if (A.hydrateIcons) A.hydrateIcons(container);
    container.dispatchEvent(new CustomEvent('abin:cards', { bubbles: true }));
  };
  var initialSkus = function (kind, size) {
    if (kind === 'featured') return data.flavours.map(function (f) { return skuFor(f.id, size); });
    if (kind === 'bundles') return LIST.filter(function (s) { return s.kind === 'bundle'; });
    if (kind === 'packs') return LIST.filter(function (s) { return s.kind === 'pack' && s.size === size; });
    return LIST.slice();
  };
  $$('[data-products]').forEach(function (c) {
    shop.renderCards(c, initialSkus(c.getAttribute('data-products'), Number(c.getAttribute('data-default-size')) || 60));
  });
  doc.addEventListener('click', function (e) {
    var b = e.target.closest('[data-size] button[data-g]');
    if (!b) return;
    e.preventDefault();
    var card = b.closest('[data-sku]'), s = MAP[card.getAttribute('data-sku')];
    var next = s && skuFor(s.flavour, Number(b.getAttribute('data-g')));
    if (next) { fillCard(card, next); card.dispatchEvent(new CustomEvent('abin:size', { bubbles: true })); }
  });

  /* ------------------------------------------------------ filters + sort */
  var applyFilters = function (group) {
    var target = $(group.getAttribute('data-filters'));
    if (!target) return;
    var on = $('[data-filter][aria-pressed="true"]', group);
    var sortEl = $('[data-sort]', group) || $('[data-sort]');
    var skus = core.sortSkus(core.filterSkus(LIST, data, on ? on.getAttribute('data-filter') : 'all'), sortEl ? sortEl.value : 'popular');
    target.classList.add('is-filtering');
    setTimeout(function () {
      shop.renderCards(target, skus);
      target.classList.remove('is-filtering');
      $$('[data-count-shown]').forEach(function (el) { text(el, skus.length + (skus.length === 1 ? ' product' : ' products')); });
      if (A.fx && A.fx.popIn) A.fx.popIn(target.children);
    }, A.env.reduce ? 0 : 180);
  };
  $$('[data-filters]').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]');
      if (!b) return;
      $$('[data-filter]', group).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      applyFilters(group);
    });
    var sel = $('[data-sort]', group);
    if (sel) sel.addEventListener('change', function () { applyFilters(group); });
  });

  /* ---------------------------------------------------------- quick view */
  var quickState = { id: null };
  var fillQuick = function (s) {
    var box = $('#dlg-quick');
    if (!box) return;
    quickState.id = s.id;
    var f = s.flavour ? FLAV[s.flavour] : null, b = data.bundles[0];
    box.style.cssText = '';
    if (f) themeVars(box, f); else box.setAttribute('data-flavour', 'bundle');
    box.setAttribute('data-kind', s.kind);
    var img = $('[data-q="img"]', box);
    if (img) { img.src = s.img; img.alt = s.name + (s.size ? ' ' + s.size + ' g pack' : ''); }
    text($('[data-q="name"]', box), f ? f.name : b.name);
    text($('[data-q="full"]', box), s.name);
    text($('[data-q="bm"]', box), f ? f.bm + ' · ' + f.zh : b.label);
    text($('[data-q="tagline"]', box), f ? f.tagline : 'One of each flavour');
    text($('[data-q="blurb"]', box), f ? f.blurb : b.blurb);
    text($('[data-q="price"]', box), priceText(s));
    text($('[data-q="label"]', box), s.size ? s.size + ' g' : s.label);
    text($('[data-q="kcal"]', box), f ? f.kcal + ' kcal' : '');
    text($('[data-q="daily"]', box), f ? f.daily + '% of daily energy per 30 g' : '');
    text($('[data-q="diet"]', box), f ? DIET[f.diet] : 'Plant-based');
    var badge = $('[data-q="badge"]', box);
    if (badge) { badge.hidden = !(f && f.badge); text(badge, f && f.badge); }
    $$('[data-q-size] button[data-g]', box).forEach(function (btn) {
      btn.hidden = s.kind !== 'pack';
      btn.setAttribute('aria-pressed', String(Number(btn.getAttribute('data-g')) === s.size));
    });
    var sizeWrap = $('[data-q-size]', box);
    if (sizeWrap) sizeWrap.hidden = s.kind !== 'pack';
    var qty = $('[data-q-qty]', box);
    if (qty) qty.value = 1;
    var link = $('[data-q-link]', box);
    if (link) link.href = productHref(s);
    $$('[data-q-shopee]', box).forEach(function (a) { a.href = data.links.shopee; });
    $$('[data-q-note]', box).forEach(function (n) { n.hidden = !s.placeholder; });
  };
  shop.quick = function (id, opener) {
    var s = MAP[id] || (FLAV[id] && skuFor(id, 60));
    if (!s) return;
    fillQuick(s);
    A.ui.open('dlg-quick', opener);
  };
  doc.addEventListener('click', function (e) {
    var t = e.target.closest('[data-quick],[data-q-size] button[data-g],[data-q-step],[data-q-add]');
    if (!t) return;
    e.preventDefault();
    if (t.hasAttribute('data-quick')) { shop.quick(t.getAttribute('data-quick'), t); return; }
    var s = MAP[quickState.id];
    var qty = $('#dlg-quick [data-q-qty]');
    if (t.hasAttribute('data-g') && s) { var n = skuFor(s.flavour, Number(t.getAttribute('data-g'))); if (n) fillQuick(n); return; }
    if (t.hasAttribute('data-q-step') && qty) { qty.value = Math.max(1, Math.min(99, (Number(qty.value) || 1) + Number(t.getAttribute('data-q-step')))); return; }
    if (t.hasAttribute('data-q-add') && s) {
      A.bag.add(s.id, qty ? Math.max(1, Math.min(99, Number(qty.value) || 1)) : 1, $('#dlg-quick [data-q="img"]'));
      A.ui.close();
    }
  });
  var hashQuick = function () {
    var h = decodeURIComponent(location.hash.slice(1));
    if (doc.body.classList.contains('page-shop') && (MAP[h] || FLAV[h])) shop.quick(h);
  };
  window.addEventListener('hashchange', hashQuick);
  setTimeout(hashQuick, 700);

  /* ------------------------------------------------------- EAN-13 drawing */
  shop.drawEan = function (svg, code) {
    var bars = core.eanBars(code);
    if (!svg || !bars) return;
    var NS = 'http://www.w3.org/2000/svg', q = 9, W = 95 + q * 2, H = 62;
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + (H + 12));
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'EAN-13 barcode ' + code);
    var guard = function (i) { return i < 3 || (i >= 45 && i < 50) || i >= 92; };
    for (var i = 0; i < 95; i++) {
      if (bars[i] !== '1') continue;
      var r = doc.createElementNS(NS, 'rect');
      r.setAttribute('x', q + i); r.setAttribute('y', 0); r.setAttribute('width', 1);
      r.setAttribute('height', guard(i) ? H + 5 : H);
      svg.appendChild(r);
    }
    [[2, code[0]], [q + 3 + 21, code.slice(1, 7)], [q + 50 + 21, code.slice(7)]].forEach(function (p) {
      var t = doc.createElementNS(NS, 'text');
      t.setAttribute('x', p[0]); t.setAttribute('y', H + 11);
      t.setAttribute('text-anchor', p[1].length > 1 ? 'middle' : 'start');
      t.textContent = p[1];
      svg.appendChild(t);
    });
  };
  $$('svg[data-ean]').forEach(function (svg) { shop.drawEan(svg, svg.getAttribute('data-ean')); });

  /* -------------------------------------------------------- product page */
  var initProduct = function () {
    if (!doc.body.classList.contains('page-product')) return;
    var r = core.resolveProduct(location.search, data);
    var state = { f: FLAV[r.flavour], g: r.size };
    if (location.search && !r.valid) setTimeout(function () { A.ui.toast('Showing Kali Kali ' + state.f.name + ' ' + state.g + ' g'); }, 900);
    var pp = function (k) { return $$('[data-pp="' + k + '"]'); };
    var draw = function () {
      var f = state.f, s = skuFor(f.id, state.g), z = SIZE[state.g];
      themeVars(html, f);
      doc.title = 'Kali Kali ' + f.name + ' ' + state.g + ' g · ABIN Snack Food';
      var vals = { name: f.name, full: s.name, bm: f.bm, zh: f.zh, word: f.word, tagline: f.tagline, line: f.line, blurb: f.blurb,
        price: priceText(s), label: state.g + ' g', kcal: f.kcal, daily: f.daily + '%', diet: DIET[f.diet], ingredient: f.ingredient,
        barcode: s.barcode, shelf: z.shelfMonths + ' months', carton: z.cartonPacks + ' packs', badge: f.badge || '' };
      Object.keys(vals).forEach(function (k) { pp(k).forEach(function (el) { text(el, vals[k]); }); });
      pp('badge').forEach(function (el) { el.hidden = !f.badge; });
      pp('img').forEach(function (img) { img.src = s.img; img.alt = s.name + ' ' + state.g + ' g pack'; });
      pp('stick').forEach(function (img) { img.src = f.img.stick; });
      pp('orb').forEach(function (img) { img.src = f.img.orb; img.alt = f.ingredient; });
      pp('ingredient-img').forEach(function (img) { img.src = 'assets/img/ingredients/' + f.img.orb.split('/').pop(); img.alt = f.ingredient; });
      pp('clip').forEach(function (v) { if (v.getAttribute('src') !== f.img.clip) { v.src = f.img.clip; v.poster = f.img.clipPoster; } });
      pp('notes').forEach(function (ul) {
        while (ul.firstChild) ul.removeChild(ul.firstChild);
        f.notes.forEach(function (n) { var li = doc.createElement('li'); li.textContent = n; ul.appendChild(li); });
      });
      pp('placeholder').forEach(function (el) { el.hidden = !s.placeholder; });
      $$('svg[data-pp-ean]').forEach(function (svg) { shop.drawEan(svg, s.barcode); });
      $$('[data-pp-size] button[data-g]').forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-g')) === state.g)); });
      $$('[data-pp-add]').forEach(function (b) { b.setAttribute('data-sku', s.id); });
      $$('[data-pp-shopee]').forEach(function (a) { a.href = data.links.shopee; });
      var i = data.flavours.indexOf(f), next = data.flavours[(i + 1) % data.flavours.length];
      $$('[data-pp-next]').forEach(function (a) {
        a.href = 'product.html?f=' + next.id + '&s=' + state.g;
        themeVars(a, next);
        text($('[data-slot="name"]', a), next.name);
        text($('[data-slot="tagline"]', a), next.tagline);
        var im = $('img', a); if (im) { im.src = next.img[60].replace('.webp', '-sm.webp'); im.alt = 'Kali Kali ' + next.name; }
      });
      $$('[data-pp-others]').forEach(function (c) {
        shop.renderCards(c, data.flavours.filter(function (x) { return x.id !== f.id; }).map(function (x) { return skuFor(x.id, 60); }));
      });
      var m = (data.moments || []).filter(function (x) { return x.pair === f.id; })[0];
      $$('[data-pp-moment]').forEach(function (el) {
        el.hidden = !m;
        if (!m) return;
        el.setAttribute('data-info', 'moments:' + m.id);
        text($('[data-slot="time"]', el), m.time + ' ' + m.ampm);
        text($('[data-slot="title"]', el), m.title);
        text($('[data-slot="text"]', el), m.text);
        var im = $('img', el); if (im) { im.src = m.img; im.alt = m.title; }
      });
      html.dispatchEvent(new CustomEvent('abin:product', { bubbles: true, detail: { flavour: f.id, size: state.g } }));
    };
    draw();
    doc.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pp-size] button[data-g]');
      if (b) {
        e.preventDefault();
        state.g = Number(b.getAttribute('data-g'));
        history.replaceState(null, '', 'product.html?f=' + state.f.id + '&s=' + state.g);
        draw();
        return;
      }
      var st = e.target.closest('[data-pp-step]'), qty = $('[data-pp-qty]');
      if (st && qty) { e.preventDefault(); qty.value = Math.max(1, Math.min(99, (Number(qty.value) || 1) + Number(st.getAttribute('data-pp-step')))); return; }
      var add = e.target.closest('[data-pp-add]');
      if (add) { e.preventDefault(); A.bag.add(add.getAttribute('data-sku'), qty ? Math.max(1, Math.min(99, Number(qty.value) || 1)) : 1, $('[data-pp="img"]')); }
    });
  };
  initProduct();

  /* --------------------------------------------- trade mode (Concept B) */
  var ENQ = 'abin-b-enquiry';
  var enquiry = [];
  try { enquiry = core.enquiryParse(sessionStorage.getItem(ENQ), IDS); } catch (e) { enquiry = []; }
  var saveEnquiry = function () {
    try { sessionStorage.setItem(ENQ, core.enquiryString(enquiry)); } catch (e) { /* ignore */ }
    var n = enquiry.reduce(function (t, x) { return t + x.cartons; }, 0);
    $$('[data-enquiry-count]').forEach(function (el) { text(el, n + (n === 1 ? ' carton' : ' cartons')); el.toggleAttribute('data-empty', !n); });
    $$('[data-enquiry-bar]').forEach(function (el) { el.classList.toggle('is-active', n > 0); });
    $$('[data-enquiry-send]').forEach(function (a) { a.href = 'contact.html?enquiry=' + encodeURIComponent(core.enquiryString(enquiry)) + '#trade'; });
    $$('[data-enquiry-list]').forEach(function (ul) {
      while (ul.firstChild) ul.removeChild(ul.firstChild);
      enquiry.forEach(function (x) { var li = doc.createElement('li'); li.textContent = MAP[x.id].label + ' × ' + x.cartons; ul.appendChild(li); });
    });
  };
  shop.enquiry = function () { return enquiry.slice(); };
  var renderTrade = function () {
    var c = $('[data-trade-list]'), tpl = $('#tpl-trade');
    if (!c || !tpl) return;
    while (c.firstChild) c.removeChild(c.firstChild);
    LIST.filter(function (s) { return s.kind === 'pack'; }).forEach(function (s, i) {
      var f = FLAV[s.flavour], z = SIZE[s.size], node = tpl.content.firstElementChild.cloneNode(true);
      node.setAttribute('data-sku', s.id);
      node.style.setProperty('--i', i);
      themeVars(node, f);
      var img = $('[data-slot="img"]', node);
      if (img) { img.src = s.img.replace('.webp', '-sm.webp'); img.alt = s.name + ' ' + s.size + ' g pack'; }
      text($('[data-slot="name"]', node), f.name);
      text($('[data-slot="full"]', node), s.name);
      text($('[data-slot="label"]', node), s.size + ' g');
      text($('[data-slot="barcode"]', node), s.barcode);
      text($('[data-slot="shelf"]', node), z.shelfMonths + ' months');
      text($('[data-slot="carton"]', node), z.cartonPacks + ' packs');
      text($('[data-slot="confirm"]', node), z.confirm ? 'From the 2024 catalogue, to be confirmed' : 'From ABIN’s packaging sheet');
      var svg = $('svg[data-slot="ean"]', node);
      if (svg) shop.drawEan(svg, s.barcode);
      c.appendChild(node);
    });
    if (A.hydrateIcons) A.hydrateIcons(c);
  };
  renderTrade();
  $$('[data-mode]').forEach(function (group) {
    var set = function (mode) {
      html.setAttribute('data-mode', mode);
      $$('button[value]', group).forEach(function (b) { b.setAttribute('aria-pressed', String(b.value === mode)); });
      try { sessionStorage.setItem('abin-b-mode', mode); } catch (e) { /* ignore */ }
      doc.dispatchEvent(new CustomEvent('abin:mode', { detail: { mode: mode } }));
    };
    var start = 'retail';
    try { start = sessionStorage.getItem('abin-b-mode') || (location.hash === '#trade' ? 'trade' : 'retail'); } catch (e) { /* ignore */ }
    if (location.hash === '#trade') start = 'trade';
    set(start);
    group.addEventListener('click', function (e) { var b = e.target.closest('button[value]'); if (b) set(b.value); });
  });
  doc.addEventListener('click', function (e) {
    var t = e.target.closest('[data-t-step],[data-t-add],[data-enquiry-clear]');
    if (!t) return;
    e.preventDefault();
    if (t.hasAttribute('data-enquiry-clear')) { enquiry = []; saveEnquiry(); return; }
    var card = t.closest('[data-sku]'), qty = card && $('[data-t-qty]', card);
    if (t.hasAttribute('data-t-step') && qty) { qty.value = Math.max(1, Math.min(999, (Number(qty.value) || 1) + Number(t.getAttribute('data-t-step')))); return; }
    if (t.hasAttribute('data-t-add') && card) {
      var id = card.getAttribute('data-sku'), n = qty ? Math.max(1, Math.min(999, Number(qty.value) || 1)) : 1;
      enquiry = core.enquiryParse(core.enquiryString(enquiry.concat([{ id: id, cartons: n }])), IDS);
      saveEnquiry();
      A.ui.toast('Added ' + n + ' carton' + (n === 1 ? '' : 's') + ' of ' + MAP[id].label + ' to your enquiry');
      doc.dispatchEvent(new CustomEvent('abin:enquiry', { detail: { id: id, el: $('img', card) } }));
    }
  });
  saveEnquiry();
  renderBag();
}());
