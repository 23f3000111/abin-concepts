// Generator + built-page integrity. Run from the project root: node --test tests/
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
  const html = gen.render(layout, partials, { meta: { title: 'Shop & "more"', nav: 'shop', scripts: ['crunch'] }, body: '<p>x</p>' }, 'shop.html');
  assert.match(html, /<title>Shop &amp; &quot;more&quot;<\/title>/);
  assert.match(html, /data-nav="shop" aria-current="page"/);
  assert.doesNotMatch(html, /data-nav="home" aria-current/);
  assert.match(html, /<main id="main"><p>x<\/p><\/main>/);
  assert.match(html, /<script defer src="assets\/js\/crunch\.js"><\/script>/);
});

test('render fails loudly on an unknown partial', () => {
  assert.throws(() => gen.render('{{> nope}}', {}, { meta: {}, body: '' }, 'x.html'), /Unknown partial: nope/);
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
