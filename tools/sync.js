// Copies the shared scripts into each self-contained site folder.
// Edit shared/js/*, then run from the project root: node tools/sync.js
const fs = require('node:fs');
const path = require('node:path');
const { SITES } = require('./pages.js');

const ROOT = path.join(__dirname, '..');
const SHARED_FILES = ['data.js', 'core.js', 'icons.js', 'ui.js', 'shop.js', 'forms.js',
  'vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js', 'vendor/SplitText.min.js', 'vendor/lenis.min.js'];

function sync() {
  const done = [];
  for (const dir of Object.values(SITES)) {
    for (const rel of SHARED_FILES) {
      const from = path.join(ROOT, 'shared', 'js', rel);
      if (!fs.existsSync(from)) continue;
      const to = path.join(ROOT, dir, 'assets', 'js', rel);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      done.push(path.relative(ROOT, to));
    }
  }
  return done;
}

module.exports = { SHARED_FILES, sync };
if (require.main === module) console.log(sync().join('\n'));
