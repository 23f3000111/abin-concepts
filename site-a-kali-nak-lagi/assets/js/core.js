/* ABIN · pure logic shared by both concepts (no DOM).
   Browser: window.ABIN.core · Node tests: globalThis.ABIN.core
   Money, EAN-13 barcodes, SKUs, the bag (cart), WhatsApp / e-mail messages, FAQ search, product URLs, quiz. */
(function (root) {
  'use strict';
  var A = root.ABIN = root.ABIN || {};
  var MAX = 99;

  /* ------------------------------------------------------------ money */
  var cents = function (n) { return Math.round(Number(n) * 100) || 0; };
  var money = function (n) {
    var c = cents(n), neg = c < 0;
    c = Math.abs(c);
    var whole = String(Math.floor(c / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '-' : '') + 'RM ' + whole + '.' + ('0' + (c % 100)).slice(-2);
  };

  /* ---------------------------------------------------------- EAN-13 */
  var eanValid = function (code) {
    var s = String(code == null ? '' : code).trim();
    if (!/^\d{13}$/.test(s)) return false;
    var sum = 0;
    for (var i = 0; i < 12; i++) sum += Number(s[i]) * (i % 2 ? 3 : 1);
    return (10 - (sum % 10)) % 10 === Number(s[12]);
  };
  var L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
  var G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
  var R = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'];
  var PAR = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];
  /* 95 modules ('1' = bar) for drawing a barcode; '' when the code is not a valid EAN-13 */
  var eanBars = function (code) {
    if (!eanValid(code)) return '';
    var s = String(code).trim(), p = PAR[Number(s[0])], out = '101', i;
    for (i = 1; i <= 6; i++) out += (p[i - 1] === 'L' ? L : G)[Number(s[i])];
    out += '01010';
    for (i = 7; i <= 12; i++) out += R[Number(s[i])];
    return out + '101';
  };

  /* ------------------------------------------------------------- SKUs */
  var skus = function (data) {
    var list = [];
    data.flavours.forEach(function (f) {
      data.sizes.forEach(function (z) {
        list.push({ id: f.id + '-' + z.g, kind: 'pack', flavour: f.id, size: z.g, name: 'Kali Kali ' + f.name,
          label: f.name + ' ' + z.g + ' g', price: z.price, placeholder: !!z.placeholder, barcode: f.barcode[z.g], img: f.img[z.g] });
      });
    });
    (data.bundles || []).forEach(function (b) {
      list.push({ id: b.id, kind: 'bundle', flavour: null, size: null, name: 'Kali Kali ' + b.name, label: b.label,
        price: b.price, placeholder: !!b.placeholder, barcode: null, img: b.img });
    });
    return list;
  };
  var skuMap = function (data) {
    var m = {};
    skus(data).forEach(function (s) { m[s.id] = s; });
    return m;
  };

  /* -------------------------------------------------------------- bag */
  var clamp = function (q) {
    q = Math.floor(Number(q));
    return isFinite(q) && q > 0 ? Math.min(MAX, q) : 0;
  };
  var copy = function (items) { return (items || []).map(function (it) { return { id: it.id, qty: it.qty }; }); };
  var cartAdd = function (items, id, qty) {
    var add = qty == null ? 1 : clamp(qty), out = copy(items), hit = false;
    if (!id || !add) return out;
    out.forEach(function (it) { if (it.id === id) { it.qty = clamp(it.qty + add); hit = true; } });
    if (!hit) out.push({ id: id, qty: add });
    return out;
  };
  var cartSet = function (items, id, qty) {
    var q = clamp(qty);
    return copy(items).map(function (it) { if (it.id === id) it.qty = q; return it; })
      .filter(function (it) { return it.qty > 0; });
  };
  var cartRemove = function (items, id) { return copy(items).filter(function (it) { return it.id !== id; }); };
  var cartCount = function (items) { return (items || []).reduce(function (n, it) { return n + it.qty; }, 0); };
  /* storage can hold anything (old versions, hand edits): keep only known ids with a usable quantity */
  var cartParse = function (raw, validIds) {
    var arr;
    try { arr = JSON.parse(raw); } catch (e) { return []; }
    if (!Array.isArray(arr)) return [];
    var out = [];
    arr.forEach(function (it) {
      if (!it || typeof it.id !== 'string') return;
      if (validIds && validIds.indexOf(it.id) === -1) return;
      var q = clamp(it.qty);
      if (q) out = cartAdd(out, it.id, q);
    });
    return out;
  };
  var cartLines = function (items, map) {
    return (items || []).filter(function (it) { return map[it.id]; }).map(function (it) {
      var s = map[it.id];
      return { id: it.id, kind: s.kind, size: s.size, name: s.name, label: s.label, img: s.img, qty: it.qty,
        unit: s.price, total: cents(s.price) * it.qty / 100, placeholder: s.placeholder };
    });
  };
  var cartSubtotal = function (lines) {
    return (lines || []).reduce(function (c, l) { return c + cents(l.total); }, 0) / 100;
  };

  /* --------------------------------------------------------- messages */
  var waLink = function (number, text) {
    return 'https://wa.me/' + String(number || '').replace(/\D/g, '') + (text ? '?text=' + encodeURIComponent(text) : '');
  };
  var mailtoLink = function (to, subject, body) {
    return 'mailto:' + to + '?subject=' + encodeURIComponent(subject || '') + '&body=' + encodeURIComponent(body || '');
  };
  var lineName = function (l) { return l.size ? l.name + ' ' + l.size + ' g' : l.name + ' (' + l.label + ')'; };
  var orderMessage = function (lines, o) {
    o = o || {};
    var rows = ['Hi ABIN! I would like to order Kali Kali:', ''];
    lines.forEach(function (l) { rows.push('• ' + l.qty + ' × ' + lineName(l) + ' — ' + money(l.total)); });
    rows.push('', 'Subtotal: ' + money(cartSubtotal(lines)));
    if (o.name) rows.push('Name: ' + o.name);
    if (o.area) rows.push('Deliver to: ' + o.area);
    if (o.note) rows.push('Note: ' + o.note);
    rows.push('', '(Sent from the ABIN website)');
    return rows.join('\n');
  };
  var field = function (rows, label, v) { if (v) rows.push(label + ': ' + v); };
  var tradeMessage = function (f) {
    var rows = ['Hi ABIN, this is a trade enquiry for Kali Kali.', ''];
    field(rows, 'Business', f.business);
    field(rows, 'Type', f.type);
    field(rows, 'Location', f.location);
    if (f.items && f.items.length) {
      rows.push('Interested in:');
      f.items.forEach(function (i) { rows.push('• ' + i.label + ' × ' + i.cartons + ' carton' + (Number(i.cartons) === 1 ? '' : 's')); });
    }
    field(rows, 'Contact', [f.name, f.phone, f.email].filter(Boolean).join(', '));
    field(rows, 'Notes', f.note);
    return rows.join('\n');
  };
  var affiliateMessage = function (f) {
    var rows = ['Hi ABIN! I would like to join the Kali Kali affiliate programme (15% commission).', ''];
    field(rows, 'Name', f.name);
    field(rows, 'Platform', f.platform);
    field(rows, 'Handle', f.handle);
    field(rows, 'Followers', f.followers);
    field(rows, 'Phone', f.phone);
    return rows.join('\n');
  };
  var helloMessage = function (f) {
    var rows = ['Hi ABIN!', ''];
    field(rows, 'Name', f.name);
    if (f.message) rows.push('', f.message);
    return rows.join('\n');
  };

  /* ------------------------------------------------------- FAQ search */
  var normalize = function (s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9%一-鿿]+/g, ' ').trim();
  };
  var faqSearch = function (faqs, query, cat) {
    var words = normalize(query).split(' ').filter(Boolean);
    return (faqs || []).filter(function (f) {
      if (cat && cat !== 'all' && f.cat !== cat) return false;
      var hay = normalize(f.q + ' ' + f.a);
      return words.every(function (w) { return hay.indexOf(w) > -1; });
    });
  };

  /* ------------------------------------------------ product page + quiz */
  var resolveProduct = function (search, data) {
    var p = new URLSearchParams(search || ''), f = p.get('f'), s = Number(p.get('s'));
    var fl = data.flavours.filter(function (x) { return x.id === f; })[0];
    var sizes = data.sizes.map(function (z) { return z.g; });
    var okSize = sizes.indexOf(s) > -1;
    return { flavour: fl ? fl.id : data.flavours[0].id, size: okSize ? s : sizes[sizes.length - 1], valid: !!fl && okSize };
  };
  var quizResult = function (picks, data) {
    var score = {};
    data.flavours.forEach(function (f) { score[f.id] = 0; });
    (picks || []).forEach(function (p) {
      Object.keys(p || {}).forEach(function (k) { if (k in score) score[k] += Number(p[k]) || 0; });
    });
    return data.flavours.reduce(function (best, f) { return score[f.id] > score[best] ? f.id : best; }, data.flavours[0].id);
  };

  A.core = {
    money: money, eanValid: eanValid, eanBars: eanBars, skus: skus, skuMap: skuMap,
    cartAdd: cartAdd, cartSet: cartSet, cartRemove: cartRemove, cartCount: cartCount, cartParse: cartParse,
    cartLines: cartLines, cartSubtotal: cartSubtotal, waLink: waLink, mailtoLink: mailtoLink,
    orderMessage: orderMessage, tradeMessage: tradeMessage, affiliateMessage: affiliateMessage, helloMessage: helloMessage,
    normalize: normalize, faqSearch: faqSearch, resolveProduct: resolveProduct, quizResult: quizResult
  };
}(typeof window !== 'undefined' ? window : globalThis));
