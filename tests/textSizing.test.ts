import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitTextSize } from '../src/utils/textSizing';
import { fitWizardDesign, generateWizardDesigns } from '../src/utils/wizardDesigns';
import { renderBetaflightCanvas } from '../src/utils/canvasRenderer';
import { PILOT_GOOGLE_FONTS } from '../src/data/fonts';

function context() {
  const rendered: string[] = [];
  const measured: string[] = [];
  const ctx = new Proxy({
    font: '',
    measureText(text: string) {
      measured.push(text);
      const size = Number(this.font.match(/([\d.]+)px/)?.[1] || 10);
      return { width: [...text].reduce((sum, c) => sum + (c === 'W' ? 0.9 : c === 'i' ? 0.2 : 0.55) * size, 0) };
    },
    fillText(text: string) { rendered.push(text); },
    getImageData() { return { data: new Uint8ClampedArray(288 * 72 * 4) }; },
  }, { get(target, property) { return property in target ? target[property as keyof typeof target] : () => {}; } });
  return { ctx: ctx as unknown as CanvasRenderingContext2D, rendered, measured };
}

test('long names shrink; short names use the larger available size', () => {
  const { ctx } = context();
  const base = generateWizardDesigns('Ace', '', [PILOT_GOOGLE_FONTS[0]], () => 0.99)[0];
  const short = fitWizardDesign(base, ctx);
  const long = fitWizardDesign({ ...base, callsign: 'A very long pilot callsign' }, ctx);
  assert.equal(short.fontSize, 48);
  assert.ok(long.fontSize < short.fontSize);
  const narrow = fitTextSize(ctx, 'iiiiiiiiii', 40, 'Test', '400', 246);
  const wide = fitTextSize(ctx, 'WWWWWWWWWW', 40, 'Test', '400', 246);
  assert.ok(wide < narrow, 'Sizing uses glyph width, not just character count');
});
test('mixed case is preserved in wizard fitting and in both rendered lines', () => {
  const { ctx, rendered, measured } = context();
  const design = generateWizardDesigns('SkyFox', 'Fly free', [PILOT_GOOGLE_FONTS[0]], () => 0.3)[0];
  const fitted = fitWizardDesign({ ...design, frameStyle: 'none', textEffect: 'none', italic: false }, ctx);
  renderBetaflightCanvas({ getContext: () => ctx } as any, fitted);
  assert.deepEqual(rendered, ['SkyFox', 'Fly free']);
  assert.ok(measured.includes('SkyFox'));
  assert.ok(!measured.includes('SKYFOX'));
});
