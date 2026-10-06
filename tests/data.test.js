// Content checks for shared/js/data.js: facts from the packs, filled collections, and every asset path existing
// in both site folders. Run from the project root: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
delete globalThis.ABIN;
require(path.join(ROOT, 'shared', 'js', 'data.js'));
const { data } = globalThis.ABIN;
const SITES = ['site-a-kali-nak-lagi', 'site-b-jagung-rangup'];

test('four flavours with the facts from the packs', () => {
  assert.deepEqual(data.flavours.map((f) => f.id), ['spicy', 'cheese', 'original', 'seaweed']);
  assert.deepEqual(data.flavours.map((f) => f.kcal), [158, 167, 174, 162]);
  assert.deepEqual(data.flavours.map((f) => f.daily), [8, 8, 9, 8]);
  assert.deepEqual(data.flavours.map((f) => f.diet), ['vegetarian', 'vegetarian', 'vegan', 'vegan']);
  for (const f of data.flavours) {
    for (const k of ['name', 'bm', 'zh', 'word', 'tagline', 'blurb']) assert.ok(f[k], `${f.id}.${k}`);
    for (const k of ['pack', 'pop', 'deep', 'tint', 'on']) assert.match(f.color[k], /^#[0-9A-F]{6}$/i, `${f.id}.color.${k}`);
  }
});

test('sizes, prices and placeholders', () => {
  assert.deepEqual(data.sizes.map((s) => s.g), [30, 60]);
  assert.equal(data.sizes[1].price, 8.9);
  assert.equal(data.sizes[1].placeholder, false);
  assert.equal(data.sizes[0].placeholder, true);
  assert.equal(data.sizes[0].cartonPacks, 36);
  assert.equal(data.sizes[0].shelfMonths, 18);
});

test('content collections are filled', () => {
  assert.equal(data.claims.length, 6);
  assert.equal(data.certs.length, 4);
  assert.ok(data.faqs.length >= 14);
  assert.deepEqual([...new Set(data.faqs.map((f) => f.cat))].sort(), ['affiliate', 'diet', 'order', 'product', 'trade']);
  assert.equal(data.quiz.length, 3);
  for (const q of data.quiz) assert.equal(q.options.length, 3);
  assert.equal(data.moments.length, 4);
  assert.equal(data.channels.length, 5);
  assert.equal(data.expos.length, 5);
  assert.ok(data.reviews.length >= 6);
  assert.ok(data.reviews.every((r) => r.sample === true), 'reviews are marked as samples');
  assert.equal(data.media.reels.length, 6);
});

for (const site of SITES) {
  test(`[${site}] every asset path in data exists`, () => {
    const paths = [];
    const walk = (v) => {
      if (typeof v === 'string' && /^assets\//.test(v)) paths.push(v);
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk(data);
    assert.ok(paths.length > 30);
    for (const p of paths) assert.ok(fs.existsSync(path.join(ROOT, site, p)), `${site}: missing ${p}`);
  });
}
