import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateWizardDesigns, fitWizardDesign } from '../src/utils/wizardDesigns';
import { PILOT_GOOGLE_FONTS } from '../src/data/fonts';

test('42 ideas preserve text, use only chosen fonts, and balance all seven frames', () => {
  const fonts = PILOT_GOOGLE_FONTS.slice(0, 3);
  const designs = generateWizardDesigns('  MY TAG  ', 'small line', fonts, () => 0.3);
  assert.equal(designs.length, 42);
  for (const design of designs) {
    assert.equal(design.callsign, 'MY TAG');
    assert.equal(design.subtitle, 'small line');
    assert.ok(fonts.includes(design.font));
    assert.equal(design.emblem, 'none');
    assert.equal(design.emblemPosition, 'none');
    assert.equal(design.useCustomImage, false);
  }
  for (const font of fonts) assert.equal(designs.filter(d => d.font === font).length, 14);
  assert.equal(new Set(designs.map(d => d.frameStyle)).size, 7);
  assert.equal(new Set(designs.map(d => JSON.stringify(d))).size, 42);
});
test('supports a single font and an omitted subtitle, rejects empty selections', () => {
  assert.equal(generateWizardDesigns('PILOT', '', [PILOT_GOOGLE_FONTS[0]]).length, 42);
  assert.throws(() => generateWizardDesigns(' ', '', PILOT_GOOGLE_FONTS));
  assert.throws(() => generateWizardDesigns('PILOT', '', []));
});
test('long text is fitted into the design without changing the content', () => {
  const design = generateWizardDesigns('A LONG PILOT NAME', 'A LONG SUBTITLE', [PILOT_GOOGLE_FONTS[0]])[0];
  const fitted = fitWizardDesign(design, { font: '', measureText: () => ({ width: 600 }) } as any);
  assert.ok(fitted.fontSize < design.fontSize);
  assert.ok(fitted.subtitleSize < design.subtitleSize);
  assert.equal(fitted.callsign, design.callsign);
  assert.equal(fitted.subtitle, design.subtitle);
});
