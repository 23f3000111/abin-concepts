# ABIN Two Website Concepts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (Native). The user pre-approved the
> design, the spec, this plan and the execution method ("approve all next thing and proceed to development"), and
> did not ask for subagents. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two complete, alternative 7-page websites for ABIN Snack Food (Kali Kali corn sticks) plus a chooser
page: Concept A "Kali Nak Lagi!" (playful flavour-pop) and Concept B "Jagung Rangup" (sharp, premium, light), both with
bloopsbaby-style motion.

**Architecture:** Static HTML/CSS/JS per site, no runtime build. Pages are generated once from per-site layout +
partials + page bodies by a tiny Node script and committed as plain HTML (same output as bloopsbaby's hand-written
pages). DOM-free logic (`core.js`) and content (`data.js`) plus the shared UI glue live in `shared/js/` and are copied
into each site by `tools/sync.js` so each site folder stays self-contained. Motion is per site (`fx.js` + signature
modules) on GSAP 3.13 + ScrollTrigger + SplitText + Lenis.

**Tech Stack:** HTML5, CSS (custom properties, clip-path, container-friendly grid), vanilla JS (classic scripts, ES5-ish
style like bloopsbaby), GSAP 3.13.0, Lenis, Node 20 `node --test`, Python 3.14 (Pillow, rembg, PyMuPDF, OpenCV), ffmpeg 9.

**Spec:** `docs/superpowers/specs/2026-10-06-abin-two-sites-design.md` (read it first; this plan argues from it).

## Global Constraints

- No dark theme anywhere: every section background is light or bright; the darkest allowed backgrounds are flavour
  pack colours on small elements (chips, dots, labels) only.
- Works opened by double-click (`file://`) and over HTTP: classic `<script defer>` only, no `type="module"`, no
  `fetch()` for site data, relative URLs only.
- Vendor: GSAP 3.13.0 (`gsap.min.js`, `ScrollTrigger.min.js`, `SplitText.min.js`) and `lenis.min.js`, copied from
  `../bloopsbaby/site-a-bubble-pop/assets/js/vendor/`.
- Fonts self-hosted woff2. A: Anton, Rubik (400–800), Caveat Brush. B: Archivo (variable wdth/wght), Geist (variable),
  Geist Mono (variable), Instrument Serif (italic).
- Colour tokens exactly as spec §5 (A) and §6 (B).
- Real facts only (spec §3). Every placeholder is marked in data (`placeholder: true` or a `confirm` note) and listed
  in each site README.
- Every animation respects `prefers-reduced-motion: reduce` (no smooth scroll, no pins, no canvas animation, instant
  reveals).
- Pages per site: `index, shop, product, about, benefits, faq, contact`.
- Verified at 1440 × 900 and 390 × 844 with no horizontal page overflow.
- Copy in English with Bahasa Malaysia / 中文 touches; money formatted `RM 8.90`.
- Git: commit after each task on `main`; never commit `ui images/` or the source PDFs; never push without being asked.

## Review Focus

1. **Opened from disk (`file://`)**: navigation, page wipes, bag persistence and videos must work exactly as over HTTP.
   Pinned by `tests/pages.test.js` (no module scripts, no `fetch(`, all local references resolve) and a file:// smoke
   check in Task 16.
2. **Bad product URL** (`product.html?f=banana&s=99` or no query): show a valid default flavour/size, never a blank
   page. Pinned by `resolveProduct` tests in Task 2.
3. **Corrupted or stale bag storage** (invalid JSON, unknown SKU ids, qty 0/negative/1e9/strings, duplicates): the bag
   sanitises and renders. Pinned by `cartParse` tests in Task 2.
4. **Rapid clicks**: double-clicking a nav link mid-wipe, spamming flavour tabs, opening a dialog while another is
   closing: no stuck overlay, no locked scroll. Pinned by guard flags in `fx.js`/`ui.js` and the Task 16 rapid-click
   check.
5. **Phone width and touch** (390 px): no horizontal overflow on any page; hover-only effects (video hover-play,
   crunch-on-hover, channel hover image, ring cursor) have tap or in-view equivalents or are disabled. Pinned by the
   Task 16 overflow sweep on all 14 pages.

---

## File map

```
tools/pages.js            page generator (layout + partials + page bodies → static HTML)
tools/sync.js             copies shared/js → site-*/assets/js
tools/assets.py           image/video/PDF pipeline → site-*/assets/{img,video,docs}
tools/fonts.py            downloads woff2 files from Google Fonts into each site
shared/js/vendor/*        GSAP 3.13 + Lenis (from bloopsbaby)
shared/js/data.js         content (spec §3) → ABIN.data
shared/js/core.js         pure logic → ABIN.core
shared/js/icons.js        inline SVG icons → ABIN.icon(name), [data-icon] hydration
shared/js/ui.js           $, $$, dialogs, lightbox, info pop-ups, toasts, menu, hover-play video
shared/js/shop.js         bag store + drawer, product cards, filters, quick view, product page, trade mode
shared/js/forms.js        contact/trade/affiliate forms, FAQ list + search, quiz
src/site-a/layout.html, src/site-a/partials/*.html, src/site-a/pages/*.html
src/site-b/layout.html, src/site-b/partials/*.html, src/site-b/pages/*.html
site-a-kali-nak-lagi/{7 pages}.html, assets/css/{base,chrome,pages}.css,
  assets/js/{fx,crunch,scenes}.js (+ synced shared files), assets/fonts, assets/img, assets/video
site-b-jagung-rangup/{7 pages}.html, assets/css/{base,chrome,pages}.css,
  assets/js/{fx,travel,scenes}.js (+ synced shared files), assets/fonts, assets/img, assets/video, assets/docs
index.html, assets/ (chooser)   README.md, site-*/README.md, site-*/CREDITS.md
tests/core.test.js tests/data.test.js tests/pages.test.js tests/sync.test.js
```

---

### Task 1: Scaffold, vendor, page generator, sync

**Files:**
- Create: `tools/pages.js`, `tools/sync.js`, `shared/js/vendor/{gsap.min.js,ScrollTrigger.min.js,SplitText.min.js,lenis.min.js}`,
  `src/site-a/layout.html`, `src/site-a/partials/scripts.html`, `src/site-a/pages/index.html` (stub),
  same three for `src/site-b/`
- Test: `tests/pages.test.js`, `tests/sync.test.js`

**Interfaces:**
- Produces: `require('../tools/pages.js')` → `{ SITES, parsePage(raw) → {meta, body}, render(layout, partials, page, name) → string, build(key) → string[] }`;
  `require('../tools/sync.js')` → `{ SHARED_FILES, sync() → string[] }`.
- Page body files start with `<!--{json meta}-->`. Meta keys: `title`, `description`, `bodyClass`, `nav`, `scripts` (array of site-specific script names without `.js`).
- Layout placeholders: `{{> partialName}}`, `{{title}}`, `{{description}}`, `{{bodyClass}}`, `{{page}}`, `{{content}}`, `{{scripts}}`.
- Nav links carry `data-nav="shop"`; the generator adds `aria-current="page"` for the current page.

- [ ] **Step 1: Write failing tests** — `tests/pages.test.js`

