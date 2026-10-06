// Static page generator: src/<site>/layout.html + partials/*.html + pages/*.html -> <site folder>/*.html
// Edit the files in src/, then run from the project root: node tools/pages.js
// Page files start with a JSON comment: <!--{"title": "...", "description": "...", "bodyClass": "...", "scripts": ["crunch"]}-->
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
  const base = name.replace(/\.html$/, '');
  const meta = Object.assign({ page: base, nav: base }, page.meta);
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
  if (fs.existsSync(pdir)) {
    for (const f of fs.readdirSync(pdir)) if (f.endsWith('.html')) partials[f.slice(0, -5)] = fs.readFileSync(path.join(pdir, f), 'utf8');
  }
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
