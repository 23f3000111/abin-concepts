// Unit tests for the DOM-free logic shared by both concepts (shared/js/core.js).
// Run from the project root: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

function load() {
  delete globalThis.ABIN;
  for (const f of ['data.js', 'core.js']) {
    const p = path.join(__dirname, '..', 'shared', 'js', f);
    delete require.cache[require.resolve(p)];
    require(p);
  }
  return globalThis.ABIN;
}
const { core, data } = load();
const decodeWa = (href) => decodeURIComponent(href.split('?text=')[1]);

test('money formats ringgit with two decimals and thousands separators', () => {
  assert.equal(core.money(8.9), 'RM 8.90');
  assert.equal(core.money(0), 'RM 0.00');
  assert.equal(core.money(0.1 + 0.2), 'RM 0.30');
  assert.equal(core.money(1234.5), 'RM 1,234.50');
});

test('eanValid accepts the real ABIN barcodes and rejects bad ones', () => {
  for (const c of ['9555083708110', '9555083708103', '9555083708080', '9555083708097']) assert.ok(core.eanValid(c), c);
  assert.ok(!core.eanValid('9555083708111'));
  assert.ok(!core.eanValid('95550837081'));
  assert.ok(!core.eanValid('abc'));
  assert.ok(!core.eanValid(null));
});

test('eanBars produces a 95-module pattern that decodes back to the code', () => {
  const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
  const G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
  const R = L.map((s) => s.replace(/./g, (b) => (b === '0' ? '1' : '0')));
  const PAR = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];
  const code = '9555083708110';
  const bars = core.eanBars(code);
  assert.equal(bars.length, 95);
  assert.equal(bars.slice(0, 3), '101');
  assert.equal(bars.slice(45, 50), '01010');
  assert.equal(bars.slice(92), '101');
  let parity = '';
  let left = '';
  let right = '';
  for (let i = 0; i < 6; i++) {
    const chunk = bars.slice(3 + i * 7, 10 + i * 7);
    if (L.includes(chunk)) { parity += 'L'; left += L.indexOf(chunk); } else { parity += 'G'; left += G.indexOf(chunk); }
    right += R.indexOf(bars.slice(50 + i * 7, 57 + i * 7));
  }
  assert.equal(String(PAR.indexOf(parity)) + left + right, code);
  assert.equal(core.eanBars('123'), '');
});

test('skus builds 8 packs + bundles with unique ids, prices and valid barcodes', () => {
  const list = core.skus(data);
  assert.equal(list.filter((s) => s.kind === 'pack').length, 8);
  assert.equal(new Set(list.map((s) => s.id)).size, list.length);
  const s60 = list.find((s) => s.id === 'spicy-60');
  assert.equal(s60.price, 8.9);
  assert.equal(s60.label, 'Spicy 60 g');
  for (const s of list.filter((x) => x.kind === 'pack')) assert.ok(core.eanValid(s.barcode), s.id);
});

test('cart add merges, clamps to 1..99 and never mutates the input', () => {
  const a = [];
  const b = core.cartAdd(a, 'spicy-30');
  const c = core.cartAdd(b, 'spicy-30', 2);
  assert.deepEqual(a, []);
  assert.deepEqual(c, [{ id: 'spicy-30', qty: 3 }]);
  assert.deepEqual(core.cartAdd(c, 'spicy-30', 500), [{ id: 'spicy-30', qty: 99 }]);
  assert.deepEqual(core.cartAdd(c, 'cheese-60', 0), c);
  assert.deepEqual(core.cartAdd(c, '', 1), c);
});

test('cart set/remove/count', () => {
  let items = core.cartAdd(core.cartAdd([], 'spicy-30', 2), 'cheese-60', 1);
  items = core.cartSet(items, 'spicy-30', 5);
  assert.equal(core.cartCount(items), 6);
  items = core.cartSet(items, 'spicy-30', 0);
  assert.deepEqual(items, [{ id: 'cheese-60', qty: 1 }]);
  assert.deepEqual(core.cartRemove(items, 'cheese-60'), []);
});

test('cartParse survives corrupted storage', () => {
  const ids = ['spicy-30', 'cheese-60'];
  assert.deepEqual(core.cartParse('not json', ids), []);
  assert.deepEqual(core.cartParse(null, ids), []);
  assert.deepEqual(core.cartParse('{"a":1}', ids), []);
  assert.deepEqual(core.cartParse(JSON.stringify([
    { id: 'spicy-30', qty: 2 }, { id: 'spicy-30', qty: '3' }, { id: 'ghost-1', qty: 1 },
    { id: 'cheese-60', qty: -4 }, { id: 'cheese-60', qty: 1e9 }, 'junk', null
  ]), ids), [{ id: 'spicy-30', qty: 5 }, { id: 'cheese-60', qty: 99 }]);
});

test('cart lines and subtotal use exact cents', () => {
  const map = core.skuMap(data);
  const items = [{ id: 'spicy-60', qty: 3 }, { id: 'ghost', qty: 1 }];
  const lines = core.cartLines(items, map);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].total, 26.7);
  assert.equal(lines[0].kind, 'pack');
  assert.equal(lines[0].size, 60);
  assert.equal(core.cartSubtotal(lines), 26.7);
  assert.equal(core.cartSubtotal([]), 0);
});