```js
// Generator + built-page integrity. Run: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const gen = require('../tools/pages.js');
const ROOT = path.join(__dirname, '..');

test('parsePage reads the JSON meta comment and the body', () => {
  const p = gen.parsePage('<!--{"title":"Shop","nav":"shop"}-->\n<section>hi</section>');
  assert.equal(p.meta.title, 'Shop');
  assert.equal(p.meta.nav, 'shop');
  assert.equal(p.body.trim(), '<section>hi</section>');
});

test('render fills partials, meta (escaped), content, scripts and marks the current nav link', () => {
  const layout = '<title>{{title}}</title>{{> header}}<main id="main">{{content}}</main>{{scripts}}';
  const partials = { header: '<a data-nav="home" href="index.html">Home</a><a data-nav="shop" href="shop.html">Shop</a>' };
  const html = gen.render(layout, partials, { meta: { title: 'Shop & "more"', nav: 'shop', scripts: ['crunch'] }, body: '<p>x</p>' }, 'shop');
  assert.match(html, /<title>Shop &amp; &quot;more&quot;<\/title>/);
  assert.match(html, /data-nav="shop" aria-current="page"/);
  assert.doesNotMatch(html, /data-nav="home" aria-current/);
  assert.match(html, /<main id="main"><p>x<\/p><\/main>/);
  assert.match(html, /<script defer src="assets\/js\/crunch\.js"><\/script>/);
});

test('render fails loudly on an unknown partial', () => {
  assert.throws(() => gen.render('{{> nope}}', {}, { meta: {}, body: '' }, 'x'), /Unknown partial: nope/);
});

for (const [key, dir] of Object.entries(gen.SITES)) {
  const srcPages = path.join(ROOT, 'src', key, 'pages');
  if (!fs.existsSync(srcPages)) continue;
  for (const file of fs.readdirSync(srcPages).filter((f) => f.endsWith('.html'))) {
    const out = path.join(ROOT, dir, file);
    test(`[${dir}] ${file} is built, has one h1, a main and only resolvable local references`, () => {
      assert.ok(fs.existsSync(out), `missing ${out} (run: node tools/pages.js)`);
      const html = fs.readFileSync(out, 'utf8');
      assert.equal(gen.renderFile(key, file), html, 'stale page (run: node tools/pages.js)');
      assert.match(html, /<title>[^<]+<\/title>/);
      assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, 'exactly one <h1>');
      assert.match(html, /<main id="main"/);
      assert.doesNotMatch(html, /type="module"/);
      const refs = [...html.matchAll(/\s(?:src|href|poster|data-src|data-img|data-lightbox)="([^"]+)"/g)].map((m) => m[1]);
      for (const ref of refs) {
        if (/^(https?:|mailto:|tel:|#|javascript:|data:|\{)/.test(ref)) continue;
        const clean = decodeURI(ref.split('#')[0].split('?')[0]);
        if (!clean) continue;
        assert.ok(fs.existsSync(path.join(ROOT, dir, clean)), `${file}: missing local file ${ref}`);
      }
    });
  }
}

test('no site script uses fetch() or ES modules (file:// safe)', () => {
  for (const dir of Object.values(gen.SITES)) {
    const js = path.join(ROOT, dir, 'assets', 'js');
    if (!fs.existsSync(js)) continue;
    for (const f of fs.readdirSync(js).filter((n) => n.endsWith('.js'))) {
      const src = fs.readFileSync(path.join(js, f), 'utf8');
      assert.doesNotMatch(src, /\bfetch\(/, `${dir}/${f} uses fetch`);
      assert.doesNotMatch(src, /^\s*(import|export)\s/m, `${dir}/${f} uses ES modules`);
    }
  }
});
```

`tests/sync.test.js`

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { SHARED_FILES } = require('../tools/sync.js');
const { SITES } = require('../tools/pages.js');
const ROOT = path.join(__dirname, '..');

for (const dir of Object.values(SITES)) {
  for (const rel of SHARED_FILES) {
    test(`[${dir}] ${rel} matches shared/js (run: node tools/sync.js)`, () => {
      const a = fs.readFileSync(path.join(ROOT, 'shared', 'js', rel));
      const b = fs.readFileSync(path.join(ROOT, dir, 'assets', 'js', rel));
      assert.ok(a.equals(b));
    });
  }
}
```

- [ ] **Step 2: Run to verify failure** — `node --test tests/` → FAIL: `Cannot find module '../tools/pages.js'`.

- [ ] **Step 3: Implement `tools/pages.js`**

```js
// Static page generator. Edit src/<site>/..., then run: node tools/pages.js
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
const SITES = { 'site-a': 'site-a-kali-nak-lagi', 'site-b': 'site-b-jagung-rangup' };
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function parsePage(raw) {
  const m = raw.match(/^\s*<!--(\{[\s\S]*?\})-->\s*/);
  return { meta: m ? JSON.parse(m[1]) : {}, body: m ? raw.slice(m[0].length) : raw };
}

function render(layout, partials, page, name) {
  const meta = Object.assign({ page: name.replace(/\.html$/, ''), nav: name.replace(/\.html$/, '') }, page.meta);
  let html = layout;
  for (let depth = 0; depth < 6 && /\{\{>\s*[\w-]+\s*\}\}/.test(html); depth++) {
    html = html.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, p) => {
      if (!(p in partials)) throw new Error('Unknown partial: ' + p);
      return partials[p];
    });
  }
  const scripts = (meta.scripts || []).map((s) => `<script defer src="assets/js/${s}.js"></script>`).join('\n');
  html = html.replace('{{content}}', () => page.body).replace('{{scripts}}', () => scripts);
  html = html.replace(/\{\{(\w+)\}\}/g, (_, k) => esc(meta[k]));
  return html.replace(new RegExp(`data-nav="${meta.nav}"`, 'g'), `data-nav="${meta.nav}" aria-current="page"`);
}

function load(key) {
  const base = path.join(ROOT, 'src', key);
  const partials = {};
  const pdir = path.join(base, 'partials');
  if (fs.existsSync(pdir)) for (const f of fs.readdirSync(pdir)) if (f.endsWith('.html')) partials[f.slice(0, -5)] = fs.readFileSync(path.join(pdir, f), 'utf8');
  return { base, partials, layout: fs.readFileSync(path.join(base, 'layout.html'), 'utf8') };
}

function renderFile(key, file) {
  const { base, partials, layout } = load(key);
  return render(layout, partials, parsePage(fs.readFileSync(path.join(base, 'pages', file), 'utf8')), file);
}

function build(key) {
  const out = [];
  for (const f of fs.readdirSync(path.join(ROOT, 'src', key, 'pages')).filter((n) => n.endsWith('.html'))) {
    const dest = path.join(ROOT, SITES[key], f);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, renderFile(key, f));
    out.push(path.relative(ROOT, dest));
  }
  return out;
}

module.exports = { SITES, parsePage, render, renderFile, build };
if (require.main === module) for (const k of Object.keys(SITES)) console.log(build(k).join('\n'));
```

`tools/sync.js`

```js
// Copies the shared scripts into each self-contained site. Run: node tools/sync.js
const fs = require('node:fs');
const path = require('node:path');
const { SITES } = require('./pages.js');
const ROOT = path.join(__dirname, '..');
const SHARED_FILES = ['data.js', 'core.js', 'icons.js', 'ui.js', 'shop.js', 'forms.js',
  'vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js', 'vendor/SplitText.min.js', 'vendor/lenis.min.js'];

