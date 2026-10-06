// Each self-contained site carries an exact copy of the shared scripts. Run: node --test tests/
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
