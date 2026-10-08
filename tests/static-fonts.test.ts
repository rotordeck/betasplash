import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { FONT_CATALOG } from '../src/data/fontCatalog';
import { PILOT_GOOGLE_FONTS } from '../src/data/fonts';

test('snapshot has 40 distinct families evenly distributed across five styles', () => {
  assert.equal(FONT_CATALOG.length, 40);
  assert.equal(new Set(FONT_CATALOG.map(f => f.name)).size, 40);
  for (const style of ['racing', 'cyberpunk', 'pixel', 'military', 'clean']) {
    assert.equal(FONT_CATALOG.filter(f => f.category === style).length, 8);
  }
});
test('every preset font has matching snapshot metadata and a public font face', () => {
  const css = readFileSync('src/data/fontFaces.css', 'utf8');
  for (const font of PILOT_GOOGLE_FONTS) {
    const name = font.family.split("'")[1];
    const entry = FONT_CATALOG.find(f => f.name === name);
    assert.ok(entry, name);
    assert.equal(entry.weight, font.weight);
    assert.ok(css.includes(entry.url));
  }
  for (const font of FONT_CATALOG) {
    const url = new URL(font.url);
    assert.equal(url.origin, 'https://fonts.gstatic.com');
    assert.equal(url.search, '');
    assert.ok(font.tags.length >= 2);
  }
});
test('production assets contain neither API calls nor Google API keys', () => {
  for (const file of readdirSync('dist/assets')) {
    if (!/\.(js|css)$/.test(file)) continue;
    const source = readFileSync(`dist/assets/${file}`, 'utf8');
    assert.ok(!source.includes('/api/fonts'), file);
    assert.ok(!source.includes('GOOGLE_FONTS_API_KEY'), file);
    assert.ok(!/AIza[0-9A-Za-z_-]{35}/.test(source), file);
    assert.ok(!source.includes('webfonts/v1/webfonts'), file);
  }
});