function sync() {
  const done = [];
  for (const dir of Object.values(SITES)) for (const rel of SHARED_FILES) {
    const from = path.join(ROOT, 'shared', 'js', rel);
    if (!fs.existsSync(from)) continue;
    const to = path.join(ROOT, dir, 'assets', 'js', rel);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
    done.push(path.relative(ROOT, to));
  }
  return done;
}
module.exports = { SHARED_FILES, sync };
if (require.main === module) console.log(sync().join('\n'));
```

Copy vendor: `cp ../bloopsbaby/site-a-bubble-pop/assets/js/vendor/* shared/js/vendor/`.
Stub layouts/partials/pages: a minimal `layout.html` with `<html lang="en" class="no-js" data-page="{{page}}">`,
`<title>{{title}}</title>`, `<main id="main">{{content}}</main>`, `{{> scripts}}{{scripts}}`; `scripts.html` lists the
shared scripts in load order (vendor → data → core → icons → ui → shop → forms → fx); stub `index.html` with one `<h1>`.
Create empty placeholder files for every shared script (`// placeholder, filled in Task 2/4`) so sync and the
reference check pass.

- [ ] **Step 4: Run** `node tools/sync.js && node tools/pages.js && node --test tests/` → PASS.
- [ ] **Step 5: Commit** `git add tools shared src site-a-kali-nak-lagi site-b-jagung-rangup tests && git commit -m "chore: scaffold sites, page generator and shared script sync"`

---

### Task 2: Content (`data.js`) and pure logic (`core.js`), test-first

**Files:**
- Create: `shared/js/data.js`, `shared/js/core.js`
- Test: `tests/core.test.js`, `tests/data.test.js`

**Interfaces:**
- Produces `ABIN.data` (schema below) and `ABIN.core`:
  `money(n) → 'RM 8.90'`, `eanValid(code) → bool`, `eanBars(code) → 95-char '0/1' string or ''`,
  `skus(data) → Sku[]` where `Sku = {id:'spicy-30', kind:'pack'|'bundle', flavour, size, name, label, price, placeholder, barcode, img}`,
  `skuMap(data) → {id: Sku}`, `cartAdd(items, id, qty=1) → items`, `cartSet(items, id, qty) → items`,
  `cartRemove(items, id) → items`, `cartCount(items) → n`, `cartParse(raw, validIds) → items`,
  `cartLines(items, map) → Line[]` (`{id,name,label,qty,unit,total}`), `cartSubtotal(lines) → number`,
  `waLink(number, text) → url`, `mailtoLink(to, subject, body) → url`, `orderMessage(lines, opts) → string`,
  `tradeMessage(form) → string`, `affiliateMessage(form) → string`, `helloMessage(form) → string`,
  `normalize(s) → string`, `faqSearch(faqs, query, cat) → faqs`, `resolveProduct(search, data) → {flavour, size, valid}`,
  `quizResult(picks, data) → flavourId`. Items are `{id, qty}` arrays and are never mutated.
- Both files attach to `(typeof window !== 'undefined' ? window : globalThis).ABIN`.

`data.js` schema (values from spec §3; prices marked placeholder except 60 g):

```js
(function (root) {
  'use strict';
  var A = root.ABIN = root.ABIN || {};
  A.data = {
    brand: { name: 'ABIN Snack Food', legal: 'ABIN Manufacturing Sdn. Bhd.', reg: '202401028301 (1574148-D)',
      product: 'Kali Kali Crunchy Corn Stick', address: ['No. 22 (Ground Floor), Jalan BJ 2', 'Taman Perindustrian Belmas Johan', '48000 Rawang, Selangor, Malaysia'],
      phone: '+60 19-976 1857', email: 'abinsnackfood@gmail.com', areas: ['Kuala Lumpur', 'Kepong', 'Petaling Jaya', 'Puchong'] },
    links: { shopee: 'https://shopee.com.my/abin_snack', whatsapp: 'https://wa.me/message/GPFMZ6A6OSM6G1', waNumber: '60199761857',
      facebook: 'https://www.facebook.com/profile.php?id=100068376395220', instagram: 'https://www.instagram.com/abin_snackfood/',
      tiktok: 'https://www.tiktok.com/@abinsnackfood', linkedin: 'https://www.linkedin.com/in/abin-corn-stick-559017340',
      xiaohongshu: 'https://www.xiaohongshu.com/user/profile/652f81d1000000002a028840', lemon8: 'https://s.lemon8-app.com/s/GgUMFmFwb',
      linktree: 'https://linktr.ee/aBinCornStick', map: 'https://www.google.com/maps/search/?api=1&query=ABIN+Snack+Food+Jalan+BJ+2+Taman+Perindustrian+Belmas+Johan+Rawang' },
    stats: { dailyKg: 90, dailyUnits: 1500, recommendPct: 98, reviewCount: 28, followers: '3.4K', expos: 5, flavours: 4 },
    sizes: [ { g: 30, shelfMonths: 18, cartonPacks: 36, price: 4.5, placeholder: true },
             { g: 60, shelfMonths: 12, cartonPacks: 20, price: 8.9, placeholder: false, confirm: '60 g shelf life, carton and barcodes are from the 2024 catalogue' } ],
    flavours: [
      { id: 'spicy', name: 'Spicy', bm: 'Pedas', zh: '香辣味', word: 'PEDAS', tagline: 'Bold & exciting', line: 'Rangup, pedas, ketagih!',
        blurb: 'Golden corn sticks rolled in a chilli seasoning that builds with every bite. Our best seller.',
        kcal: 158, daily: 8, diet: 'vegetarian', badge: 'Best seller', heat: 3, tags: ['spicy', 'vegetarian'],
        color: { pack: '#8E1B1B', pop: '#E8402A', deep: '#9E1C1C', tint: '#F6DCD6', on: '#FFFFFF' },
        barcode: { 30: '9555083708103', 60: '9555083708202' }, ingredient: 'Red chilli',
        img: { 30: 'assets/img/packs/spicy-30.webp', 60: 'assets/img/packs/spicy-60.webp', stick: 'assets/img/sticks/stick-spicy.webp',
               orb: 'assets/img/orbs/chilli.webp', clip: 'assets/video/flavour-spicy.mp4', clipPoster: 'assets/video/flavour-spicy.jpg' } }
      /* cheese, original, seaweed: same keys, values from spec §3 (kcal 167/174/162, daily 8/9/8, diet vegetarian/vegan/vegan,
         badge —/—/'Signature', heat 0, words KEJU/ASLI/RUMPAI LAUT, colours from spec §5/§6) */
    ],
    bundles: [ { id: 'variety-4', name: 'Variety 4-pack', label: '4 × 30 g, one of each', price: 16.9, placeholder: true,
                 img: 'assets/img/packs/variety.webp', contains: ['spicy-30', 'cheese-30', 'original-30', 'seaweed-30'] } ],
    claims: [ /* {id, title, bm, short, long, icon} × plant, gluten, preservatives, transfat, nongmo, halal */ ],
    certs: [ /* {id, title, body, short, long} × halal, mesti, myipo, produk */ ],
    faqs: [ /* {cat: 'product'|'diet'|'order'|'trade'|'affiliate', q, a} — 14+ entries from spec §3 facts */ ],
    quiz: [ /* 3 questions × 3 options, each option {label, sub, score: {spicy: n, ...}} */ ],
    moments: [ /* {id, time, title, text, pair: flavourId, img, video} × lunchbox, 3pm, afterschool, gamenight */ ],
    channels: [ /* {id, title, text, img} × supermarkets, convenience, horeca, gifts, export */ ],
    expos: [ /* {year, name, place} × 5 */ ],
    reviews: [ /* {name, place, flavour, stars, text, sample: true} × 6 */ ],
    media: { reels: [ /* {src, poster, title} × 6 */ ], posters: [ /* {src, alt} */ ], shelves: [ /* {src, alt} */ ] }
  };
}(typeof window !== 'undefined' ? window : globalThis));
```

- [ ] **Step 1: Write failing tests** — `tests/core.test.js`

```js
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
  const L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
  const G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];
  const R = L.map((s) => s.replace(/./g, (b) => (b === '0' ? '1' : '0')));
  const PAR = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];
  const code = '9555083708110';
  const bars = core.eanBars(code);
  assert.equal(bars.length, 95);
  assert.equal(bars.slice(0, 3), '101');
  assert.equal(bars.slice(45, 50), '01010');
  assert.equal(bars.slice(92), '101');
  let parity = '', left = '', right = '';
  for (let i = 0; i < 6; i++) {
    const chunk = bars.slice(3 + i * 7, 10 + i * 7);
    if (L.includes(chunk)) { parity += 'L'; left += L.indexOf(chunk); } else { parity += 'G'; left += G.indexOf(chunk); }
    right += R.indexOf(bars.slice(50 + i * 7, 57 + i * 7));
  }
  assert.equal(String(PAR.indexOf(parity)) + left + right, code);
  assert.equal(core.eanBars('123'), '');
});

test('skus builds 8 packs + bundles with unique ids, prices and valid 30 g barcodes', () => {
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
```

`tests/data.test.js`

```js
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
  assert.equal(data.moments.length, 4);
  assert.equal(data.channels.length, 5);
  assert.equal(data.expos.length, 5);
  assert.ok(data.reviews.every((r) => r.sample === true), 'reviews are marked as samples');
  assert.equal(data.media.reels.length, 6);
});