test('order message lists every line and the subtotal and survives special characters', () => {
  const map = core.skuMap(data);
  const lines = core.cartLines([{ id: 'spicy-60', qty: 2 }, { id: 'seaweed-30', qty: 1 }], map);
  const msg = core.orderMessage(lines, { name: 'Aina & Co #1', area: 'Rawang' });
  assert.match(msg, /2 × Kali Kali Spicy 60 g — RM 17\.80/);
  assert.match(msg, /Subtotal: RM /);
  assert.match(msg, /Name: Aina & Co #1/);
  const url = core.waLink('+60 19-976 1857', msg);
  assert.ok(url.startsWith('https://wa.me/60199761857?text='));
  assert.equal(decodeWa(url), msg);
  assert.equal(core.waLink('60199761857'), 'https://wa.me/60199761857');
});

test('order message names a bundle with its contents label, not a size', () => {
  const map = core.skuMap(data);
  const lines = core.cartLines([{ id: 'variety-4', qty: 1 }], map);
  const msg = core.orderMessage(lines, {});
  assert.match(msg, /1 × Kali Kali Variety 4-pack \(4 × 30 g, one of each\) — RM 16\.90/);
});

test('trade, affiliate and hello messages carry the form details', () => {
  const t = core.tradeMessage({ business: 'Kedai Ali', type: 'Convenience store', location: 'Kepong', name: 'Ali', phone: '012', email: 'a@b.co', items: [{ label: 'Spicy 30 g', cartons: 5 }], note: 'Weekly' });
  for (const s of ['Kedai Ali', 'Convenience store', 'Kepong', 'Spicy 30 g × 5 cartons', 'Weekly']) assert.ok(t.includes(s), s);
  const a = core.affiliateMessage({ name: 'Mei', platform: 'TikTok', handle: '@mei', followers: '12k' });
  assert.match(a, /15% commission/);
  assert.match(a, /@mei/);
  assert.match(core.helloMessage({ name: 'Raj', message: 'Hi!' }), /Raj[\s\S]*Hi!/);
  assert.equal(core.mailtoLink('x@y.z', 'S & T', 'a\nb'), 'mailto:x@y.z?subject=S%20%26%20T&body=a%0Ab');
});

test('faqSearch matches all words across question and answer, ignoring case, accents and hyphens', () => {
  const faqs = [{ cat: 'diet', q: 'Is it gluten-free?', a: 'Yes, made with gluten-free corn.' },
    { cat: 'order', q: 'Where can I buy?', a: 'On Shopée and WhatsApp.' }];
  assert.equal(core.faqSearch(faqs, '').length, 2);
  assert.equal(core.faqSearch(faqs, 'GLUTEN free')[0].cat, 'diet');
  assert.equal(core.faqSearch(faqs, 'shopee')[0].cat, 'order');
  assert.equal(core.faqSearch(faqs, 'gluten shopee').length, 0);
  assert.equal(core.faqSearch(faqs, '', 'order').length, 1);
});

test('resolveProduct falls back to a valid flavour and size', () => {
  assert.deepEqual(core.resolveProduct('?f=cheese&s=30', data), { flavour: 'cheese', size: 30, valid: true });
  assert.deepEqual(core.resolveProduct('?f=banana&s=99', data), { flavour: 'spicy', size: 60, valid: false });
  assert.deepEqual(core.resolveProduct('', data), { flavour: 'spicy', size: 60, valid: false });
});

test('quizResult picks the highest score with flavour order as the tie-break', () => {
  assert.equal(core.quizResult([{ spicy: 2 }, { spicy: 1, seaweed: 1 }, { cheese: 2 }], data), 'spicy');
  assert.equal(core.quizResult([{ cheese: 2 }, { original: 2 }], data), 'cheese');
  assert.equal(core.quizResult([], data), 'spicy');
});

test('filterSkus narrows the shop by flavour, diet, size and bundle', () => {
  const list = core.skus(data);
  const n = (f) => core.filterSkus(list, data, f).length;
  assert.equal(n('all'), 9);
  assert.equal(n('spicy'), 2);
  assert.equal(n('mild'), 6);
  assert.equal(n('vegan'), 4);
  assert.equal(n('30'), 4);
  assert.equal(n('60'), 4);
  assert.equal(n('bundle'), 1);
  assert.equal(n('nonsense'), 9);
  assert.ok(core.filterSkus(list, data, 'vegan').every((s) => ['original', 'seaweed'].includes(s.flavour)));
});

test('sortSkus orders by price both ways and keeps the original order on ties', () => {
  const list = core.skus(data);
  const asc = core.sortSkus(list, 'price-asc').map((s) => s.price);
  assert.deepEqual(asc, [...asc].sort((a, b) => a - b));
  const desc = core.sortSkus(list, 'price-desc');
  assert.equal(desc[0].id, 'variety-4');
  assert.deepEqual(core.sortSkus(list, 'price-asc').filter((s) => s.price === 4.5).map((s) => s.id),
    ['spicy-30', 'cheese-30', 'original-30', 'seaweed-30']);
  assert.deepEqual(core.sortSkus(list, 'popular').map((s) => s.id), list.map((s) => s.id));
  assert.notEqual(core.sortSkus(list, 'price-asc'), list, 'returns a new array');
});

test('trade enquiry list round-trips through the contact page URL and drops junk', () => {
  const ids = core.skus(data).map((s) => s.id);
  const list = core.enquiryParse('spicy-30:5,cheese-30:2,ghost:1,seaweed-60:0,original-30:x,cheese-30:1,spicy-60:5000', ids);
  assert.deepEqual(list, [{ id: 'spicy-30', cartons: 5 }, { id: 'cheese-30', cartons: 3 }, { id: 'spicy-60', cartons: 999 }]);
  assert.equal(core.enquiryString(list), 'spicy-30:5,cheese-30:3,spicy-60:999');
  assert.deepEqual(core.enquiryParse('', ids), []);
  assert.deepEqual(core.enquiryParse(null, ids), []);
});