for (const site of SITES) {
  test(`[${site}] every asset path in data exists`, () => {
    const paths = [];
    const walk = (v) => { if (typeof v === 'string' && /^assets\//.test(v)) paths.push(v); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
    walk(data);
    assert.ok(paths.length > 30);
    for (const p of paths) assert.ok(fs.existsSync(path.join(ROOT, site, p)), `${site}: missing ${p}`);
  });
}
```

(The asset-existence test stays red until Task 3; run it with Task 3.)

- [ ] **Step 2: Run** `node --test tests/core.test.js` → FAIL (`core.money is not a function`).

- [ ] **Step 3: Implement `shared/js/core.js`**

```js
/* ABIN · pure logic shared by both concepts (no DOM). Browser: ABIN.core · Node: globalThis.ABIN.core */
(function (root) {
  'use strict';
  var A = root.ABIN = root.ABIN || {};
  var MAX = 99;
  var cents = function (n) { return Math.round(Number(n) * 100) || 0; };
  var money = function (n) {
    var c = cents(n), neg = c < 0; c = Math.abs(c);
    var whole = String(Math.floor(c / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '-' : '') + 'RM ' + whole + '.' + ('0' + (c % 100)).slice(-2);
  };
  var eanValid = function (code) {
    var s = String(code == null ? '' : code).trim();
    if (!/^\d{13}$/.test(s)) return false;
    var sum = 0;
    for (var i = 0; i < 12; i++) sum += Number(s[i]) * (i % 2 ? 3 : 1);
    return (10 - (sum % 10)) % 10 === Number(s[12]);
  };
  var L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'];
  var G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111'];
  var R = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100'];
  var PAR = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];
  var eanBars = function (code) {
    if (!eanValid(code)) return '';
    var s = String(code).trim(), p = PAR[Number(s[0])], out = '101', i;
    for (i = 1; i <= 6; i++) out += (p[i - 1] === 'L' ? L : G)[Number(s[i])];
    out += '01010';
    for (i = 7; i <= 12; i++) out += R[Number(s[i])];
    return out + '101';
  };
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
  var skuMap = function (data) { var m = {}; skus(data).forEach(function (s) { m[s.id] = s; }); return m; };
  var clamp = function (q) { q = Math.floor(Number(q)); return isFinite(q) && q > 0 ? Math.min(MAX, q) : 0; };
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
    return copy(items).map(function (it) { if (it.id === id) it.qty = q; return it; }).filter(function (it) { return it.qty > 0; });
  };
  var cartRemove = function (items, id) { return copy(items).filter(function (it) { return it.id !== id; }); };
  var cartCount = function (items) { return (items || []).reduce(function (n, it) { return n + it.qty; }, 0); };
  var cartParse = function (raw, validIds) {
    var arr; try { arr = JSON.parse(raw); } catch (e) { return []; }
    if (!Array.isArray(arr)) return [];
    var out = [];
    arr.forEach(function (it) {
      if (!it || typeof it.id !== 'string') return;
      if (validIds && validIds.indexOf(it.id) === -1) return;
      var q = clamp(it.qty); if (!q) return;
      out = cartAdd(out, it.id, q);
    });
    return out;
  };
  var cartLines = function (items, map) {
    return (items || []).filter(function (it) { return map[it.id]; }).map(function (it) {
      var s = map[it.id];
      return { id: it.id, name: s.name, label: s.label, img: s.img, qty: it.qty, unit: s.price, total: cents(s.price) * it.qty / 100, placeholder: s.placeholder };
    });
  };
  var cartSubtotal = function (lines) { return (lines || []).reduce(function (c, l) { return c + cents(l.total); }, 0) / 100; };
  var waLink = function (number, text) { return 'https://wa.me/' + String(number || '').replace(/\D/g, '') + (text ? '?text=' + encodeURIComponent(text) : ''); };
  var mailtoLink = function (to, subject, body) { return 'mailto:' + to + '?subject=' + encodeURIComponent(subject || '') + '&body=' + encodeURIComponent(body || ''); };
  var orderMessage = function (lines, o) {
    o = o || {};
    var rows = ['Hi ABIN! I would like to order Kali Kali:', ''];
    lines.forEach(function (l) { rows.push('• ' + l.qty + ' × ' + l.name + ' ' + l.label.replace(/^\S+\s/, '') + ' — ' + money(l.total)); });
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
    field(rows, 'Business', f.business); field(rows, 'Type', f.type); field(rows, 'Location', f.location);
    if (f.items && f.items.length) { rows.push('Interested in:'); f.items.forEach(function (i) { rows.push('• ' + i.label + ' × ' + i.cartons + ' carton' + (i.cartons == 1 ? '' : 's')); }); }
    field(rows, 'Contact', [f.name, f.phone, f.email].filter(Boolean).join(', ')); field(rows, 'Notes', f.note);
    return rows.join('\n');
  };
  var affiliateMessage = function (f) {
    var rows = ['Hi ABIN! I would like to join the Kali Kali affiliate programme (15% commission).', ''];
    field(rows, 'Name', f.name); field(rows, 'Platform', f.platform); field(rows, 'Handle', f.handle); field(rows, 'Followers', f.followers); field(rows, 'Phone', f.phone);
    return rows.join('\n');
  };
  var helloMessage = function (f) { var rows = ['Hi ABIN!', '']; field(rows, 'Name', f.name); if (f.message) rows.push('', f.message); return rows.join('\n'); };
  var normalize = function (s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9%一-鿿]+/g, ' ').trim();
  };
  var faqSearch = function (faqs, query, cat) {
    var words = normalize(query).split(' ').filter(Boolean);
    return (faqs || []).filter(function (f) {
      if (cat && cat !== 'all' && f.cat !== cat) return false;
      var hay = normalize(f.q + ' ' + f.a);
      return words.every(function (w) { return hay.indexOf(w) > -1; });
    });
  };
  var resolveProduct = function (search, data) {
    var p = new URLSearchParams(search || ''), f = p.get('f'), s = Number(p.get('s'));
    var fl = data.flavours.filter(function (x) { return x.id === f; })[0];
    var sizes = data.sizes.map(function (z) { return z.g; });
    return { flavour: fl ? fl.id : data.flavours[0].id, size: sizes.indexOf(s) > -1 ? s : sizes[sizes.length - 1], valid: !!fl && sizes.indexOf(s) > -1 };
  };
  var quizResult = function (picks, data) {
    var score = {}; data.flavours.forEach(function (f) { score[f.id] = 0; });
    (picks || []).forEach(function (p) { Object.keys(p || {}).forEach(function (k) { if (k in score) score[k] += Number(p[k]) || 0; }); });
    return data.flavours.reduce(function (best, f) { return score[f.id] > score[best] ? f.id : best; }, data.flavours[0].id);
  };
  A.core = { money: money, eanValid: eanValid, eanBars: eanBars, skus: skus, skuMap: skuMap, cartAdd: cartAdd, cartSet: cartSet,
    cartRemove: cartRemove, cartCount: cartCount, cartParse: cartParse, cartLines: cartLines, cartSubtotal: cartSubtotal, waLink: waLink,
    mailtoLink: mailtoLink, orderMessage: orderMessage, tradeMessage: tradeMessage, affiliateMessage: affiliateMessage,
    helloMessage: helloMessage, normalize: normalize, faqSearch: faqSearch, resolveProduct: resolveProduct, quizResult: quizResult };
}(typeof window !== 'undefined' ? window : globalThis));
```

Note: `resolveProduct('?f=cheese', data)` (valid flavour, no size) → `{flavour:'cheese', size:60, valid:false}`; the page
still renders.

- [ ] **Step 4: Write `shared/js/data.js` in full** (all four flavours, claims, certs, ≥14 FAQs across the 5 categories,
  quiz, moments, channels, expos, 6 sample reviews, media lists) from spec §3.
- [ ] **Step 5: Run** `node tools/sync.js && node --test tests/core.test.js` → PASS; `tests/data.test.js` passes except
  the asset-existence tests (Task 3).
- [ ] **Step 6: Commit** `git commit -m "feat: content data and pure logic (cart, messages, EAN-13, FAQ search) with tests"`

---

### Task 3: Asset pipeline (images, video, catalogue, fonts)

**Files:**
- Create: `tools/assets.py`, `tools/fonts.py`
- Output (both sites unless noted): `assets/img/packs/{flavour}-{30,60}.webp` (+`-sm`), `assets/img/packs/variety.webp`,
  `assets/img/sticks/stick-{flavour}.webp` (+ 2 shape variants), `assets/img/kernels/kernel-{1..3}.webp`,
  `assets/img/orbs/{chilli,cheese,corn,nori}.webp`, `assets/img/brand/{logo.webp,logo-sm.webp,favicon.png,apple-touch-icon.png}`,
  `assets/img/certs/{halal,mesti,produk}.webp`, `assets/img/photo/{bowl-hero,bowl-crispy,team,shelf-1,shelf-2,shelf-3}.webp`,
  `assets/img/posters/*.webp`, `assets/img/stills/*.webp`, `assets/video/{reel-1..6}.mp4|.jpg`,
  `assets/video/flavour-{flavour}.mp4|.jpg`, B only: `assets/docs/abin-kali-kali-catalogue.pdf`, `assets/docs/abin-packaging-specs.pdf`;
  fonts into `assets/fonts/`.

**Interfaces:**
- Consumes: source files in `ui images/` and the two PDFs (mapping below).
- Produces: every path referenced by `data.js` and the pages.

Source mapping (`ui images/`): Cheese 60 g `WhatsApp Image 2026-10-06 at 8.03.15 AM.jpeg`; Cheese 30 g `… 8.03.15 AM (1).jpeg`;
Seaweed 60 g `… 8.03.15 AM (2).jpeg`; BM 4-flavour poster `… 8.03.16 AM.jpeg`; Spicy 60 g `… 8.03.16 AM (1).jpeg`;
中文 poster `… 8.03.16 AM (2).jpeg`; Original 60 g `… 8.03.17 AM.jpeg`; team `… 8.03.17 AM (1).jpeg`; Original 30 g
`… 8.03.17 AM (2).jpeg`; Seaweed 30 g `… 8.03.18 AM.jpeg`; Spicy 30 g `… 8.03.19 AM.jpeg`; EN poster `… 8.03.19 AM (1).jpeg`;
shelves `666604394…`, `669043967…`, `669797006…` (Malaysia, RM 8.90), `727178795…`; affiliate poster `706055008…`;
3 PM poster `727621663…`; game night `730854727…`; bold flavour `731328626…`; FB banner `813431997…`;
videos `WhatsApp Video … 8.03.15 AM.mp4` (flat lay), `8.03.17 AM` (falling sticks + lineup), `8.03.18 AM (1)` (kids/family 35 s),
`8.03.18 AM` (family), `8.03.19 AM (1)` (boy with Spicy), `8.03.19 AM` (flavour by flavour). Catalogue: page 1 image
(5185 × 7332 bowl), page 2 single stick (2595 × 984), page 4 image (2329 × 3293 bowl).

- [ ] **Step 1: Write `tools/assets.py`** with these functions (key code):

```python
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter
import fitz, subprocess, io, numpy as np
from rembg import remove, new_session
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'ui images'
SITES = [ROOT / 'site-a-kali-nak-lagi', ROOT / 'site-b-jagung-rangup']
SESSION = new_session('isnet-general-use')

def save(img, rel, quality=84, sites=SITES):
    for s in sites:
        out = s / 'assets' / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        img.save(out, 'WEBP', quality=quality, method=6) if rel.endswith('.webp') else img.save(out)

def cutout(img):
    rgba = remove(img.convert('RGB'), session=SESSION, post_process_mask=True)
    return rgba.crop(rgba.getbbox())

def fit(img, h):
    return img.resize((round(img.width * h / img.height), h), Image.LANCZOS)

def tint_stick(rgba, hue_shift, sat, bright, speckle=None):
    # shift hue of the real spicy stick to make cheese / original / seaweed variants
    a = rgba.getchannel('A'); hsv = np.array(rgba.convert('RGB').convert('HSV')).astype(np.int16)
    hsv[..., 0] = (hsv[..., 0] + hue_shift) % 256
    hsv[..., 1] = np.clip(hsv[..., 1] * sat, 0, 255); hsv[..., 2] = np.clip(hsv[..., 2] * bright, 0, 255)
    out = Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGBA'); out.putalpha(a)
    return out

def video(src, dest, w=540, crf=28, start=None, dur=None, audio=True):
    args = ['ffmpeg', '-v', 'error', '-y']
    if start is not None: args += ['-ss', str(start)]
    args += ['-i', str(src)]
    if dur is not None: args += ['-t', str(dur)]
    args += ['-vf', f'scale={w}:-2', '-c:v', 'libx264', '-crf', str(crf), '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
    args += ['-c:a', 'aac', '-b:a', '96k'] if audio else ['-an']
    for s in SITES:
        out = s / 'assets' / dest; out.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(args + [str(out)], check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(out), '-frames:v', '1', '-q:v', '4', str(out.with_suffix('.jpg'))], check=True)
```

Sections in `main()`: packs (cutout, `fit` to 1100 and 520 high), variety (4 × 30 g packs composed fanned on a
transparent canvas), sticks (catalogue page 2 stick cutout + tints: cheese hue +8 sat 1.05 bright 1.12, original
hue +12 sat .55 bright 1.2, seaweed hue +40 sat .45 bright 1.1 with dark speckles; plus flipped/rotated copies),
kernels (cut from the Original 60 g render), orbs (circle crops of chilli/cheese/corn/nori regions of the 60 g
renders, 360 px), logo (cut from the Original 30 g render top, rembg, then trim; favicon/apple icon on a yellow
rounded square), certs (crop from the EN poster footer), photos (catalogue page 1 and 4 images via PyMuPDF
`extract_image`, resized to 1800 px long edge; team; shelves), posters, stills (ffmpeg frame grabs at chosen
timestamps from the family/kid/lineup videos), reels (`video(..., w=540, crf=28)`), flavour clips from the flavour
video (spicy 0.0–1.7 s, cheese 1.7–3.3 s, original 3.4–6.6 s, seaweed 6.7–8.3 s; muted, w=540), catalogue PDF
recompressed (render pages at 120 dpi JPEG q75 into a new PDF, B only) and packaging sheet copied (B only).

- [ ] **Step 2: Write `tools/fonts.py`**: for each family request `https://fonts.googleapis.com/css2?family=…&display=swap`
  with a Chrome user agent, download the `latin` + `latin-ext` woff2 files into `site-*/assets/fonts/`, and write
  `assets/css/fonts.css` with matching `@font-face` rules (relative `../fonts/...` URLs).
- [ ] **Step 3: Run** `python tools/assets.py && python tools/fonts.py`.
- [ ] **Step 4: Inspect** every cut-out (Read the WebPs): clean edges on packs, stick variants believable, logo crisp
  at 280 px wide. Fix crops/params and re-run until clean.
- [ ] **Step 5: Run** `node --test tests/` → all PASS (asset-existence tests now green).
- [ ] **Step 6: Commit** `git commit -m "feat: asset pipeline (cut-outs, sticks, photos, video, fonts)"`

---

### Task 4: Shared UI glue (`icons.js`, `ui.js`, `shop.js`, `forms.js`)

**Files:** Create `shared/js/icons.js`, `shared/js/ui.js`, `shared/js/shop.js`, `shared/js/forms.js`; then `node tools/sync.js`.

**Interfaces (markup contracts every page in Tasks 5–14 must follow):**
- `ABIN.$(sel, ctx)`, `ABIN.$$(sel, ctx)`; `ABIN.icon(name) → '<svg…>'`; elements `<i data-icon="bag"></i>` are hydrated.
  Icons: bag, plus, minus, close, arrow-right, arrow-up-right, chevron-down, play, sound-on, sound-off, whatsapp, shopee,
  facebook, instagram, tiktok, linkedin, mail, phone, pin, leaf, wheat-off, flask-off, heart, corn, halal, search, menu,
  download, star, check, clock, truck, store, utensils, gift, globe.
- `ABIN.ui.open(dialogEl)`, `ABIN.ui.close()` — dialogs are `<dialog class="dlg" id="…">`; open adds `html.is-locked`,
  calls `ABIN.lenis && ABIN.lenis.stop()`, sets `is-open`; close plays `is-closing` (CSS, 280 ms) then `close()`, restores
  focus and Lenis. Re-entrant safe (close while closing is a no-op; open while closing finishes the close first).
- Delegated clicks: `[data-open="dlg-id"]`, `[data-close]`, `[data-lightbox="path"]` (+ `data-type="video"`, `data-caption`),
  `[data-info="claims:plant" | "certs:halal"]` (fills `#dlg-info` from data), `[data-menu-toggle]` (`html.is-menu-open`).
- `video[data-hover-play]`: plays muted on pointerenter (fine pointer) or when ≥60% in view (touch); pauses otherwise.
- `ABIN.ui.toast(text)` into `.toasts[aria-live=polite]`.
- Events: `document` dispatches `abin:add` `{detail:{id, el, img}}` and `abin:bag` `{detail:{count}}`.
- Shop (`shop.js`): `ABIN.bag.{items(),add(id,qty,el),set(id,qty),remove(id),clear(),count(),lines(),subtotal()}`; storage key from
  `<html data-store="abin-a-bag">`. Drawer `#bag` with `[data-bag-list]`, `[data-bag-subtotal]`, `[data-bag-empty]`,
  `[data-bag-checkout]` (WhatsApp link), `[data-bag-count]` (all badges), `<template id="tpl-bag-line">`.
  Cards: containers `[data-products="all|featured|bundles"]` + `<template id="tpl-card">` with `[data-slot=name|label|price|img|badge|kcal|diet|bm|tagline]`,
  `[data-add]`, `[data-quick]`, `[data-size] button[data-g]`; card gets `data-sku`, `data-flavour`, `data-tags`, and inline
  `--c`, `--c-pop`, `--c-deep`, `--c-tint`, `--c-on`. Filters `[data-filter]` (`all|spicy|mild|vegan|vegetarian|30|60|bundle`),
  sort `[data-sort]` (`popular|price-asc|price-desc`). Quick view `#dlg-quick` with `[data-q=…]` slots; `shop.html#spicy`
  opens Spicy. Product page `body.page-product` fills `[data-pp=…]` slots from `core.resolveProduct(location.search)`
  and sets the theme variables on `<html>`. Trade mode (B): `[data-mode] button[value=retail|trade]` sets
  `html[data-mode]`; `[data-trade-list]` + `<template id="tpl-trade">`; barcodes drawn into `svg[data-ean]`;
  enquiry list in `sessionStorage['abin-b-enquiry']`, `[data-enquiry-count]`, `[data-enquiry-send]` → contact page
  trade form prefilled via `contact.html?enquiry=spicy-30:5,cheese-30:2#trade`.
- Forms (`forms.js`): `form[data-form=hello|trade|affiliate|order]`; on submit validate (`required`, email, tel) with inline
  `.field-error`, build the message with `core.*Message`, open `core.waLink(data.links.waNumber, msg)` in a new tab,
  or `core.mailtoLink` when `[name=channel][value=email]` is checked; show `[data-form-done]`. FAQ: `[data-faq-list]`
  + `<template id="tpl-faq">` (`<details>`), `[data-faq-search]`, `[data-faq-cat]`, `[data-faq-empty]`, `[data-faq-count]`.
  Quiz (A): `[data-quiz]` + steps from `data.quiz`, result card → `[data-quiz-result]`.

- [ ] **Step 1:** Write the four files against the contracts above (ES5 style, IIFEs, `'use strict'`, attach to `window.ABIN`).
- [ ] **Step 2:** `node tools/sync.js && node --test tests/` → PASS (sync + file:// safety).
- [ ] **Step 3: Commit** `git commit -m "feat: shared UI (dialogs, lightbox, bag, cards, filters, quick view, forms, FAQ, quiz)"`

---

### Task 5: Concept A design system, chrome and motion core

**Files:** `src/site-a/layout.html`, `src/site-a/partials/{head,loader,header,menu,footer,bag,dialogs,mascot,scripts,templates}.html`,
`site-a-kali-nak-lagi/assets/css/{base,chrome}.css`, `site-a-kali-nak-lagi/assets/js/fx.js`

**Interfaces:**
- CSS tokens (`base.css :root`): `--cream #FFF8E6 --sun #FFD21E --amber #F6A800 --orange #FF7A1A --blue #1F45C8 --leaf #5DB33A
  --ink #2B1408 --spicy #E8402A --cheese #FFC21A --original #FFE7A3 --seaweed #2F6FE4 --nori #8BD449 --jelly cubic-bezier(.34,1.56,.64,1)`;
  fonts `--f-display: Anton`, `--f-body: Rubik`, `--f-hand: 'Caveat Brush'`. Buttons `.btn .btn--sun|--orange|--white|--ink-line`,
  `.btn--sm|--lg`, jelly hover keyframes. Utilities `.wrap`, `.dots` (dotted grid bg), `.wave-top/.wave-bottom` (SVG mask edges),
  `.sticker`, `.tape`, `.squiggle`, `.sparkle`.
- `fx.js` exposes `ABIN.fx.{scrollTo(el), popIn(els), burst(el, colors)}` and runs: Lenis (lerp .12) + ScrollTrigger sync;
  header `is-scrolled`; circle wipe transitions (`.wipe`, guard `leaving`, `sessionStorage['abin-a-wipe']`, file:// allowed);
  first-visit loader (`html.is-loading` set inline only when `sessionStorage['abin-a-seen']` is missing); `[data-pop]` batch;
  `[data-split]` char drops; `[data-count]` counters; `.marquee__row` velocity skew; `[data-float]` idle bob; `[data-par]`
  parallax; listens to `abin:add` → fly-to-bag arc + bag jelly bump; reduced-motion short-circuits all of it.
- Mascot `.kali` (inline SVG corn stick with face) fixed bottom-right with speech bubble `[data-kali-say]`.

- [ ] **Step 1:** Author tokens, typography, buttons, chrome partials (announcement marquee bar, floating pill header with
  logo/links/sound/bag, full-screen yellow menu for ≤900 px, wavy footer with giant "KALI KALI" + socials + certs, bag
  drawer, dialogs: `#dlg-quick`, `#dlg-info`, `#dlg-lightbox`, templates) and `fx.js`.
- [ ] **Step 2:** Build, serve (`python -m http.server 8811`), open `site-a-kali-nak-lagi/index.html` stub: loader plays
  once per session, header/menu/bag/dialog open and close, wipe navigates to `shop.html` (stub) and back, no console errors.
- [ ] **Step 3: Commit** `git commit -m "feat(a): design system, chrome and motion core"`

---

### Task 6: Concept A Crunch Field + home hero

**Files:** `site-a-kali-nak-lagi/assets/js/crunch.js`, `src/site-a/pages/index.html` (hero), `assets/css/pages.css`

**Interfaces:** `ABIN.Crunch(canvas, {host, count, hover})`; canvas `[data-crunch="22"]` inside `[data-crunch-host]`;
sound key `localStorage['abin-a-sound']`; sound button `.nav__sound[aria-pressed]`.

Key code (crunch.js core loop and snap):

```js
function Stick(field, y) {
  var img = field.sprites[(Math.random() * field.sprites.length) | 0];
  var len = field.minL + Math.pow(Math.random(), 1.6) * (field.maxL - field.minL);
  return { img: img, x: Math.random() * field.w, y: y == null ? Math.random() * field.h : y, len: len, h: len * img.height / img.width,
    rot: Math.random() * 6.28, vr: (Math.random() - .5) * .012, vy: -(.18 + Math.random() * .5), ph: Math.random() * 6.28, alive: true, born: y == null ? 0 : 1 };
}
// snap: replace one stick with two halves that spin apart + crumbs + comic word, then respawn below
Field.prototype.snap = function (s, loud) {
  s.alive = false;
  var half = s.len / 2, c = Math.cos(s.rot), d = Math.sin(s.rot);
  [-1, 1].forEach(function (k) { this.halves.push({ img: s.img, side: k, x: s.x + c * half / 2 * k, y: s.y + d * half / 2 * k, rot: s.rot,
    vr: k * (.06 + Math.random() * .06), vx: c * k * (1.5 + Math.random()), vy: d * k * (1.5 + Math.random()) - 2, len: s.len, h: s.h, life: 1 }); }, this);
  for (var i = 0; i < 14; i++) { var a = Math.random() * 6.28, sp = 1 + Math.random() * 4;
    this.crumbs.push({ x: s.x, y: s.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, r: 1.5 + Math.random() * 3.5, c: this.crumbColor, life: 1 }); }
  if (s.len > 90 && Math.random() < .6) this.words.push({ x: s.x, y: s.y, t: WORDS[(Math.random() * WORDS.length) | 0], life: 1 });
  crunchSound(loud ? 1 : .7);
  var self = this; setTimeout(function () { var i = self.sticks.indexOf(s); if (i > -1) self.sticks[i] = Stick(self, self.h + 120); }, 700 + Math.random() * 1500);
};
// halves are drawn with ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.beginPath(); ctx.rect(k<0 ? -len/2 : 0, -h/2, len/2, h); ctx.clip(); ctx.drawImage(img, -len/2, -h/2, len, h); ctx.restore();
function crunchSound(gain) { // filtered white-noise burst, ~120 ms, two quick cracks
  if (!soundOn || !gestured) return;
  var ac = AC || (AC = new (window.AudioContext || window.webkitAudioContext)());
  [0, .045].forEach(function (t0, i) {
    var len = .09, buf = ac.createBuffer(1, ac.sampleRate * len, ac.sampleRate), ch = buf.getChannelData(0);
    for (var j = 0; j < ch.length; j++) ch[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / ch.length, 3);
    var src = ac.createBufferSource(), bp = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = 1800 + Math.random() * 1600; bp.Q.value = .9;
    g.gain.value = .5 * gain * (i ? .7 : 1); src.connect(bp); bp.connect(g); g.connect(ac.destination); src.start(ac.currentTime + t0);
  });
}
```

Hero markup: `.hero.dots[data-crunch-host]` › `canvas.crunch[data-crunch="22"]`, `.hero__pill`, `h1.hero__title` (lines
"KALI CUBA," / "KALI NAK LAGI!" split into `.ltr` spans), `.hero__note` (Caveat: "Try once, want it again!"), lead, CTAs
(`Shop the crunch` → shop.html, `Find your flavour` → `#quiz`), trust row, `.stage` (yellow blob, 4 packs fanned
`.stage__pack--spicy…` each `[data-quick]`, 4 orbs `.sticker-wrap` with labels, spinning "0% TRANS FAT · PLANT-BASED"
ring), `.hero__hint` "Psst! Tap the sticks".

- [ ] **Step 1:** Implement crunch.js (field, sprites from `data.flavours[].img.stick` + kernels, hover/tap snap, spawn on
  empty tap, words, crumbs, sound, IntersectionObserver pause, `visibilitychange` pause, DPR ≤ 2, reduced motion → one static frame).
- [ ] **Step 2:** Hero markup + CSS + hero entrance in fx.js (letters elastic drop, packs rise, orbs pop, idle floats,
  pointer parallax, hero copy fade on scroll).
- [ ] **Step 3:** Verify at 1440 and 390: sticks visible behind copy without hurting legibility, hover snaps (desktop),
  tap snaps (mobile emulation), sound toggle persists, 55+ fps in Performance (no long tasks > 50 ms during idle).
- [ ] **Step 4: Commit** `git commit -m "feat(a): Crunch Field and home hero"`

---

### Task 7: Concept A home sections + pinned flavour scene

**Files:** `src/site-a/pages/index.html`, `assets/css/pages.css`, `assets/js/scenes.js`

Sections (spec §5 Home) with hooks: `.marquee` (2 rows), `#flavours.flav[data-flav-scene]` › `.flav__pin` (tabs
`.flav-switch button[data-f]` + jelly thumb, copy panels `[data-panel-f]`, pack stack `.flav__pack img[data-f]`, outlined
word `.flav__word`, orbs `[data-orbs-f]`, progress `.flav__progress i`), `.kernels` (6 `button.kernel[data-info="claims:id"]`),
`.stats` (`[data-count]`), `#shop-picks [data-products="featured"]`, `.moments` (4 taped cards `button[data-lightbox]` incl.
`.clock` with `.clock__hand` scrubbed to 3:00), `.reels` (6 `video[data-hover-play]` cards → lightbox), `#quiz [data-quiz]`
with mascot, `.fan` shelf/team photos (lightbox), `.aff` (affiliate 15%, phone card with poster, 4 who cards, WhatsApp CTA),
`.trade-band` (5 channel chips → `contact.html#wholesale`), `.reviews` (98% + sample cards), `.insta` (8 posters → lightbox).

Pinned scene (scenes.js): ScrollTrigger pin `.flav__pin`, `end: '+=300%'`, progress → index `Math.min(3, floor(p*4))`;
`setFlavour(id)` updates `section.style.setProperty('--bg', color.pop)` (GSAP colour tween), flips packs
(`rotateY 90 → 0`, elastic), animates orbs/panel/word, fills progress bars; tab click scrolls Lenis to the state's
midpoint; below 900 px or reduced motion: no pin, tabs switch states directly.

- [ ] **Step 1:** Markup + CSS for all sections; **Step 2:** scenes.js (flavour scene, clock, moment card tilt, fan rise);
- [ ] **Step 3:** Verify: scroll through scene shows 4 colours/packs in order, tabs jump, no overflow at 390, every card/image opens something;
- [ ] **Step 4: Commit** `git commit -m "feat(a): home sections and pinned flavour scene"`

---

### Task 8: Concept A Shop + Product

**Files:** `src/site-a/pages/{shop,product}.html`, `assets/css/pages.css`

Shop: `.shop-hero` yellow wavy card "4 FLAVOURS. 1 CRUNCH." + fanned packs + floating sticks; filter pills
`[data-filter]` (All, Spicy, Not spicy, Vegan-friendly, Vegetarian, 30 g, 60 g, Bundles) + `[data-sort]`; grid
`[data-products="all"]`; trade carton card → `contact.html#wholesale`; "How ordering works" 3 steps. Product:
`body.page-product` themed via `--c-*`; `[data-pp]` slots (name, bm, zh, tagline, blurb, price, kcal, daily, diet, badge,
pack img, clip video, barcode), size switch, qty stepper, Add (`[data-pp-add]`), Shopee link, orbs, claim chips
(`[data-info]`), nutrition card, pairs-with (3 other flavours → product links), next-flavour colour wipe link.

- [ ] **Step 1:** Markup + CSS; **Step 2:** verify filters (each filter shows the right count: Spicy 2, Not spicy 6 + bundle
  excluded, Vegan 4, Vegetarian 4, 30 g 4, 60 g 4, Bundles 1), sort works, quick view from `shop.html#seaweed`, product
  page for each flavour and for `?f=banana` (falls back to Spicy 60 g), add → bag count, WhatsApp link decodes to the bag;
- [ ] **Step 3: Commit** `git commit -m "feat(a): shop and product pages"`

---

### Task 9: Concept A About, Benefits, FAQ, Contact

**Files:** `src/site-a/pages/{about,benefits,faq,contact}.html`, `assets/css/pages.css`, `assets/js/scenes.js` (small additions)

Per spec §5. Hooks: About `.values details` (numbered accordion), `.journey` timeline items, `.certs [data-info="certs:id"]`;
Benefits `.tabs[role=tablist]` (6 claims, `aria-selected`, panel swap with jelly), `.cob` steps with SVG path drawn by
scroll (`stroke-dashoffset` scrub), `.kcal-bars [data-kcal]` animated widths; FAQ `[data-faq-search]`, `[data-faq-cat]`,
`[data-faq-list]`; Contact cards, `#wholesale`, `#affiliate`, `#hello` forms (`data-form`), map iframe
(`https://maps.google.com/maps?q=...&output=embed`, `loading="lazy"`), socials, areas.

- [ ] **Step 1:** Markup + CSS; **Step 2:** verify FAQ search ("halal" → ≥1, "zzz" → empty state), each form validates and
  produces a WhatsApp URL whose decoded text contains the inputs, hash `#affiliate` scrolls to the form;
- [ ] **Step 3: Commit** `git commit -m "feat(a): about, benefits, faq and contact pages"`

---

### Task 10: Concept B design system, chrome and motion core

**Files:** `src/site-b/layout.html`, `src/site-b/partials/{head,veil,header,menu,footer,bag,dialogs,cursor,scripts,templates}.html`,
`site-b-jagung-rangup/assets/css/{base,chrome}.css`, `site-b-jagung-rangup/assets/js/fx.js`

**Interfaces:** tokens `--paper #F6F3EC --white #FFFFFF --ink #15120E --muted #5B554D --line #DDD6C8 --abin #FFD21E`, tints
`--t-spicy #F6DCD6 --t-cheese #FBEBC2 --t-original #F2ECDB --t-seaweed #DCE5F2`, packs `--p-spicy #8E1B1B --p-cheese #E9A91E
--p-original #C9B98F --p-seaweed #14284B`; fonts `--f-display: Archivo`, `--f-body: Geist`, `--f-mono: 'Geist Mono'`,
`--f-serif: 'Instrument Serif'`. Buttons `.btn .btn--abin|--ink|--line`, `.tag` mono pills, `.idx` index labels.
`fx.js` → `ABIN.fx.{scrollTo, rise}`; Lenis (lerp .1); header hide-on-down/show-on-up; veil transitions (`.veil`,
`clip-path inset`, guard `leaving`, `sessionStorage['abin-b-veil']`); first visit: veil with counter `[data-veil-count]`
000→100 and a stick line drawing; ring cursor `.cursor` (fine pointer) with label from `[data-cursor="View"]`; reveals
`[data-rise]`, `[data-unmask]`, `[data-lines]`; counters; `[data-par]`; fly-to-bag on `abin:add`.

- [ ] **Step 1:** Author tokens, type, buttons, chrome (thin top bar with mono claims, header with logo/mono links/Trade/bag,
  menu overlay, yellow footer panel with giant KALI KALI wordmark + rising pack + link columns), dialogs, fx.js.
- [ ] **Step 2:** Verify on the stub (veil once per session, transitions, cursor labels, bag/dialog open/close, no errors).
- [ ] **Step 3: Commit** `git commit -m "feat(b): design system, chrome and motion core"`

---

### Task 11: Concept B travelling pack + home hero

**Files:** `site-b-jagung-rangup/assets/js/travel.js`, `src/site-b/pages/index.html` (hero + slots), `assets/css/pages.css`

**Interfaces:** `.traveller` fixed layer (`img` per flavour, `.traveller__shadow`); slots `[data-slot="hero|statement|anatomy|nutrition|taste"]`
(empty sized boxes in sections); `ABIN.travel.setFlavour(id)`; at `taste` the pack bursts (`.burst` sticks via GSAP) and the pack
fades; scrolling back above `taste` reforms it. Mobile (< 900 px) uses only `hero` and `taste`; reduced motion: static packs in
each slot, no traveller.

Key code (interpolation like bloops B):

```js
function frame() {
  var info = slots.map(function (el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, s: r.height, doc: r.top + scrollY + r.height / 2 }; });
  var S = scrollY, anchors = info.map(function (s, i) { return i === 0 ? 0 : s.doc - innerHeight / 2; }), i = 0;
  while (i < anchors.length - 1 && S >= anchors[i + 1]) i++;
  var a = info[i], b = info[Math.min(i + 1, info.length - 1)], t = i >= anchors.length - 1 ? 0 : ease(clamp01((S - anchors[i]) / Math.max(1, anchors[i + 1] - anchors[i])));
  var x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t, h = a.s + (b.s - a.s) * t;
  spin += (vel * .02 - spin) * .1;                      // velocity-driven 3D turn
  pack.style.transform = 'translate3d(' + (x - h * .36) + 'px,' + (y - h / 2) + 'px,0) rotateY(' + (t * 180 + spin * 40) + 'deg) rotateZ(' + (Math.sin(t * Math.PI) * -12) + 'deg)';
  pack.style.height = h + 'px';
  requestAnimationFrame(frame);
}
```

Hero: grid paper bg, corner mono labels, `h1` giant "KALI KALI" (Archivo wdth 125, weight 800, `clamp(5rem, 17vw, 17rem)`),
orbiting sticks `.orbit img` (GSAP rotation on an ellipse with depth scale/blur), vertical flavour selector
`.picker button[data-f]` (sets tint + traveller flavour + labels), CTAs.

- [ ] **Step 1:** travel.js + hero; **Step 2:** verify traveller follows slots smoothly in both scroll directions, bursts at
  taste, reforms on scroll up, no jank, mobile path; **Step 3: Commit** `git commit -m "feat(b): travelling pack and home hero"`

---

### Task 12: Concept B home sections

**Files:** `src/site-b/pages/index.html`, `assets/css/pages.css`, `assets/js/scenes.js`

Sections (spec §6 Home) with hooks: `.statement [data-lit]` (words lit by scrub, inline `.pill-img`), `.anatomy` (pack slot +
`svg.callouts path` drawn via `stroke-dashoffset`, `button.callout[data-info]`), `.reveal-full` (clip-path inset → 0 scrub),
`.nutrition` (`[data-nut-f]` switch, `[data-roll]` number roll), `.claims-marquee`, `.range [data-products="featured"]`,
`.day[data-day]` pinned horizontal (`.day__track`, panels with `--bg`, `.day__bar li` segments), `.method` cards 01–04,
`.taste` (slot + headline + CTA), `.partner` (`.channels li[data-img]` + `.hover-img` follower, stats, catalogue download
`assets/docs/abin-kali-kali-catalogue.pdf`, enquiry CTA), `.reels`, `.quotes` (cycle + list), `.expos` marquee.

- [ ] **Step 1:** Markup + CSS; **Step 2:** scenes.js (lit statement, callouts, full reveal, nutrition roll, day pin, channel
  hover image, quote cycle); **Step 3:** verify at 1440/390, every clickable opens something; **Step 4: Commit**
  `git commit -m "feat(b): home sections"`

---

### Task 13: Concept B Shop (Retail/Trade) + Product

**Files:** `src/site-b/pages/{shop,product}.html`, `assets/css/pages.css`

Shop: `h1` "The range." + mono meta; `[data-mode]` switch; retail grid `[data-products="all"]` + chips + sort; trade list
`[data-trade-list]` (SKU cards: pack, name, barcode `svg[data-ean]`, weight, shelf life, carton, `Add to enquiry` with carton
stepper), sticky enquiry bar (`[data-enquiry-count]`, `[data-enquiry-send]`). Quick view with label zoom (`.zoom` lens follows
pointer, background-size 220%). Product: split hero, zoom lens, specs table with barcode, nutrition card, flavour clip, moment
pairing, other flavours, next flavour.

- [ ] **Step 1:** Markup + CSS; **Step 2:** verify trade mode renders 8 SKUs with scannable-looking barcodes (95 modules), enquiry
  carries to `contact.html?enquiry=…#trade` prefilled, retail filters/sort, quick view zoom, `?f=banana` fallback;
- [ ] **Step 3: Commit** `git commit -m "feat(b): shop with retail/trade modes and product page"`

---

### Task 14: Concept B About, Benefits, FAQ, Contact

**Files:** `src/site-b/pages/{about,benefits,faq,contact}.html`, `assets/css/pages.css`, `assets/js/scenes.js`

Per spec §6. Hooks: About arch `[data-unmask]` team photo, `[data-lit]` story, `.timeline` items, counters, certs `[data-info]`;
Benefits `.inout` (strike-through lines animated `scaleX`), `.circles button[data-info]`, sticky `.deep` claims, `.kcal-bars`;
FAQ sticky aside (search, categories) + hairline `<details>`; Contact segmented `[role=tablist]` forms (Trade with SKU checklist +
cartons, Affiliate, Hello), cards, map, socials; reads `?enquiry=` to prefill the trade form.

- [ ] **Step 1:** Markup + CSS; **Step 2:** verify search, tabs, forms → WhatsApp/mailto URLs, enquiry prefill;
- [ ] **Step 3: Commit** `git commit -m "feat(b): about, benefits, faq and contact pages"`

---

### Task 15: Chooser page, READMEs, credits

**Files:** `index.html`, `assets/{preview-a.webp,preview-b.webp,logo-sm.webp,favicon.png}`, `README.md`,
`site-a-kali-nak-lagi/{README,CREDITS}.md`, `site-b-jagung-rangup/{README,CREDITS}.md`

Chooser: light split screen, ABIN logo, two concept cards (preview screenshot, name, one-line feel, palette dots, "Open
concept" buttons), hover tilt and colour wash per concept. READMEs follow the bloopsbaby format (open locally, concept table,
what is real, placeholders to replace, notes, folder map, commands: `node tools/pages.js`, `node tools/sync.js`,
`python tools/assets.py`, `node --test tests/`).

- [ ] **Step 1:** Capture previews with Playwright (1440 × 900 hero of each concept → WebP 1200 px); **Step 2:** write chooser +
  docs; **Step 3:** `node --test tests/` PASS; **Step 4: Commit** `git commit -m "docs: chooser page, READMEs and credits"`

---

### Task 16: Verification sweep and fixes

- [ ] **Step 1:** `node --test tests/` → all PASS.
- [ ] **Step 2:** Serve over HTTP; for each of the 14 pages at 1440 × 900 and 390 × 844: load, scroll to the bottom in steps,
  screenshot sections, assert `document.documentElement.scrollWidth <= innerWidth + 1`, collect console errors (must be 0).
- [ ] **Step 3:** Interaction checks per site: quick view open/close ×5 rapidly (scroll unlocks), add 3 items → bag count 3
  → checkout link decodes to the order, lightbox image + video, FAQ search, form submit → WhatsApp URL, nav link double-click
  mid-transition (lands on the page once, no stuck veil/wipe), B trade mode + enquiry.
- [ ] **Step 4:** Reduced motion (`emulateMedia({reducedMotion:'reduce'})`): all content visible, no pins, no canvas loop.
- [ ] **Step 5:** `file://` smoke: open both `index.html` files from disk, navigate to shop, add to bag, open product page.
- [ ] **Step 6:** Fix everything found, re-run, then `git commit -m "fix: verification sweep"`; remove `.playwright-mcp/`.
